from fastapi import APIRouter, Body, HTTPException
import pandas as pd
import numpy as np
import importlib
from app.utils.signals import generate_signals_from_paths

router = APIRouter(prefix="/simulate", tags=["Simulation"])

MODELS = {
    "gbm": {"module": "app.models.gbm", "func": "simulate"},
    "ou": {"module": "app.models.ou", "func": "simulate_ou"},
    "garch": {"module": "app.models.garch", "func": "simulate_garch"},
    "jump_diffusion": {"module": "app.models.jump_diffusion", "func": "simulate_jump_diffusion"},
    "heston": {"module": "app.models.heston", "func": "simulate_heston"},
}


@router.get("/models")
def get_models():
    return [{"id": k, "name": v["func"].replace("_", " ").title()} for k, v in MODELS.items()]


@router.post("/")
def run_simulation(payload: dict = Body(...)):
    model = payload.get("model", "").lower()
    historical = payload.get("historical")
    horizon_days = int(payload.get("horizon_days", 30))
    steps = int(payload.get("steps", 30))
    num_paths = int(payload.get("paths") or payload.get("num_paths") or 3)

    if not historical or not isinstance(historical, list):
        raise HTTPException(status_code=400, detail="Historical data required")

    if model not in MODELS:
        raise HTTPException(status_code=400, detail=f"Model '{model}' not supported")
    try:
        if isinstance(historical[0], dict) and "close" in historical[0]:
            prices = [float(x["close"]) for x in historical]
        elif isinstance(historical[0], (int, float)):
            prices = [float(x) for x in historical]
        else:
            raise HTTPException(status_code=400,
                                detail="historical must be list of dicts with numeric 'close' values")

        if len(prices) < 2:
            raise HTTPException(status_code=400, detail="Need at least 2 data points to simulate")

        prices = np.array(prices, dtype=float)

    except Exception:
        raise HTTPException(status_code=400, detail="Invalid historical data format")

    log_returns = np.log(prices[1:] / prices[:-1])
    mu = np.mean(log_returns)
    sigma = np.std(log_returns)
    last_price = prices[-1]
    try:
        module_info = MODELS[model]
        module = importlib.import_module(module_info["module"])
        simulate_func = getattr(module, module_info["func"])

        if model == "gbm":
            simulated_paths = simulate_func(
                last_price=last_price,
                mu=mu,
                sigma=sigma,
                horizon_days=horizon_days,
                steps=steps,
                num_paths=num_paths
            )

        elif model == "jump_diffusion":

            result = simulate_func(
                historical=list(prices),
                last_price=last_price,
                mu=mu,
                sigma=sigma,
                horizon_days=horizon_days,
                steps=steps,
                num_paths=num_paths
            )
            simulated_paths = result["paths"]

        elif model in ["ou", "garch"]:
            result = simulate_func(
                historical=list(prices),
                horizon_days=horizon_days,
                steps=steps,
                num_paths=num_paths
            )
            simulated_paths = result["paths"]
        elif model == "heston":
            result = simulate_func(
                last_price=last_price,
                mu=mu,
                sigma=sigma,
                horizon_days=horizon_days,
                steps=steps,
                num_paths=num_paths
            )
            simulated_paths = result["paths"]
        else:
            raise HTTPException(status_code=400, detail=f"Model {model} not implemented")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    signals = generate_signals_from_paths(
        simulated_paths,
        S0=float(last_price),
        steps=steps,
        horizon_days=horizon_days
    )
    return {
        "model": model,
        "paths": simulated_paths,
        "steps": steps,
        "horizon_days": horizon_days,
        "num_paths": num_paths,
        "signals": signals
    }
