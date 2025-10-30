import numpy as np
from statsmodels.tsa.arima.model import ARIMA

def simulate_arima(historical, horizon_days=10, steps=10, num_paths=5, order=(1, 1, 1)):
    prices = [d["close"] for d in historical]
    model = ARIMA(prices, order=order)
    fit = model.fit()

    residuals = fit.resid
    sigma = np.std(residuals)

    simulations = []
    for _ in range(num_paths):
        simulated = prices.copy()
        for _ in range(horizon_days):
            next_val = fit.predict(start=len(simulated), end=len(simulated))
            noise = np.random.normal(0, sigma)
            simulated.append(next_val.iloc[0] + noise)
        simulations.append(simulated)
    return {"paths": simulations}
