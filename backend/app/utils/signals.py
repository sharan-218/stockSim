import numpy as np 
import math 
from typing import List,Tuple,Any, Union, Dict 
from collections import Counter 


ArrayLike = Union[List[float],np.ndarray]
Paths = Union[List[ArrayLike],np.ndarray]
ModelPaths = Dict[str,Paths]

def _to_numpy(paths:Paths) -> np.ndarray:
    """Convert input paths to a numpy array shape (num_paths, path_length)."""
    arr = np.array(paths,dtype=float)
    if arr.ndim == 1:
        arr = arr.reshape(1,-1)
    return arr

def compute_percentiles(paths:Paths,percentiles:List[int]= [5,25,50,75,95]) -> Dict[int,np.ndarray]:
    """
    Return percentiles at each time step.
    - paths: list of arrays,shape (n_paths,steps+1)
    - returns: dict percentile -> 1d array (len = time steps)
    """
    arr = _to_numpy(paths)
    results = {}
    for p in percentiles:
        results[p] = np.percentile(arr,p,axis=0)
    return results
def prob_exceed(paths: Paths, threshold: float, at_step: int = -1) -> float:
    """
    P(S_at_step > threshold)
    at_step: index into path (0..T), default -1 means final step
    """
    arr = _to_numpy(paths)
    vals = arr[:, at_step]
    return float((vals > threshold).mean())

def prob_below(paths: Paths, threshold: float, at_step: int = -1) -> float:
    arr = _to_numpy(paths)
    vals = arr[:, at_step]
    return float((vals < threshold).mean())

def cvar(paths: Paths, alpha: float = 0.95, at_step: int = -1) -> float:
    """
    Conditional Value at Risk (expected loss given worst (1-alpha)% outcomes)
    For prices, often used on returns. We'll compute on returns relative change from current.
    Return expressed in same units as input (price) or as negative loss if desired.
    Here: compute losses = S0 - ST, return average loss in worst (1-alpha) quantile.
    """
    arr = _to_numpy(paths)
    vals = arr[:, at_step]

    S0 = np.median(arr[:, 0])
    losses = np.maximum(S0 - vals,0)
    k = max(1, int((1 - alpha) * len(losses)))
    sorted_losses = np.sort(losses)[::-1]
    tail = sorted_losses[:k]
    return float(np.mean(tail))

def first_passage_times(paths: Paths, target: float, direction: str = "above") -> List[Union[int, None]]:
    """
    For each path, find the first index (time step) where price crosses target.
    direction: 'above' => first time price >= target
               'below' => first time price <= target
    Returns list of ints or None (if never hit)
    """
    arr = _to_numpy(paths)
    res = []
    for p in arr:
        idx = None
        if direction == "above":
            hits = np.where(p >= target)[0]
        else:
            hits = np.where(p <= target)[0]
        idx = int(hits[0]) if len(hits) else None
        res.append(idx)
    return res

def time_to_target_distribution(paths: Paths, target: float, direction: str = "above") -> Dict[str, Any]:
    """
    Returns histogram summary: pct that hit, median time, mean time, distribution counts.
    """
    times = first_passage_times(paths, target, direction)
    hit_times = [t for t in times if t is not None]
    total = len(times)
    hits = len(hit_times)
    if hits == 0:
        return {"pct_hit": 0.0, "mean_time": None, "median_time": None, "hit_times": [], "counts": {}}
    mean_t = float(np.mean(hit_times))
    median_t = float(np.median(hit_times))
    counts = dict(Counter(hit_times))
    return {
        "pct_hit": hits / total,
        "mean_time": mean_t,
        "median_time": median_t,
        "hit_times": hit_times,
        "counts": counts
    }

def scenario_bucket_for_price_ratio(paths: Paths, S0: float, bull_thresh: float = 1.2, bear_thresh: float = 0.9) -> Dict[str, Any]:
    """
    Bucket simulation outcomes at final step by ratio ST/S0 into Bull/Flat/Bear.
    Returns proportions and the bucket assigned by majority.
    """
    arr = _to_numpy(paths)
    ST = arr[:, -1]
    ratios = ST / float(S0)
    bull = (ratios >= bull_thresh).mean()
    bear = (ratios <= bear_thresh).mean()
    flat = 1.0 - (bull + bear)
    majority = "flat"
    if bull > max(bear, flat):
        majority = "bull"
    elif bear > max(bull, flat):
        majority = "bear"
    return {"bull": float(bull), "flat": float(flat), "bear": float(bear), "majority": majority, "ratios": ratios.tolist()}

DEFAULT_ACTION_MAP = {
    "bull": "increase_exposure",
    "flat": "hold",
    "bear": "reduce_exposure_or_hedge"
}

def map_bucket_to_action(bucket_summary: Dict[str, Any], action_map: Dict[str, str] = DEFAULT_ACTION_MAP) -> str:
    return action_map.get(bucket_summary["majority"], "hold")

def model_agreement_score(models_paths: ModelPaths, horizon_index: int = -1) -> Dict[str, Any]:
    """
    models_paths: dict model_name -> list of simulated paths for that model
    horizon_index: which time index to sample (default final)
    Returns agreement metrics: fraction of models that predict price > S0, and median direction.
    """
    opinions = {}
    for model_name, paths in models_paths.items():
        arr = _to_numpy(paths)
        median_value = float(np.median(arr[:, horizon_index]))
        S0 = float(np.median(arr[:, 0]))
        opinions[model_name] = 1 if median_value > S0 else -1 if median_value < S0 else 0

    counts = Counter(opinions.values())
    total_models = len(opinions)
    agreement_frac = max(counts.get(1, 0), counts.get(-1, 0)) / total_models if total_models > 0 else 0.0
    direction = "bull" if counts.get(1, 0) > counts.get(-1, 0) else ("bear" if counts.get(-1, 0) > counts.get(1, 0) else "neutral")
    return {"opinions": opinions, "agreement_frac": agreement_frac, "direction": direction, "counts": dict(counts)}
def signal_confidence(paths: Paths, percentile_sigma_bootstrap: float = None) -> float:
    """
    Very lightweight confidence measure:
      - agreement among ensemble (how tight the paths are): inverse of coefficient of variation at final step
      - optionally, use bootstrap std of percentiles (if percentile_sigma_bootstrap provided)
    Returns 0..1 (higher = more confident)
    """
    arr = _to_numpy(paths)
    vals = arr[:, -1]
    if len(vals) <= 1:
        return 0.0
    mean = float(np.mean(vals))
    std = float(np.std(vals))
    if mean == 0:
        cv = 1.0
    else:
        cv = std / abs(mean)
    conf_from_cv = float(max(0.0, 1.0 - cv))
    conf = conf_from_cv

    if percentile_sigma_bootstrap is not None:
        conf *= float(max(0.0, 1.0 - percentile_sigma_bootstrap))
    return float(min(1.0, max(0.0, conf)))
def compute_step_percentiles(paths, percentiles=[5, 25, 50, 75, 95]):
    """
    Compute per-step percentiles for all paths.
    Returns: { step_index: {percentile: value} }
    """
    arr = np.array(paths, dtype=float)
    stepwise = {}

    for t in range(arr.shape[1]):
        values = arr[:, t]
        stepwise[t] = {
            str(p): float(np.percentile(values, p))
            for p in percentiles
        }

    return stepwise
def generate_signals_from_paths(
        paths: Paths,
        S0: float = None,
        steps: int = None,
        horizon_days: int = None,
        percentiles: List[int] = [5, 25, 50, 75, 95],
        prob_thresholds: Dict[str, Tuple[float, float]] = None
    ) -> Dict[str, Any]:

    arr = _to_numpy(paths)

    # S0
    if S0 is None:
        S0 = float(np.median(arr[:, 0]))
    final_percentiles = compute_percentiles(paths, percentiles)
    percentiles_at_final = {
        p: float(final_percentiles[p][-1])
        for p in percentiles
    }

    step_percentiles = compute_step_percentiles(paths, percentiles)

    if prob_thresholds is None:
        prob_thresholds = {
            "add": (1.08, 0.45),
            "reduce": (0.968, 0.35)
        }

    probs = {}
    actions = []

    for label, (ratio, prob_thresh) in prob_thresholds.items():
        target = S0 * ratio

        if label == "reduce":
            p = prob_below(paths, target, at_step=-1)
        else:
            p = prob_exceed(paths, target, at_step=-1)

        probs[label] = {"target": target, "prob": p}

        if label == "add" and p > prob_thresh:
            actions.append("consider_add")
        if label == "reduce" and p > prob_thresh:
            actions.append("consider_reduce")

    # CVaR, scenario, confidence
    tail_risk = cvar(paths, alpha=0.95, at_step=-1)
    bucket = scenario_bucket_for_price_ratio(paths, S0)
    conf = signal_confidence(paths)

    return {
        "S0": S0,
        "percentiles_final": percentiles_at_final,
        "percentiles_stepwise": step_percentiles,
        "prob_checks": probs,
        "tail_risk_cvar95": tail_risk,
        "scenario": bucket,
        "suggested_actions": list(set(actions)) or ["hold"],
        "confidence": conf
    }
