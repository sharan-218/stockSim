import { useState } from "react";
import SymbolInput from "../components/SymbolInput";
import ModelSelect from "../components/ModelSelect";
import Chart from "../components/Chart";
import SignalsCard from "../components/SignalsCard";
import HeatMap from "../components/HeatMap";

import axios from "axios";
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
];

export default function Home() {
    const [state, setState] = useState({
        symbol: "BTCUSDT",
        model: "gbm",
        historical: [],
        simulated: [],
        signals: null,
        loading: false,
        error: null,
        num_paths: 3,
    });

    /**
     * Fetches historical data for the given symbol and then requests a simulation
     * based on the selected model and parameters.
     * @param {string} symbol - The crypto/asset symbol to analyze (e.g., BTCUSDT).
     */
    const fetchData = async (symbol) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const dataUrl = `${import.meta.env.VITE_SERVER_DATA}/${symbol}?interval=1d&limit=30`;
        const simUrl = import.meta.env.VITE_SERVER_SIMULATE;
        try {
            const dataResp = await axios.get(dataUrl);
            const simResp = await axios.post(simUrl, {
                model: state.model,
                historical: dataResp.data,
                horizon_days: 30,
                steps: 30,
                num_paths: Number(state.paths) || 3,
            });
            let simulatedPaths = [];
            const signals = simResp.data.signals || {};
            if (Array.isArray(simResp.data.paths)) {
                simulatedPaths = simResp.data.paths;
            } else if (simResp.data.paths?.paths) {
                simulatedPaths = simResp.data.paths.paths;
            }

            setState((prev) => ({
                ...prev,
                symbol: symbol,
                historical: dataResp.data,
                simulated: simulatedPaths,
                signals: signals,
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
        <div className="bg-[var(--color-bg-primary)] min-h-screen flex flex-col w-full text-[var(--color-text-primary)]">
            <div className="section-padding max-w-7xl mx-auto flex-grow w-full">


                <header className="text-center mb-10 pt-10">
                    <h1 className="text-6xl md:text-8xl font-extrabold mb-2 tracking-tight leading-tight text-[var(--color-text-primary)]">
                        <span className="gradient-text-modern">Crypseer</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] font-light max-w-3xl mx-auto">
                        It is in Data, Reveal it.
                    </p>
                </header>


                <div className="p-8 mb-6 rounded-2xl shadow-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)]">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="form-control-modern flex-1">
                            <label className="text-[var(--color-text-tertiary)] font-medium mb-1 block">
                                Enter Symbol
                            </label>
                            <SymbolInput onSubmit={(sym) => fetchData(sym)} />
                        </div>

                        <div className="form-control-modern flex-1 sm:max-w-xs mt-1">
                            <ModelSelect
                                model={state.model}
                                setModel={(model) => setState((prev) => ({ ...prev, model }))}
                            />
                        </div>

                        <div className="form-control-modern sm:max-w-xs">
                            <label className="text-[var(--color-text-tertiary)] font-medium mb-1 block">
                                Paths
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="3"
                                onChange={(e) =>
                                    setState((prev) => ({ ...prev, paths: Number(e.target.value) }))
                                }
                                className="input-modern"
                            />
                        </div>
                    </div>

                    <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
                        Current Model: <span className="font-semibold">{currentModel.name}</span>
                    </p>
                </div>

                {state.loading && (
                    <div className="p-4 rounded-xl border border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)] flex items-center gap-3 mb-4 text-sm text-[var(--color-text-secondary)]">
                        <span className="animate-spin h-5 w-5 border-2 border-r-transparent border-[var(--color-text-primary)] rounded-full"></span>
                        <span>Loading data and simulation...</span>
                    </div>
                )}

                {state.error && (
                    <div className="p-4 rounded-xl border border-[var(--color-error)] bg-red-50 flex items-center gap-3 mb-4 text-sm text-[var(--color-error)]">
                        <span>{state.error}</span>
                    </div>
                )}


                {state.historical.length > 0 && (
                    <div className="p-4 mb-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)]">
                        <Chart
                            historical={state.historical}
                            simulatedPaths={state.simulated}
                        />
                    </div>
                )}
                {state.signals && <SignalsCard signals={state.signals} />}
                {
                    state.simulated.length > 0 && (
                        <div className="w-full  
                h-[55vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] 
                min-h-[280px] 
                rounded-2xl p-2 
                bg-transparent mb-20">
                            <HeatMap simulatedPaths={state.simulated} />
                        </div>
                    )
                }
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-25">
                    {MODEL_INFO.map((m) => (
                        <div
                            key={m.id}
                            className=" p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]
                                            shadow-sm flex flex-col h-full
                                            transform transition-all duration-300 ease-out
                                            hover:-translate-y-1 hover:shadow-2xl
                                            "

                            style={{ borderLeft: m.id === state.model ? '4px solid var(--color-accent)' : '3px solid transparent' }}
                        >
                            <h3 className="text-lg font-semibold mb-2">{m.name}</h3>
                            <p className="text-sm text-[var(--color-text-secondary)] flex-grow">{m.description}</p>
                            <p className="text-xs italic text-[var(--color-text-tertiary)] mt-2">{m.working}</p>
                        </div>
                    ))}
                </div>
            </div>



            <footer className="w-full bg-[var(--color-bg-primary)]">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="border-t border-[var(--color-border-primary)] mt-10"></div>
                    <p className="text-center text-xs text-[var(--color-text-tertiary)] py-4">
                        Developed by <a
                            href="https://yskfolio.netlify.app"
                            className="text-[var(--color-text-primary)] hover:underline font-semibold"
                        >
                            Sharan❤️
                        </a>
                    </p>
                </div>
            </footer>
        </div>

    );
}