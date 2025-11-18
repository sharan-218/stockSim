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

    for _ in range(num_paths):
        path = [last_log]
        for _ in range(steps):
            x = path[-1]
            dx = theta * (mu_p - x) * dt + sigma_p * np.sqrt(dt) * np.random.normal()
            path.append(x + dx)

        all_paths.append(np.exp(path).tolist())

    return {
        "paths": all_paths,
        "steps": steps,
        "horizon_days": horizon_days,
        "num_paths": num_paths
    }
