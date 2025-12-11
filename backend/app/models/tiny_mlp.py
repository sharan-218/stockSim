import numpy as np
from numba import njit, prange
import app.utils.tunehyperparameters 


def _prepare_returns(prices, window=50):
    prices = np.asarray(prices, dtype=float)
    n = len(prices)

    if n <= window + 5:
        raise ValueError("Need more data for Tiny MLP (at least window + 5 points).")

    log_prices = np.log(prices + 1e-9)
    returns = np.diff(log_prices)

    X = np.lib.stride_tricks.sliding_window_view(returns, window)
    total = len(returns) - window
    X = X[:total]
    y = returns[window:window + total]

    X_mean = X.mean(axis=0)
    X_std = X.std(axis=0) + 1e-8
    X_norm = (X - X_mean) / X_std

    y_mean = y.mean()
    y_std = y.std() + 1e-8
    y_norm = (y - y_mean) / y_std

    norm = dict(
        X_mean=X_mean,
        X_std=X_std,
        y_mean=y_mean,
        y_std=y_std,
    )

    return X_norm, y_norm, returns, norm


@njit
def _train_tiny_mlp_numba(X, y, hidden_dim, epochs, lr):
    n_samples, input_dim = X.shape

    W1 = 0.01 * np.random.randn(hidden_dim, input_dim)
    b1 = np.zeros(hidden_dim)
    W2 = 0.01 * np.random.randn(1, hidden_dim)
    b2 = np.zeros(1)

    scale = 2.0 / n_samples

    for _ in range(epochs):
        Z1 = X @ W1.T + b1
        H1 = np.tanh(Z1)
        Y = (H1 @ W2.T + b2).reshape(-1)

        err = Y - y
        dY = err.reshape(-1, 1) * scale

        dW2 = dY.T @ H1
        db2 = dY.sum(axis=0)

        dH1 = dY @ W2
        dZ1 = dH1 * (1.0 - H1 * H1)

        dW1 = dZ1.T @ X
        db1 = dZ1.sum(axis=0)

        W1 -= lr * dW1
        b1 -= lr * db1
        W2 -= lr * dW2
        b2 -= lr * db2

    return W1, b1, W2, b2


@njit
def _mlp_forward_numba(W1, b1, W2, b2, X):
    Z1 = X @ W1.T + b1
    H1 = np.tanh(Z1)
    Y = H1 @ W2.T + b2
    return Y.reshape(-1)


@njit(parallel=True)
def _simulate_paths_numba(
    last_price,
    returns,
    steps,
    num_paths,
    window,
    W1,
    b1,
    W2,
    b2,
    X_mean,
    X_std,
    y_mean,
    y_std,
    resid_std,
    max_return
):
    paths = np.empty((num_paths, steps), dtype=np.float64)

    for p in prange(num_paths):
        cur_price = last_price
        cur_window = returns[-window:].copy()

        for t in range(steps):

            feat = (cur_window - X_mean) / X_std
            feat = feat.reshape(1, -1)

            pred_norm = _mlp_forward_numba(W1, b1, W2, b2, feat)[0]
            pred_ret = y_mean + y_std * pred_norm

            noisy_ret = pred_ret + np.random.normal(0.0, resid_std * 0.3)

            if noisy_ret > max_return:
                noisy_ret = max_return
            elif noisy_ret < -max_return:
                noisy_ret = -max_return

            cur_price = cur_price * np.exp(noisy_ret)
            paths[p, t] = cur_price

            for i in range(window - 1):
                cur_window[i] = cur_window[i + 1]
            cur_window[window - 1] = noisy_ret

    return paths




def simulate_tiny_mlp(
    historical,
    horizon_days=60,
    steps=30,
    num_paths=3,
    window=50,
    hidden_dim=32,
    epochs=120,
    max_return=0.08,
    auto_tune=False,           
):
    prices = np.asarray(historical, dtype=float)
    if len(prices) <= window + 5:
        raise ValueError("Not enough data for Tiny MLP.")

    if auto_tune:
        tuned = tune_mlp_hyperparams(
            historical,
            steps=steps,
            horizon_days=horizon_days
        )
        best = tuned["best_params"]

        window      = best["window"]
        hidden_dim  = best["hidden_dim"]
        epochs      = best["epochs"]
        max_return  = best["max_return"]

    X, y, returns, norm = _prepare_returns(prices, window=window)

    W1, b1, W2, b2 = _train_tiny_mlp_numba(
        X, y,
        hidden_dim=hidden_dim,
        epochs=epochs,
        lr=0.01,
    )

    base_preds = _mlp_forward_numba(W1, b1, W2, b2, X)
    resid_norm = y - base_preds
    resid_real = resid_norm * norm["y_std"]
    resid_std = float(np.std(resid_real) + 1e-6)

    last_price = float(prices[-1])
    paths_arr = _simulate_paths_numba(
        last_price,
        returns,
        steps,
        num_paths,
        window,
        W1,
        b1,
        W2,
        b2,
        norm["X_mean"],
        norm["X_std"],
        norm["y_mean"],
        norm["y_std"],
        resid_std,
        max_return,
    )

    return {
        "paths": paths_arr.tolist()
    }
