import numpy as np

def kalman_filter_1d(prices, process_var, meas_var):
    """
    Optimized 1D Kalman filter.
    """
    n = len(prices)
    x_filtered = np.empty(n, dtype=float)

    x = prices[0]
    P = 1.0

    Q = float(process_var)
    R = float(meas_var)

    for i in range(n):
        z = prices[i]
        P_pred = P + Q
        K = P_pred / (P_pred + R)


        x = x + K * (z - x)
        P = (1 - K) * P_pred

        x_filtered[i] = x

    return x_filtered


def simulate_kalman(
    historical,
    horizon_days=30,
    steps=30,
    num_paths=3,
    process_var=1e-3,
    meas_var=1e-2
):

    prices = np.asarray(historical, dtype=float)

    if len(prices) < 10:
        raise ValueError("Need at least 10 price points for Kalman filter.")
    filtered = kalman_filter_1d(prices, process_var, meas_var)
    last_val = filtered[-1]
    diffs = np.diff(filtered)
    noise_scale = float(np.std(diffs) + 1e-6)
    noise = np.random.normal(0.0, noise_scale, size=(num_paths, steps))
    paths = last_val + np.cumsum(noise, axis=1)


    return {
        "paths": paths.tolist(),
        "filtered": filtered.tolist(),
        "noise_scale": noise_scale
    }
