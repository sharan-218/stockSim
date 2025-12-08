from app.models import gbm, ou, garch, jump_diffusion,heston,hybrid_arima
def run_simulation(model_name: str, params: dict):
    if model_name == "gbm":
        return gbm.simulate_gbm(
            S0=params["S0"],
            mu=params["mu"],
            sigma=params["sigma"],
            T=params["T"],
            N=params["N"],
            paths=params["paths"]
        )
    elif model_name == "ou":
        return ou.simulate_ou(**params)
    elif model_name == "garch":
        return garch.simulate_garch(**params)
    elif model_name == "jump_diffusion":
        return jump_diffusion.simulate_jump_diffusion(**params)
    elif model_name == "heston":
        return heston.simulate_heston(**params)
    elif model_name == "hybrid_arima":
        return hybrid_arima.simulate_hybrid_arima(**params)
    else:
        raise ValueError(f"Model '{model_name}' not implemented")
