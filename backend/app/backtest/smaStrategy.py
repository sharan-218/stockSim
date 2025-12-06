import numpy as np

def sma_strategy(index, prices, window=20):
    if index < window:
        return 0
    sma = np.mean(prices[index - window : index])
    price = prices[index]

    if price > sma:
        return 1
    elif price < sma:
        return -1
    return 0
def compute_sma_series(prices, window=30):
    sma = []
    for i in range(len(prices)):
        if i < window:
            sma.append(None)
        else:
            sma.append(float(np.mean(prices[i - window : i])))
    return sma
