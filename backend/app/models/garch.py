import numpy as np
from arch import arch_model
def simulate_garch(historical, horizon_days=30, steps=30, num_paths=10):
    """
    Simulate future price paths using a simple GARCH(1,1) model for volatility.
    historical is a list of historical close prices.
    """
    prices = np.array(historical, dtype=float)
    log_returns = np.diff(np.log(prices))
    if len(log_returns) < 2:
        raise ValueError("Not enough historical data for GARCH estimation.")
    model = arch_model(log_returns * 100, vol='Garch', p=1, q=1)
    fitted = model.fit(disp="off")
    last_price = prices[-1]
    dt = horizon_days / steps
    forecasts = fitted.forecast(horizon=steps, reindex=False)
    sigma_forecast = np.sqrt(forecasts.variance.values[-1] / 10000) 
    
    # Vectorized simulation
    # shape: (num_paths, steps)
    Z = np.random.normal(0, 1, (num_paths, steps))
    
    # sigma_forecast is 1D array of length steps
    # We broadcast it to (num_paths, steps)
    # returns = Z * sigma * sqrt(dt)
    log_returns = Z * sigma_forecast * np.sqrt(dt)
    
    # Cumulative returns
    cumulative_log_returns = np.cumsum(log_returns, axis=1)
    
    # Prepend zeros
    zeros = np.zeros((num_paths, 1))
    cumulative_log_returns = np.hstack([zeros, cumulative_log_returns])
    
    # Prices
    paths = last_price * np.exp(cumulative_log_returns)
    
    all_paths = paths.tolist()

    return {"paths": all_paths}
