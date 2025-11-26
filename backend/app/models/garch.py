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
    all_paths = []
    for _ in range(num_paths):
        path = [last_price]
        for step in range(steps):
            sigma_step = sigma_forecast[step]  
            ret = np.random.normal(0, sigma_step * np.sqrt(dt))
            price_next = path[-1] * np.exp(ret)
            path.append(float(price_next))
        all_paths.append(path)

    return {"paths": all_paths}
