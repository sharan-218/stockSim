import numpy as np

def simulate(last_price, mu, sigma, horizon_days=30, steps=30, num_paths=3):

    dt = horizon_days / steps
    sqrt_dt = np.sqrt(dt)

    drift = (mu - 0.5 * sigma * sigma) * dt

    Z = np.random.normal(0.0, 1.0, size=(num_paths, steps))

    log_returns = drift + sigma * sqrt_dt * Z

    cumulative = np.empty((num_paths, steps + 1))
    cumulative[:, 0] = 0.0
    np.cumsum(log_returns, axis=1, out=cumulative[:, 1:])

    paths = last_price * np.exp(cumulative)

    return paths.tolist()
