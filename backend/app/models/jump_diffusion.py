import numpy as np

def simulate_jump_diffusion(
    historical=None,
    last_price=None,
    mu=0.0,
    sigma=0.0,
    horizon_days=30,
    steps=30,
    num_paths=3,
    jump_lambda=0.1,
    jump_mu=0.0,     
    jump_sigma=0.02, 
    jump_model="merton",
    kou_p=0.5,
    kou_alpha1=5.0,
    kou_alpha2=5.0,
    trading_days=365,
):
    if last_price is None:
        if historical is None or len(historical) == 0:
            raise ValueError("Historical data or last_price required")
        last_price = float(historical[-1])
    S0 = float(last_price)

    T_years = horizon_days / trading_days
    dt = T_years / steps
    sqrt_dt = np.sqrt(dt)

    if jump_model.lower() == "merton":
        kappa = np.exp(jump_mu + 0.5 * jump_sigma * jump_sigma) - 1.0

    elif jump_model.lower() == "kou":
        if kou_alpha1 <= 1:
            raise ValueError("kou_alpha1 must be >1 for finite E[e^X]")
        e_exp_x = (
            kou_p * (kou_alpha1 / (kou_alpha1 - 1)) +
            (1 - kou_p) * (kou_alpha2 / (kou_alpha2 + 1))
        )
        kappa = e_exp_x - 1.0
    else:
        raise ValueError("jump_model must be 'merton' or 'kou'")

    drift = (mu - 0.5 * sigma * sigma - jump_lambda * kappa) * dt

    log_paths = np.empty((num_paths, steps + 1))
    log_paths[:, 0] = np.log(S0)

    for t in range(1, steps + 1):


        diffusion = sigma * sqrt_dt * np.random.randn(num_paths)

        N_jumps = np.random.poisson(jump_lambda * dt, size=num_paths)

        jump_log_total = np.zeros(num_paths)

        if jump_model.lower() == "merton":
            nonzero = N_jumps > 0
            count = N_jumps[nonzero]
            if count.size > 0:
                jump_log_total[nonzero] = np.random.normal(
                    loc=jump_mu * count,
                    scale=jump_sigma * np.sqrt(count),
                )

        else: 
            total = int(N_jumps.sum())
            if total > 0:
                idx = np.repeat(np.arange(num_paths), N_jumps)
                u = np.random.rand(total)
                neg = u < kou_p
                pos = ~neg

                jump_sizes = np.empty(total)
                if neg.any():
                    jump_sizes[neg] = -np.random.exponential(
                        scale=1 / kou_alpha1, size=neg.sum()
                    )

                if pos.any():
                    jump_sizes[pos] = np.random.exponential(
                        scale=1 / kou_alpha2, size=pos.sum()
                    )

                jump_log_total = np.bincount(idx, weights=jump_sizes, minlength=num_paths)

        log_paths[:, t] = log_paths[:, t - 1] + drift + diffusion + jump_log_total

    paths = np.exp(log_paths)

    return {
        "paths": paths.tolist(),      
        "steps": steps,
        "horizon_days": horizon_days,
        "num_paths": num_paths,
    }
