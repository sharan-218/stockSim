import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

def simulate_arima(historical, horizon_days=30, steps=30, num_paths=5, order=(1, 1, 1)):
    """
    Simulate future prices using ARIMA model.
    historical: list of close prices
    horizon_days: number of days to forecast
    steps: number of steps (time intervals)
    num_paths: number of simulation paths
    order: ARIMA(p,d,q)
    """
    prices = np.array(historical, dtype=float)

    if len(prices) < 10:
        raise ValueError("Need at least 10 historical data points for ARIMA simulation.")
    model = ARIMA(prices, order=order)
    fitted_model = model.fit()
    all_paths = []
    for _ in range(num_paths):
        # Forecast next `steps` prices
        forecast = fitted_model.simulate(steps)
        simulated_path = np.concatenate([prices[-1:], forecast + prices[-1] - forecast[0]])
        all_paths.append(simulated_path.tolist())
    return {"paths": all_paths}
