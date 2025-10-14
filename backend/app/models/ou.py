import numpy as np
import pandas as pd
from app.utils.helpers import estimate_ou_params

def simulate_ou(historical=None, last_price=None, mu=None, sigma=None,
                horizon_days=30, steps=30, num_paths=10):
    """
    Ornstein–Uhlenbeck (OU) process simulation
    """
    if historical is None or len(historical) < 2:
        raise ValueError("Historical data required for OU simulation")
    
    prices = pd.Series(historical)
    params = estimate_ou_params(prices, dt=1.0)
    theta = np.clip(params.get("theta", 0.1), 0.01, 1.0)
    mu_param = params.get("mu", prices.mean())
    sigma_param = np.clip(params.get("sigma", prices.std() * 0.5), 0.01, prices.std())

    last_price = prices.iloc[-1]
    dt = horizon_days / steps

    all_paths = []
    for _ in range(num_paths):
        path = [last_price]
        for _ in range(steps):
            x_t = path[-1]
            dx = theta * (mu_param - x_t) * dt + sigma_param * np.sqrt(dt) * np.random.normal()
            path.append(max(x_t + dx, 0))
        all_paths.append(path)

    return {
        "paths": [list(map(float, p)) for p in all_paths],
        "steps": steps,
        "horizon_days": horizon_days,
        "num_paths": num_paths
    }
