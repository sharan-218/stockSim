import numpy as np
from app.backtest.computeMaxDD import compute_max_drawdown

def backtest(historical, signal_func, initial_capital):
    prices = np.array([h["close"] for h in historical], dtype=float)
    cash = initial_capital or 100
    position = 0.0
    portfolio_values = np.zeros_like(prices)

    for i, price in enumerate(prices):
        signal = signal_func(i, prices)
        if signal == 1 and cash > 0:
            position = cash / price
            cash = 0.0
        elif signal == -1 and position > 0:
            cash = position * price
            position = 0.0

        portfolio_values[i] = cash + position * price

    return {
        "final_value": float(portfolio_values[-1]),
        "returns": portfolio_values.tolist(),
        "max_drawdown": float(compute_max_drawdown(portfolio_values)),
    }
