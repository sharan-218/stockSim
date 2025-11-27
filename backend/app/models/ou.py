import numpy as np
import pandas as pd
from app.utils.helpers import estimate_ou_params

def simulate_ou(historical=None, last_price=None, mu=None, sigma=None,
                horizon_days=30, steps=30, num_paths=10):

    prices = np.array(historical, dtype=float)
    logp = np.log(prices)

    raw = estimate_ou_params(logp, dt=1.0)
    theta = raw.get("theta", 0.2)
    mu_p = raw.get("mu", np.mean(logp))
    sigma_p = raw.get("sigma", np.std(logp))

    theta = float(np.clip(theta, 0.01, 0.5))       
    sigma_p = float(np.clip(sigma_p, 1e-6, 0.15))    
    mu_p = float(np.clip(mu_p, np.min(logp)*0.9, np.max(logp)*1.1))

    last_log = logp[-1]
    dt = horizon_days / steps

    all_paths = []
    paths = np.zeros((num_paths, steps + 1))
    paths[:, 0] = last_log
    
    sqrt_dt = np.sqrt(dt)
    
    # Pre-generate random noise: shape (num_paths, steps)
    Z = np.random.normal(0, 1, (num_paths, steps))
    
    for t in range(steps):
        x = paths[:, t]
        # dx = theta * (mu - x) * dt + sigma * sqrt(dt) * Z
        dx = theta * (mu_p - x) * dt + sigma_p * sqrt_dt * Z[:, t]
        paths[:, t+1] = x + dx

    all_paths = np.exp(paths).tolist()

    return {
        "paths": all_paths,
        "steps": steps,
        "horizon_days": horizon_days,
        "num_paths": num_paths
    }
