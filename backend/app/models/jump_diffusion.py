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

    for _ in range(num_paths):
        path = [last_price]
        for _ in range(steps):
            jump = np.random.poisson(jump_lambda * dt)
            jump_effect = np.sum(np.random.normal(jump_mu, jump_sigma, jump))
            diffusion = (mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * np.random.normal()
            path.append(path[-1] * np.exp(diffusion + jump_effect))
        all_paths.append(path)

    return {
        "paths": [list(map(float, p)) for p in all_paths],
        "steps": steps,
        "horizon_days": horizon_days,
        "num_paths": num_paths
    }
