import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

def simulate_arima(historical, horizon_days=10, steps=10, num_paths=5, order=(1, 1, 1)):
    """
    Simulate future prices using an ARIMA model based on historical close prices.
    """
    prices = np.array(historical, dtype=float)
    results = []
    for _ in range(num_paths):
        try:
            model = ARIMA(prices, order=order)
            fitted = model.fit()
            forecast = fitted.forecast(steps=horizon_days)
            simulated_path = np.concatenate([prices, forecast])
            results.append(simulated_path.tolist())
        except Exception as e:
            raise ValueError(f"ARIMA simulation failed: {str(e)}")
    return {
        "paths": results 
    }
