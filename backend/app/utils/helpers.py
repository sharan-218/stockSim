import numpy as np
import pandas as pd

def estimate_ou_params(prices, dt=1.0):
    """
    Estimate OU parameters from a price series.
    - prices: 1D array-like of prices (floats) in time order
    - dt: time step (e.g., dt=1 for daily, or dt=1/252 for trading-year)
    Returns: dict {theta, mu, sigma, phi, intercept, resid_var}
    """
    p = pd.Series(prices).astype(float).dropna()
    x_t = p[:-1].values
    x_next = p[1:].values

    # OLS: x_next = phi * x_t + intercept + eps
    A = np.vstack([x_t, np.ones_like(x_t)]).T
    phi, intercept = np.linalg.lstsq(A, x_next, rcond=None)[0]

    # residuals and variance
    resid = x_next - (phi * x_t + intercept)
    resid_var = np.var(resid, ddof=1)

    # convert phi to theta (phi = exp(-theta * dt))
    # clamp phi to (0, 0.9999999] for numerical safety
    phi = np.clip(phi, -0.9999999, 0.9999999)
    if phi <= 0:
        # non-positive phi means strong oscillation or misfit handling
        theta = -np.log(abs(phi)) / dt if phi != 0 else None
    else:
        theta = -np.log(phi) / dt

    # mu from intercept = (1-phi)*mu  => mu = intercept / (1-phi)
    mu = intercept / (1.0 - phi) if (1.0 - phi) != 0 else np.nan

    # sigma from resid variance:
    # Var(eta) = (sigma^2 / (2 theta)) * (1 - phi^2)
    # => sigma = sqrt( 2*theta*Var(eta) / (1 - phi^2) )
    sigma = None
    if theta is not None and (1 - phi * phi) > 0 and theta > 0:
        sigma = np.sqrt(2.0 * theta * resid_var / (1.0 - phi * phi))

    return {
        "phi": float(phi),
        "intercept": float(intercept),
        "theta": float(theta) if theta is not None else None,
        "mu": float(mu),
        "sigma": float(sigma) if sigma is not None else None,
        "resid_var": float(resid_var)
    }


def estimate_theta(prices: pd.Series) -> float:
    return prices.mean()
