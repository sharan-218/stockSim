import { useState } from "react";
import { Link } from "react-router-dom";
import SymbolInput from "../components/SymbolInput";
import ModelSelect from "../components/ModelSelect";
import Chart from "../components/Chart";
import SignalsCard from "../components/SignalsCard";
import HeatMap from "../components/HeatMap";
import FloatImg from "../components/FloatImg";
import axios from 'axios'

import { TrendingUpDown, BadgePercent, ChartSpline } from "lucide-react";

const modeIcons = {
    paths: <TrendingUpDown size={18} />,
    percentiles: <BadgePercent size={18} />,
    average: <ChartSpline size={18} />,

}
const MODEL_INFO = [
    {
        id: "gbm",
        name: "Geometric Brownian Motion (GBM)",
        description:
            "Simulates price paths assuming continuous compounding with constant drift and volatility.",
        working:
            "Uses historical log returns to estimate drift (mu) and volatility (sigma) and generates future paths.",
    },
    {
        id: "ou",
        name: "Ornstein–Uhlenbeck (OU)",
        description:
            "A mean-reverting stochastic process where prices drift back toward a long-term mean.",
        working:
            "Estimates reversion speed (theta), long-term mean (mu), and volatility to simulate realistic behavior.",
    },
    {
        id: "garch",
        name: "GARCH (1,1)",
        description:
            "Captures time-varying volatility by modeling clusters of high and low variance.",
        working:
            "Fits GARCH parameters to historical returns and simulates returns with dynamic volatility.",
    },
    {
        id: "jump_diffusion",
        name: "Jump Diffusion",
        description:
            "Extends GBM by adding sudden, discrete price jumps,  capturing real-world shock events.",
        working:
            "Combines a continuous diffusion process with a jump process to model rare extreme moves.",
    },
    {
        id: "heston",
        name: "Heston Model",
        description:
            "A stochastic volatility model where volatility itself follows a random process.",
        working:
            "Uses coupled stochastic differential equations to simulate correlated price & variance evolution.",
    },
    {
        id: "hybrid_arima",
        name: "Hybrid ARIMA",
        description:
            "A stochastic volatility model where volatility itself follows a random process.",
        working:
            "A hybrid model that combines ARIMA trend forecasting with machine-learned residual corrections to generate more realistic future price paths",
    },
    {
        id: "kalman",
        name: "Kalman",
        description:
            "It is an optimal estimation algorithm that predicts a parameter of interests such as location, speed, and direction in the presence of noise and measurements",
        working:
            "It estimates the true state of a dynamic system from noisy, incomplete measurements over time, using a two-step recursive process of prediction (guessing the next state) and correction/update (refining the guess with actual observations)",
    },
    {
        id: "tiny_mlp",
        name: "Tiny MLP",
        description:
            "A lightweight, single-hidden-layer neural network that learns patterns in past log-returns and recursively predicts future returns for price simulation.",
        working:
            "Tiny MLP is a lightweight neural network that learns patterns from past log-returns. and predicts the next return using a single hidden layer and recursive forecasting.",
    },
    {
        id: "hmm",
        name: "Hidden Markov Model",
        description:
            "A a statistical model used to analyze sequential data where the underlying causes or states are unobservable (hidden), but can be inferred from a sequence of observable outcomes",
        working:
            "A Hidden Markov Model infers the most likely sequence of unobservable, underlying states by analyzing a sequence of observable outcomes based on predefined probabilities for moving between states and generating observations.",
    },
];

export default function Home() {
    const [chartMode, setChartMode] = useState("paths");
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

    const fetchData = async (symbol) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const dataUrl = `${import.meta.env.VITE_SERVER_DATA}/${symbol}?interval=1d&limit=1000`;
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

            const simulatedPaths =
                Array.isArray(simResp.data.paths)
                    ? simResp.data.paths
                    : simResp.data.paths?.paths || [];

            setState((prev) => ({
                ...prev,
                symbol,
                historical: dataResp.data,
                simulated: simulatedPaths,
                signals: simResp.data.signals || {},
                loading: false,
            }));
        } catch (err) {
            console.error("Simulation Error:", err);
            setState((prev) => ({
                ...prev,
                loading: false,
                error: "Failed to fetch data or run simulation.",
            }));
        }
    };

    const currentModel = MODEL_INFO.find((m) => m.id === state.model);

    return (
        <div className="home">
            <section className="relative py-28 overflow-visible flex flex-col items-center text-center">
                <FloatImg imgSrc="/assets/fc.png" alt="crypto" />

                <div className="absolute inset-0 -z-20">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] 
            bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent 
            rounded-full blur-3xl opacity-60 animate-pulse"></div>

                    <div className="absolute bottom-10 right-10 w-[300px] h-[300px] 
            bg-gradient-to-br from-emerald-400/20 to-transparent 
            rounded-full blur-2xl opacity-40"></div>
                </div>

                {/* <div className="absolute inset-0 -z-10 opacity-[0.09]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.7" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div> */}



                <h1 className="text-5xl sm:text-7xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight mb-6 
        drop-shadow-[0_0px_30px_rgba(0,0,0,0.2)]">
                    <span className="bg-gradient-to-r from-[var(--color-text-primary)] 
        via-[var(--color-accent-muted)] to-[var(--color-text-tertiary)] 
        bg-clip-text text-transparent animate-gradient-x">
                        Crypseer
                    </span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto 
       font-light mb-10 leading-relaxed relative animate-fade-in">
                    Turning financial uncertainty into actionable insights.
                    <br />
                    <span className="text-[var(--color-text-tertiary)] text-sm sm:text-base md:text-lg">
                        The market whispers, let the data translate it.
                    </span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4 animate-fade-up">

                    <Link
                        to="/backtest"
                        className="px-12 py-4 text-lg rounded-2xl bg-[var(--color-accent)] text-white 
            font-semibold shadow-lg shadow-[rgba(0,0,0,0.15)]
            hover:bg-[var(--color-accent-muted)] hover:shadow-[0_0_25px_rgba(0,0,0,0.2)]
            active:scale-[0.97] transition-all duration-200 
            backdrop-blur-xl"
                    >
                        Launch Backtester
                    </Link>

                    <a
                        href="#models"
                        className="px-12 py-4 text-lg rounded-2xl 
                       border border-[var(--color-border-secondary)]
            bg-white/30 backdrop-blur-md text-[var(--color-text-primary)]
            hover:bg-white/40 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]
            active:scale-[0.97] transition-all duration-200"
                    >
                        Explore Models
                    </a>
                </div>
            </section>



            <div className="section-padding max-w-7xl mx-auto w-full flex-grow">


                <div className="glass-modern p-8 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="label-modern ">Symbol</label>
                            <SymbolInput onSubmit={(sym) => fetchData(sym)} />
                        </div>

                        <div>
                            <ModelSelect
                                model={state.model}
                                setModel={(model) => setState((p) => ({ ...p, model }))}
                            />
                        </div>

                        <div>
                            <label className="text-[var(--color-text-tertiary)] font-medium mb-1 block">Paths</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="3"
                                onChange={(e) =>
                                    setState((prev) => ({ ...prev, paths: Number(e.target.value) }))
                                }
                                className="input-modern w-full"
                            />
                        </div>
                    </div>

                    <p className="text-center mt-4 text-sm text-[var(--color-text-tertiary)]">
                        Current Model: <span className="font-semibold">{currentModel?.name}</span>
                    </p>
                </div>

                {state.loading && (
                    <div className="glass-modern p-4 flex items-center gap-3 mb-6 text-sm">
                        <span className="animate-spin h-5 w-5 border-2 border-[var(--color-text-primary)] border-r-transparent rounded-full"></span>
                        Loading data & simulation…
                    </div>
                )}

                {state.error && (
                    <div className="card-subtle border-red-400 p-4 text-red-500 mb-6">
                        {state.error}
                    </div>
                )}

                {state.historical.length > 0 && (
                    <div className="glass-modern p-6 mb-10">
                        <div className="flex flex-wrap justify-end gap-3 mb-6">
                            {["paths", "percentiles", "average"].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setChartMode(mode)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border
                                        ${chartMode === mode
                                            ? "bg-[var(--color-accent)] text-white border-transparent"
                                            : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-primary)] hover:bg-[var(--color-hover)]"
                                        }`}
                                >
                                    {modeIcons[mode]}

                                </button>
                            ))}
                        </div>

                        <Chart
                            historical={state.historical}
                            simulatedPaths={state.simulated}
                            mode={chartMode}
                            percentileStepwise={state.signals?.percentiles_stepwise}
                        />
                    </div>
                )}


                {state.signals && <SignalsCard signals={state.signals} />}


                {state.simulated.length > 0 && (
                    <div className="rounded-2xl p-3 mt-10 mb-20 bg-transparent h-[55vh] md:h-[65vh] lg:h-[70vh]">
                        <HeatMap simulatedPaths={state.simulated} />
                    </div>
                )}

                <div className="mx-auto max-w-7xl py-12" id="models">
                    <h2 className="text-3xl font-bold text-center mb-6">Model Selection</h2>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {MODEL_INFO.map((m) => (
                            <div
                                key={m.id}
                                className={`card-modern transition-all duration-300 hover:scale-[1.01] ${m.id === state.model ? "border-l-4 border-[var(--color-accent)]" : ""
                                    }`}
                            >
                                <h3 className="text-lg font-semibold">{m.name}</h3>
                                <p className="mt-2 text-[var(--color-text-secondary)]">
                                    {m.description}
                                </p>
                                <p className="mt-2 text-sm italic opacity-70">
                                    {m.working}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <footer className="bg-[var(--color-bg-primary)] mt-10">
                <p className="text-center text-xs text-[var(--color-text-tertiary)] py-4">
                    Developed by{" "}
                    <a
                        href="https://yskfolio.netlify.app"
                        className="text-[var(--color-accent)] hover:underline font-semibold"
                    >
                        Sharan ❤️
                    </a>
                </p>
            </footer>
        </div>
    );
}
