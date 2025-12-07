import numpy as np
from pmdarima import auto_arima, ARIMA
from sklearn.ensemble import GradientBoostingRegressor


def choose_arima_model(closes, max_p=6, max_q=6, max_d=2, reject_flat=True):
    closes = np.asarray(closes, dtype=float)

    base_model = auto_arima(
        closes,
        start_p=1, start_q=1,
        min_p=1, min_q=1,
        max_p=max_p, max_q=max_q,
        max_d=max_d,
        seasonal=False,
        stepwise=True,
        error_action="ignore",
        suppress_warnings=True,
        trace=False,
    )

    if not reject_flat or base_model.order != (0, 1, 0):
        return base_model

    forced_orders = [(1, 1, 1), (2, 1, 1), (2, 1, 2), (3, 1, 2)]
    best_model, best_rmse = None, 1e18

    horizon = min(5, len(closes) // 4)
    true_future = closes[-horizon:]
    train = closes[:-horizon]

    for order in forced_orders:
        try:
            m = ARIMA(order=order).fit(train)
            pred = m.predict(n_periods=horizon)
            rmse = np.sqrt(np.mean((true_future - pred) ** 2))
            if rmse < best_rmse:
                best_rmse = rmse
                best_model = m
        except:
            pass

    return best_model or base_model


def build_residual_features(residuals, prices, n_lags=3):
    residuals = np.asarray(residuals)
    prices = np.asarray(prices)
    returns = np.diff(np.log(prices + 1e-9), prepend=prices[0])

    X, y = [], []
    for t in range(n_lags, len(residuals)):
        feat = [residuals[t - k] for k in range(1, n_lags + 1)]
        feat.append(returns[t - 1])
        X.append(feat)
        y.append(residuals[t])

    return np.array(X, float), np.array(y, float)


def simulate_hybrid_arima(
    historical,
    horizon_days=30,
    steps=30,
    num_paths=3,
    n_lags=3
):
    closes = np.asarray(historical, dtype=float)
    n = len(closes)

    if n < 30:
        raise ValueError("Need at least 30 data points for Hybrid ARIMA.")

    arima_model = choose_arima_model(closes)
    arima_in_sample = np.asarray(arima_model.predict_in_sample())

    if len(arima_in_sample) < n:
        pad = np.full(n - len(arima_in_sample), closes[0])
        arima_in_sample = np.concatenate([pad, arima_in_sample])
    else:
        arima_in_sample = arima_in_sample[-n:]

    residuals = closes - arima_in_sample

    X, y = build_residual_features(residuals, closes, n_lags=n_lags)
    ml = GradientBoostingRegressor(
        n_estimators=100,
        max_depth=3,
        learning_rate=0.05,
        random_state=42
    )
    ml.fit(X, y)

    arima_future = np.asarray(arima_model.predict(n_periods=steps))
    paths = []

    resid_std = float(np.std(residuals) + 1e-6)
    clip_limit = resid_std * 3      
    residual_decay = 0.7            

    for p in range(num_paths):
        res_ext = residuals.tolist()
        price_ext = closes.tolist()
        path = []

        for t in range(steps):
            if len(res_ext) < n_lags + 1:
                feat = [0.0] * (n_lags + 1)
            else:
                rets = np.diff(np.log(np.asarray(price_ext) + 1e-9))
                feat = [res_ext[-k] for k in range(1, n_lags + 1)]
                feat.append(rets[-1])

            feat = np.asarray(feat).reshape(1, -1)
            pred_resid = float(ml.predict(feat)[0])

            pred_resid *= residual_decay
            pred_resid = 0.5 * pred_resid + 0.5 * np.random.normal(0, resid_std * 0.3)

            pred_resid = np.clip(pred_resid, -clip_limit, clip_limit)

            noise = np.random.normal(0, resid_std * 0.5)
            noise = np.clip(noise, -clip_limit, clip_limit)

            pred_resid += noise
            next_price = arima_future[t] + pred_resid

            next_price = max(next_price, 0.01)

            res_ext.append(pred_resid)
            price_ext.append(next_price)
            path.append(float(next_price))

        paths.append(path)

    return {
        "paths": paths,
        "arima_forecast": arima_future.tolist(),
        "residual_std": resid_std,
    }
