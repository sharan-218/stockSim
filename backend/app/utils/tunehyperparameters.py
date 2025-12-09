import numpy as np
import app.models.tiny_mlp 
def tune_mlp_hyperparams(
    historical,
    search_window=[30, 40, 50, 60],
    search_hidden=[16, 32, 48],
    search_epochs=[60, 100, 140],
    search_max_return=[0.05, 0.08, 0.10],
    steps=30,
    horizon_days=60
):

    prices = np.asarray(historical, dtype=float)

    best_error = 1e12
    best_cfg = None
    results = []
    log_prices = np.log(prices + 1e-9)
    returns = np.diff(log_prices)
    val_true = returns[-50:]

    for w in search_window:
        if len(prices) <= w + 5:
            continue 
        X, y, _, norm = _prepare_returns(prices, window=w)

        for h in search_hidden:
            for ep in search_epochs:
                W1, b1, W2, b2 = _train_tiny_mlp_numba(
                    X, y,
                    hidden_dim=h,
                    epochs=ep,
                    lr=0.01
                )
                preds_norm = _mlp_forward_numba(W1, b1, W2, b2, X)
                resid_norm = y - preds_norm
                resid_real = resid_norm * norm["y_std"]
                err = float(np.std(resid_real))
                score = err

                results.append({
                    "window": w,
                    "hidden_dim": h,
                    "epochs": ep,
                    "max_return": None,
                    "score": score,
                })

                if score < best_error:
                    best_error = score
                    best_cfg = (w, h, ep)

    w, h, ep = best_cfg

    _, _, _, norm = _prepare_returns(prices, window=w)
    X, y, ret_series, norm = _prepare_returns(prices, window=w)
    
    W1, b1, W2, b2 = _train_tiny_mlp_numba(X, y, h, ep, 0.01)
    preds_norm = _mlp_forward_numba(W1, b1, W2, b2, X)
    resid_real = (y - preds_norm) * norm["y_std"]
    base_std = float(np.std(resid_real))

    best_mr = None
    best_mr_err = 1e12

    for mr in search_max_return:
        
        smooth_err = abs(mr - base_std)
        if smooth_err < best_mr_err:
            best_mr = mr
            best_mr_err = smooth_err

    best_params = {
        "window": w,
        "hidden_dim": h,
        "epochs": ep,
        "max_return": best_mr,
        "horizon_days": horizon_days,
        "steps": steps,
    }

    return {
        "best_params": best_params,
        "best_error": float(best_error),
        "results": results
    }
