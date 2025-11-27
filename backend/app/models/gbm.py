import numpy as np

def simulate(last_price, mu, sigma, horizon_days=30, steps=30, num_paths=10):
    """
    Geometric Brownian Motion simulation
    S0    : Initial price
    mu    : Drift
    sigma : Volatility
    T     : Total time
    N     : Number of time steps
    paths : Number of paths
    """
    dt = horizon_days / steps
    Z = np.random.normal(0, 1, (num_paths, steps))
    drift = (mu - 0.5 * sigma**2) * dt
    diffusion = sigma * np.sqrt(dt) * Z
    daily_log_returns = drift + diffusion
    cumulative_log_returns = np.cumsum(daily_log_returns, axis=1)
    zeros = np.zeros((num_paths, 1))
    cumulative_log_returns = np.hstack([zeros, cumulative_log_returns])
    paths = last_price * np.exp(cumulative_log_returns)
    return paths.tolist()
