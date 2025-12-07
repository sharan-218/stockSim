import numpy as np
from arch import arch_model
def simulate_garch(historical, horizon_days=30, steps=30, num_paths=10):
    prices = np.array(historical, dtype=float)
    log_returns = np.diff(np.log(prices))

    if len(log_returns) < 2:
        raise ValueError("Not enough historical data for GARCH estimation.")


    model = arch_model(log_returns * 100, vol='Garch', p=1, q=1)
    fitted = model.fit(disp="off")

    last_price = prices[-1]

    
    T = horizon_days / 365.0
    dt = T / steps

    
    params = fitted.params

    
    alpha_keys = [k for k in params.index if k.startswith("alpha[")]
    beta_keys  = [k for k in params.index if k.startswith("beta[")]

    if not alpha_keys or not beta_keys:
        raise RuntimeError(f"Could not find alpha/beta in params: {list(params.index)}")

    alpha = params[alpha_keys[0]]
    beta  = params[beta_keys[0]]

    
    last_sigma2 = (fitted.conditional_volatility[-1] ** 2) / 10000.0

    
    if "omega" in params.index:
        omega = params["omega"] / 10000.0
    else:
        
        one_minus_ab = 1.0 - alpha - beta
        if one_minus_ab <= 0:
           
            omega = 1e-8 * last_sigma2
        else:
            omega = last_sigma2 * one_minus_ab


    Z = np.random.normal(0, 1, (num_paths, steps))
    log_ret_paths = np.zeros((num_paths, steps))
    sigma2 = np.full((num_paths, 1), last_sigma2)

    for t in range(steps):
        sigma_t = np.sqrt(sigma2[:, -1])
        shocks = sigma_t * np.sqrt(dt) * Z[:, t]
        log_ret_paths[:, t] = shocks
        sigma2_next = omega + alpha * shocks**2 + beta * sigma2[:, -1]
        sigma2 = np.hstack([sigma2, sigma2_next.reshape(-1, 1)])
    cumulative_log_returns = np.cumsum(log_ret_paths, axis=1)
    cumulative_log_returns = np.hstack(
        [np.zeros((num_paths, 1)), cumulative_log_returns]
    )
    paths = last_price * np.exp(cumulative_log_returns)

    return {"paths": paths.tolist()}

