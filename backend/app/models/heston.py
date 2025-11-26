import numpy as np

def simulate_heston(
    last_price,
    mu,
    sigma,
    horizon_days=30,
    steps=30,
    num_paths=3,
    v0=None,
    kappa=2.0,
    theta=0.64,
    vol_of_vol=1.0,
    rho=-0.7,
):
    """
    Heston Stochastic Volatility Model for generic crypto assets.
    - Full-truncation Euler for variance (CIR)
    - Log-Euler for price

    Returns
    -------
    dict with keys:
        "paths"        : list[list[float]] of simulated prices, shape (num_paths, steps+1)
        "steps"        : int
        "horizon_days" : int/float
        "num_paths"    : int
    """

    S0 = float(last_price)
    dt = (float(horizon_days) / 365.0) / float(steps)

    if sigma is None or not np.isfinite(sigma) or sigma <= 0:
        sigma = 0.8
    base_var = sigma ** 2
    var_floor = max(0.01 * base_var, 1e-6)
    if v0 is None:
        v0 = max(base_var, var_floor)
    if theta is None:
        theta = max(base_var, var_floor)

    v0 = float(v0)
    theta = float(theta)
    kappa = float(kappa)
    vol_of_vol = float(vol_of_vol)
    rho = float(rho)

    if kappa <= 0:
        raise ValueError("kappa must be > 0 for Heston variance process.")
    S_mat = np.zeros((num_paths, steps + 1))
    v_mat = np.zeros((num_paths, steps + 1))
    
    S_mat[:, 0] = S0
    v_mat[:, 0] = v0
    Z1 = np.random.normal(size=(num_paths, steps))
    Z2_ind = np.random.normal(size=(num_paths, steps))

    Z2 = rho * Z1 + np.sqrt(max(1.0 - rho**2, 0.0)) * Z2_ind
    sqrt_dt = np.sqrt(dt)
    
    for t in range(steps):
        v_t = v_mat[:, t]
        S_t = S_mat[:, t]
        v_pos = np.maximum(v_t, var_floor)
        dv = kappa * (theta - v_pos) * dt + vol_of_vol * np.sqrt(v_pos) * sqrt_dt * Z2[:, t]
        v_next = v_pos + dv
        v_next = np.maximum(v_next, var_floor)
        variance_cap = 25.0 * base_var
        v_next = np.minimum(v_next, variance_cap)
        
        v_mat[:, t+1] = v_next    
        dS_exponent = (mu - 0.5 * v_pos) * dt + np.sqrt(v_pos) * sqrt_dt * Z1[:, t]
        S_next = S_t * np.exp(dS_exponent)
        S_next = np.maximum(S_next, 1e-6)
        
        S_mat[:, t+1] = S_next
    paths = S_mat.tolist()
    return {
        "paths": paths,
        "steps": steps,
        "horizon_days": horizon_days,
        "num_paths": num_paths,
    }
