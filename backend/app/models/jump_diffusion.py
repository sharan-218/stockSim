import numpy as np
def simulate_jump_diffusion(historical=None, last_price=None, mu=0.0, sigma=0.0,horizon_days=30, steps=30, num_paths=3,jump_lambda=0.1, jump_mu=0.0, jump_sigma=0.02):
    """
    Merton jump diffusion model simulation
    """
    if last_price is None:
        if historical is None or len(historical) == 0:
            raise ValueError("Historical data or last_price required")
        last_price = float(historical[-1])
    dt = horizon_days / steps
    all_paths = []
    drift = (mu - 0.5 * sigma**2) * dt
    Z = np.random.normal(0, 1, (num_paths, steps))
    diffusion = sigma * np.sqrt(dt) * Z
    jumps_count = np.random.poisson(jump_lambda * dt, (num_paths, steps))
    jump_mean = jumps_count * jump_mu
    jump_std = np.sqrt(jumps_count) * jump_sigma
    jump_effect = np.random.normal(jump_mean, jump_std)
    log_returns = drift + diffusion + jump_effect

    cumulative_log_returns = np.cumsum(log_returns, axis=1)
    zeros = np.zeros((num_paths, 1))
    cumulative_log_returns = np.hstack([zeros, cumulative_log_returns])
    paths = last_price * np.exp(cumulative_log_returns)
    all_paths = paths.tolist()

    return {
        "paths": [list(map(float, p)) for p in all_paths],
        "steps": steps,
        "horizon_days": horizon_days,
        "num_paths": num_paths
    }
