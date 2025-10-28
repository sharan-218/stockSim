import { useState } from "react";
import SymbolInput from "../components/SymbolInput";
import ModelSelect from "../components/ModelSelect";
import Chart from "../components/Chart";
import axios from "axios";

// Defines the models used for simulation and provides descriptions for the UI
const MODEL_INFO = [
    {
        id: "gbm",
        name: "Geometric Brownian Motion (GBM)",
        description:
            "Simulates price paths assuming continuous compounding with constant drift and volatility.",
        working:
            "Uses historical log returns to estimate drift (mu) and volatility (sigma) and generates multiple future paths.",
    },
    {
        id: "ou",
        name: "Ornstein–Uhlenbeck (OU)",
        description:
            "A mean-reverting stochastic process. Prices tend to drift toward a long-term average (mu) with some volatility.",
        working:
            "Estimates mean-reversion speed (theta), long-term mean (mu), and volatility (sigma) from historical data and simulates paths.",
    },
    {
        id: "garch",
        name: "GARCH (1,1)",
        description:
            "Models time-varying volatility in a price series, capturing volatility clustering.",
        working:
            "Fits GARCH parameters to historical returns and simulates future returns with dynamic volatility.",
    },
    {
        id: "jump_diffusion",
        name: "Jump Diffusion",
        description:
            "Extends GBM by including random jumps to capture sudden large movements in the market.",
        working:
            "Simulates paths using GBM with added random jumps determined by a Poisson process.",
    },
    {
        id: "arima",
        name: "Arima",
        description:
            "ARIMA models are primarily used for short-term forecasting of financial time series data and economic indicators",
        working:
            "ARIMA quant model forecasts future values in a time series by modeling its dependence on its own past values, the number of times it has been differenced to achieve stationarity, and past forecast errors.",
    },
];

export default function Home() {
    const [state, setState] = useState({
        symbol: "BTCUSDT",
        model: "gbm",
        historical: [],
        simulated: [],
        loading: false,
        error: null,
        paths: 3,
    });

    /**
     * Fetches historical data for the given symbol and then requests a simulation
     * based on the selected model and parameters.
     * @param {string} symbol - The crypto/asset symbol to analyze (e.g., BTCUSDT).
     */
    const fetchData = async (symbol) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const dataUrl = `https://stocksim-4zqk.onrender.com/data/${symbol}?interval=1d&limit=30`;
        const simUrl = "https://stocksim-4zqk.onrender.com/simulate/";
        try {
            const dataResp = await axios.get(dataUrl);
            const simResp = await axios.post(simUrl, {
                model: state.model,
                historical: dataResp.data,
                horizon_days: 30,
                steps: 30,
                num_paths: Number(state.paths) || 1,
            });
            let simulatedPaths = [];
            if (Array.isArray(simResp.data.paths)) {
                simulatedPaths = simResp.data.paths;
            } else if (simResp.data.paths?.paths) {
                simulatedPaths = simResp.data.paths.paths;
            }

            setState((prev) => ({
                ...prev,
                symbol: symbol.toUpperCase(),
                historical: dataResp.data,
                simulated: simulatedPaths,
                loading: false,
            }));
        } catch (err) {
            console.error("Simulation or Data Fetch Error:", err);
            setState((prev) => ({
                ...prev,
                loading: false,
                error: "Failed to fetch data or run simulation.",
            }));
        }
    };

    const currentModel = MODEL_INFO.find(m => m.id === state.model) || MODEL_INFO[0];

    return (
        <div className="bg-neutral-950 min-h-screen flex flex-col w-full">
            <div className="section-padding max-w-7xl mx-auto flex-grow w-full"> 
            
                <header className="text-center mb-10 pt-10">
                    <h1 className="text-6xl md:text-7xl font-extrabold mb-2 tracking-tight leading-tight">
                        <span className="gradient-text-modern">Crypseer</span> 
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-400 font-light max-w-3xl mx-auto">
                        Be the future
                    </p>
                </header>
                <div className="card-elevated p-8 mb-6 glow">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="form-control-modern flex-1"> 
                            <label className="label-modern">Enter Symbol (e.g., BTCUSDT)</label>
                            <SymbolInput onSubmit={(sym) => fetchData(sym)} />
                        </div>

                        <div className="form-control-modern flex-1 sm:max-w-xs">
                            <ModelSelect
                                model={state.model}
                                setModel={(model) => setState((prev) => ({ ...prev, model }))}
                            />
                        </div>
                        <div className="form-control-modern flex-1 sm:max-w-xs">
                            <label className="label-modern">Number of Paths (1-50)</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={state.paths}
                                onChange={(e) =>
                                    setState((prev) => ({ ...prev, paths: Math.min(50, Math.max(1, Number(e.target.value))) }))
                                }
                                className="input-modern w-full"
                            />
                        </div>
                    </div>
                    
                    <p className="mt-4 text-center text-sm text-neutral-500">
                        Current Model: <span className="font-semibold text-neutral-300">{currentModel.name}</span>
                    </p>

                </div>
                
                {/* Loading & Error Alerts */}
                {state.loading && (
                    <div className="p-4 rounded-xl border border-neutral-700 bg-neutral-900 flex items-center gap-3 mb-4 text-sm text-neutral-300 shimmer">
                        <span className="animate-spin h-5 w-5 border-2 border-r-transparent border-white rounded-full"></span>
                        <span>Loading data and simulation...</span>
                    </div>
                )}
                
                {state.error && (
                    <div className="p-4 rounded-xl border border-red-700 bg-red-950 flex items-center gap-3 mb-4 text-sm text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{state.error}</span>
                    </div>
                )}

                {/* Chart Card (Visible only when data is available) */}
                {state.historical.length > 0 && (
                    <div className="card-elevated p-8 mb-6">
                        <Chart
                            historical={state.historical}
                            simulatedPaths={state.simulated}
                        />
                    </div>
                )}

                {/* Model Info Cards (Uses custom card-subtle class) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MODEL_INFO.map((m) => (
                        <div 
                            key={m.id} 
                            className="card-subtle flex flex-col h-full" 
                            style={{ borderLeft: m.id === state.model ? '3px solid var(--color-border-active)' : '3px solid transparent' }}
                        >
                            <h3 className="text-lg font-semibold mb-2">{m.name}</h3>
                            <p className="text-sm text-neutral-400 flex-grow">{m.description}</p>
                            <p className="text-xs italic text-neutral-500 mt-2">{m.working}</p>
                        </div>
                    ))}
                </div>
            </div>
            <footer className="w-full bg-neutral-950">
                {/* A simple divider can remain inside the max-width for aesthetic centering */}
                <div className="divider-modern mb-4 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12"></div> 
                <div className="pb-4 pt-2"> {/* Added padding for separation */}
                    <p className="text-center text-xs text-neutral-600">
                        Developed by <a 
                            href="https://yskfolio.netlify.app" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-neutral-400 hover:text-white transition-colors duration-200 font-semibold"
                        >
                            Sharan
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}