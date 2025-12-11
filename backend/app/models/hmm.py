import numpy as np
from numba import njit, prange

@njit
def _fit_hmm_gaussian(returns, iterations):
    n = returns.shape[0]
    mu = np.zeros(2)
    sigma = np.zeros(2)
    mu[0] = np.percentile(returns, 25)
    mu[1] = np.percentile(returns, 75)

    std_ret = returns.std()
    sigma[0] = std_ret * 0.5 + 1e-6
    sigma[1] = std_ret * 1.5 + 1e-6
    trans = np.array([[0.9, 0.1],
                      [0.1, 0.9]], dtype=np.float64)

    gamma = np.zeros((n, 2), dtype=np.float64)
    inv_sqrt_2pi = 1.0 / np.sqrt(2 * np.pi)

    for _ in range(iterations):

        for k in range(2):
            diff = (returns - mu[k]) / sigma[k]
            gamma[:, k] = (inv_sqrt_2pi / sigma[k]) * np.exp(-0.5 * diff * diff)

        row_sum = gamma[:, 0] + gamma[:, 1]
        for i in range(n):
            gamma[i, 0] /= row_sum[i]
            gamma[i, 1] /= row_sum[i]
        w0 = gamma[:, 0].sum()
        w1 = gamma[:, 1].sum()

        mu[0] = (gamma[:, 0] * returns).sum() / w0
        mu[1] = (gamma[:, 1] * returns).sum() / w1

        diff0 = returns - mu[0]
        diff1 = returns - mu[1]

        sigma[0] = np.sqrt((gamma[:, 0] * diff0 * diff0).sum() / w0) + 1e-6
        sigma[1] = np.sqrt((gamma[:, 1] * diff1 * diff1).sum() / w1) + 1e-6

        exp00 = 0.0
        exp01 = 0.0
        exp10 = 0.0
        exp11 = 0.0

        for t in range(n - 1):
            exp00 += gamma[t, 0] * gamma[t + 1, 0]
            exp01 += gamma[t, 0] * gamma[t + 1, 1]
            exp10 += gamma[t, 1] * gamma[t + 1, 0]
            exp11 += gamma[t, 1] * gamma[t + 1, 1]

        r0 = exp00 + exp01
        r1 = exp10 + exp11

        trans[0, 0] = exp00 / r0
        trans[0, 1] = exp01 / r0
        trans[1, 0] = exp10 / r1
        trans[1, 1] = exp11 / r1

    return mu, sigma, trans


@njit(parallel=True)
def _simulate_hmm_paths(
    prices_last,
    mu,
    sigma,
    trans,
    steps,
    num_paths
):
    paths = np.empty((num_paths, steps), dtype=np.float64)
    states = np.array([0, 1])

    for p in prange(num_paths):
        cur_price = prices_last
        state = np.random.randint(0, 2)

        for t in range(steps):
            ret = mu[state] + sigma[state] * np.random.randn()

            cur_price = cur_price * np.exp(ret)
            paths[p, t] = cur_price
            if np.random.rand() < trans[state, 0]:
                state = 0
            else:
                state = 1

    return paths

def simulate_hmm(
    historical,
    horizon_days=30,
    steps=30,
    num_paths=3
):
    prices = np.asarray(historical, dtype=float)
    log_prices = np.log(prices + 1e-9)
    returns = np.diff(log_prices)

    if len(returns) < 30:
        raise ValueError("HMM requires at least ~30 data points.")

    mu, sigma, trans = _fit_hmm_gaussian(returns, iterations=20)
    paths = _simulate_hmm_paths(
        prices[-1],
        mu,
        sigma,
        trans,
        steps,
        num_paths
    )

    return {
        "paths": paths.tolist(),
        "mu": mu.tolist(),
        "sigma": sigma.tolist(),
        "transition_matrix": trans.tolist()
    }
