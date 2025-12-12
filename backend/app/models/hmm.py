import numpy as np
from numba import njit, prange


def _init_hmm_params(returns, n_states):
    returns = np.asarray(returns, dtype=float)
    std_ret = returns.std() + 1e-8

    qs = np.linspace(10, 90, n_states)
    mu_init = np.percentile(returns, qs).astype(float)

    factors = np.linspace(0.5, 1.5, n_states)
    sigma_init = std_ret * factors + 1e-6

    trans_init = np.full((n_states, n_states), (1.0 - 0.9) / (n_states - 1), dtype=float)
    np.fill_diagonal(trans_init, 0.9)

    return mu_init, sigma_init, trans_init


@njit
def _fit_hmm_gaussian(returns, mu, sigma, trans, iterations, mode_flag):
    """
    mode_flag: 0 = full (mean + variance switching), 1 = variance-only switching (shared mean).
    """

    n = returns.shape[0]
    K = mu.shape[0]

    gamma = np.zeros((n, K), dtype=np.float64)
    inv_sqrt_2pi = 1.0 / np.sqrt(2 * np.pi)

    for _ in range(iterations):
        if mode_flag == 1:
            num = 0.0
            den = 0.0
            for k in range(K):

                num += mu[k]
                den += 1.0
            shared_mu = num / den
            for k in range(K):
                mu[k] = shared_mu

        for t in range(n):
            denom = 0.0
            for k in range(K):
                diff = (returns[t] - mu[k]) / sigma[k]
                g = (inv_sqrt_2pi / sigma[k]) * np.exp(-0.5 * diff * diff)
                gamma[t, k] = g
                denom += g


            if denom <= 0.0:
                invK = 1.0 / K
                for k in range(K):
                    gamma[t, k] = invK
            else:
                for k in range(K):
                    gamma[t, k] /= denom


        weights = np.zeros(K, dtype=np.float64)
        for k in range(K):
            w = 0.0
            for t in range(n):
                w += gamma[t, k]
            weights[k] = w

        for k in range(K):
            num = 0.0
            w = weights[k]
            if w <= 1e-12:
                continue
            for t in range(n):
                num += gamma[t, k] * returns[t]
            mu[k] = num / w

        if mode_flag == 1:
            num = 0.0
            den = 0.0
            for k in range(K):
                num += mu[k] * weights[k]
                den += weights[k]
            shared_mu = num / den
            for k in range(K):
                mu[k] = shared_mu

        for k in range(K):
            w = weights[k]
            if w <= 1e-12:
                continue
            num = 0.0
            for t in range(n):
                diff = returns[t] - mu[k]
                num += gamma[t, k] * diff * diff
            sigma[k] = np.sqrt(num / w) + 1e-6
        for i in range(K):
            for j in range(K):
                num = 0.0
                den = 0.0
                for t in range(n - 1):
                    num += gamma[t, i] * gamma[t + 1, j]
                    den += gamma[t, i]
                if den <= 1e-12:
                    trans[i, j] = 1.0 / K
                else:
                    trans[i, j] = num / den

        for i in range(K):
            rowsum = 0.0
            for j in range(K):
                rowsum += trans[i, j]
            if rowsum <= 0.0:
                invK = 1.0 / K
                for j in range(K):
                    trans[i, j] = invK
            else:
                for j in range(K):
                    trans[i, j] /= rowsum

    return mu, sigma, trans


@njit(parallel=True)
def _simulate_hmm_paths(
    last_price,
    mu,
    sigma,
    trans,
    steps,
    num_paths
):
    K = mu.shape[0]
    paths = np.empty((num_paths, steps), dtype=np.float64)

    for p in prange(num_paths):
        cur_price = last_price
        state = np.random.randint(0, K)

        for t in range(steps):
            ret = mu[state] + sigma[state] * np.random.randn()
            cur_price = cur_price * np.exp(ret)
            paths[p, t] = cur_price

            u = np.random.rand()
            cumsum = 0.0
            new_state = 0
            for j in range(K):
                cumsum += trans[state, j]
                if u <= cumsum:
                    new_state = j
                    break
            state = new_state

    return paths


def simulate_hmm(
    historical,
    horizon_days=30,
    steps=30,
    num_paths=3,
    n_states=3,
    em_iterations=80,
    regime_mode= "variance",
 
):

    prices = np.asarray(historical, dtype=float)
    log_prices = np.log(prices + 1e-9)
    returns = np.diff(log_prices)

    if len(returns) < max(30, n_states * 5):
        raise ValueError("HMM requires more data for stable estimation with n_states=%d." % n_states)
    mode_flag = 1 if regime_mode == "variance" else 0

    mu_init, sigma_init, trans_init = _init_hmm_params(returns, n_states)
    mu, sigma, trans = _fit_hmm_gaussian(
        returns,
        mu_init.copy(),
        sigma_init.copy(),
        trans_init.copy(),
        em_iterations,
        mode_flag
    )
    paths_arr = _simulate_hmm_paths(
        prices[-1],
        mu,
        sigma,
        trans,
        steps,
        num_paths
    )

    return {
        "paths": paths_arr.tolist(),
        "mu": mu.tolist(),
        "sigma": sigma.tolist(),
        "transition_matrix": trans.tolist()
    }
