import numpy as np 
def ema(prices,window):
    alpha = 2/(window+1)
    ema_values = [prices[0]]
    for p in prices[1:]:
        ema_values.append(alpha * p + (1 - alpha) * ema_values[-1])
    return ema_values

def macd_indicator(prices, fast=12, slow=26, signal=9):
    fast_ema = ema(prices, fast)
    slow_ema = ema(prices, slow)
    macd_line = np.array(fast_ema) - np.array(slow_ema)
    signal_line = ema(macd_line.tolist(), signal)
    return macd_line, signal_line

def macd_strategy(index, prices, fast=12, slow=26, signal=9):
    if index < slow:
        return 0
    macd_line, signal_line = macd_indicator(prices[:index], fast, slow, signal)
    macd_prev = macd_line[-2]
    signal_prev = signal_line[-2]
    macd_now = macd_line[-1]
    signal_now = signal_line[-1]
    if macd_prev < signal_prev and macd_now > signal_now:
        return 1
    if macd_prev > signal_prev and macd_now < signal_now:
        return -1

    return 0

