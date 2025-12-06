import numpy as np
def compute_max_drawdown(values):
    """
    Compute the maximum drawdown for a series of portfolio values.
    values: list of floats
    Returns: float (max drawdown as negative number)
    """
    values = np.asarray(values, dtype=float)
    running_max = np.maximum.accumulate(values)
    drawdowns = values - running_max
    drawdowns /= running_max
    return drawdowns.min()
