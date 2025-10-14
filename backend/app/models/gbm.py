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
    all_paths = []

    for _ in range(num_paths):
        path = [last_price]
        for _ in range(steps):
            price_next = path[-1] * np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * np.random.normal())
            path.append(price_next)
        all_paths.append(path)

    return all_paths
