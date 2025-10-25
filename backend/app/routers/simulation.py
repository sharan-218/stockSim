from fastapi import APIRouter, Body, HTTPException
import pandas as pd
import numpy as np
import importlib

router = APIRouter(prefix="/simulate", tags=["Simulation"])

MODELS = {
    "gbm": {"module": "app.models.gbm", "func": "simulate"},
    "ou": {"module": "app.models.ou", "func": "simulate_ou"},
    "garch": {"module": "app.models.garch", "func": "simulate_garch"},
    "jump_diffusion": {"module": "app.models.jump_diffusion", "func": "simulate_jump_diffusion"},
    "arima": {"module": "app.models.arima", "func": "simulate_arima"},
}


@router.get("/models")
def get_models():
    return [{"id": k, "name": v["func"].replace("_", " ").title()} for k, v in MODELS.items()]


# @router.post("/")
# def run_simulation(payload: dict = Body(...)):
#     """
#     Run simulation for a given model and historical data.
#     Expected payload:
#     {
#         "model": "gbm",
#         "historical": [...],      # OHLCV array
#         "horizon_days": 30,
#         "steps": 30,
#         "paths": 10
#     }
#     """
#     model = payload.get("model", "").lower()
#     historical = payload.get("historical")
#     horizon_days = payload.get("horizon_days", 30)
#     steps = payload.get("steps", 30)
#     num_paths = payload.get("paths",3)

#     if not historical:
#         raise HTTPException(status_code=400, detail="Historical data required")
#     if model not in MODELS:
#         raise HTTPException(status_code=400, detail=f"Model '{model}' not supported")

#     df = pd.DataFrame(historical)

#     if "close" not in df.columns:
#         raise HTTPException(status_code=400, detail="Historical data must contain 'close' prices")

#     prices = df["close"].astype(float).dropna()
#     log_returns = np.log(prices / prices.shift(1)).dropna()
#     mu = log_returns.mean()
#     sigma = log_returns.std()
#     last_price = prices.iloc[-1]

#     try:
#         module_info = MODELS[model]
#         module = importlib.import_module(module_info["module"])
#         simulate_func = getattr(module, module_info["func"])

#         # Call model-specific functions
#         if model == "ou":
#             result = simulate_func(
#                 historical=list(prices),
#                 horizon_days=horizon_days,
#                 steps=steps,
#                 num_paths=num_paths
#             )
#             simulated_paths = result["paths"]

#         elif model in ["gbm", "jump_diffusion"]:
#             simulated_paths = simulate_func(
#                 last_price=last_price,
#                 mu=mu,
#                 sigma=sigma,
#                 horizon_days=horizon_days,
#                 steps=steps,
#                 num_paths=num_paths
#             )

#         elif model == "garch":
#             result = simulate_func(
#                 historical=list(prices),
#                 horizon_days=horizon_days,
#                 steps=steps,
#                 num_paths=num_paths
#             )
#             # Handle whether result is a dict or list
#             simulated_paths = result["paths"] if isinstance(result, dict) else result

#         else:
#             raise HTTPException(status_code=400, detail=f"Model {model} not implemented")

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#     return {
#         "model": model,
#         "paths": simulated_paths,
#         "steps": steps,
#         "horizon_days": horizon_days,
#         "num_paths": num_paths
#     }
@router.post("/")
def run_simulation(payload: dict = Body(...)):
    model = payload.get("model", "").lower()
    historical = payload.get("historical")
    horizon_days = int(payload.get("horizon_days", 30))
    steps = int(payload.get("steps", 30))

    num_paths = int(payload.get("paths") or payload.get("num_paths") or 3)

    if not historical:
        raise HTTPException(status_code=400, detail="Historical data required")
    if model not in MODELS:
        raise HTTPException(status_code=400, detail=f"Model '{model}' not supported")

    df = pd.DataFrame(historical)
    if "close" not in df.columns:
        raise HTTPException(status_code=400, detail="Historical data must contain 'close' prices")

    prices = df["close"].astype(float).dropna()
    log_returns = np.log(prices / prices.shift(1)).dropna()
    mu = log_returns.mean()
    sigma = log_returns.std()
    last_price = prices.iloc[-1]

    try:
        module_info = MODELS[model]
        module = importlib.import_module(module_info["module"])
        simulate_func = getattr(module, module_info["func"])

        if model == "ou":
            result = simulate_func(
                historical=list(prices),
                horizon_days=horizon_days,
                steps=steps,
                num_paths=num_paths
            )
            simulated_paths = result["paths"]

        elif model in ["gbm", "jump_diffusion"]:
            simulated_paths = simulate_func(
                last_price=last_price,
                mu=mu,
                sigma=sigma,
                horizon_days=horizon_days,
                steps=steps,
                num_paths=num_paths
            )

        elif model == "garch":
            result = simulate_func(
                historical=list(prices),
                horizon_days=horizon_days,
                steps=steps,
                num_paths=num_paths
            )
            simulated_paths = result["paths"] if isinstance(result, dict) else result
        elif model == "arima":
            result = simulate_func(
                historical=list(prices),
                horizon_days=horizon_days,
                steps=steps,
                num_paths=num_paths
            )
            simulated_paths = result["paths"] if isinstance(result, dict) else result

        else:
            raise HTTPException(status_code=400, detail=f"Model {model} not implemented")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "model": model,
        "paths": simulated_paths,
        "steps": steps,
        "horizon_days": horizon_days,
        "num_paths": num_paths
    }
