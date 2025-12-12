import numpy as np


def compute_ff_factors(prices, window=20):

    prices = np.asarray(prices, dtype=float)
    n = len(prices)

    if n < window + 2:
        raise ValueError("Not enough data for FF factor model.")
    logp = np.log(prices + 1e-9)
    returns = np.diff(logp)
    kernel = np.ones(window) / window
    sma = np.convolve(prices, kernel, mode="valid")
    mom = prices[window - 1:] / sma - 1
    ret_pad = np.pad(returns, (window - 1, 0), mode="constant", constant_values=returns[0])
    shape = (len(returns), window)
    strides = (ret_pad.strides[0], ret_pad.strides[0])
    windows = np.lib.stride_tricks.as_strided(ret_pad, shape=shape, strides=strides)
    vol = windows.std(axis=1)

    min_len = min(len(returns), len(mom), len(vol))

    return {
        "MKT": returns[-min_len:],   
        "MOM": mom[-min_len:],       
        "VOL": vol[-min_len:]
    }

def fama_french_strategy(index, prices, betas=None, window=20):
    """
    FF-style factor model for crypto.
    Predict expected return from 3 factors:
        E[R] = β1*MKT + β2*MOM + β3*VOL
    BUY if E[R] > 0, else SELL.
    """

    if betas is None:
        betas = np.array([1.0, 0.7, -0.4], dtype=float)
    if index < window + 5:
        return 0
    factors = compute_ff_factors(prices[:index + 1], window=window)

    MKT = factors["MKT"][-1]
    MOM = factors["MOM"][-1]
    VOL = factors["VOL"][-1]

    expected_ret = float(betas[0] * MKT + betas[1] * MOM + betas[2] * VOL)

    return 1 if expected_ret > 0 else -1
