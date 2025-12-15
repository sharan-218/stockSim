import { useState } from "react";
import { Link } from "react-router-dom";
import SymbolInput from "../components/SymbolInput";
import ModelSelect from "../components/ModelSelect";
import Chart from "../components/Chart";
import SignalsCard from "../components/SignalsCard";
import HeatMap from "../components/HeatMap";
import FloatImg from "../components/FloatImg";
import axios from 'axios'

import { TrendingUpDown, BadgePercent, ChartSpline, Activity, LineChart, Waves, Zap, Sigma, BarChart2, Cpu, Radar } from "lucide-react"
const modeIcons = {
    paths: <TrendingUpDown size={18} />,
    percentiles: <BadgePercent size={18} />,
    average: <ChartSpline size={18} />,

}
export const MODEL_INFO = [
    {
        id: "gbm",
        name: "Geometric Brownian Motion (GBM)",
        icon: <Activity className="w-6 h-6 text-blue-400" />,
        description:
            "Simulates price as a continuously drifting and compounding random walk.",
        working:
            "Estimates drift and volatility from log returns, then generates stochastic price paths.",
    },
    {
        id: "ou",
        name: "Ornstein–Uhlenbeck (OU)",
        icon: <Waves className="w-6 h-6 text-emerald-400" />,
        description:
            "A mean-reverting process where prices gravitate toward a long-term average.",
        working:
            "Uses reversion speed, long-term mean, and volatility to simulate pull-back toward equilibrium.",
    },
    {
        id: "garch",
        name: "GARCH (1,1)",
        icon: <LineChart className="w-6 h-6 text-purple-400" />,
        description:
            "Models volatility clustering with alternating periods of high and low variance.",
        working:
            "Fits GARCH parameters to returns and simulates paths with time-varying volatility.",
    },
    {
        id: "jump_diffusion",
        name: "Jump Diffusion",
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
        description:
            "Extends GBM by adding sudden jumps that capture rare market shocks.",
        working:
            "Combines continuous diffusion with a Poisson-driven jump process for extreme events.",
    },
    {
        id: "heston",
        name: "Heston Model",
        icon: <Sigma className="w-6 h-6 text-rose-400" />,
        description:
            "A stochastic volatility model where volatility itself fluctuates randomly.",
        working:
            "Simulates coupled price and variance equations with correlated randomness.",
    },
    {
        id: "hybrid_arima",
        name: "Hybrid ARIMA",
        icon: <BarChart2 className="w-6 h-6 text-indigo-400" />,
        description:
            "Combines classical ARIMA forecasting with ML-based residual correction.",
        working:
            "Forecasts trend using ARIMA, then adjusts predictions using learned residual patterns.",
    },
    {
        id: "kalman",
        name: "Kalman Filter",
        icon: <Radar className="w-6 h-6 text-cyan-400" />,
        description:
            "A recursive estimator that infers true states from noisy observations.",
        working:
            "Predicts next state and corrects it using real data to refine hidden variables.",
    },
    {
        id: "tiny_mlp",
        name: "Tiny MLP",
        icon: <Cpu className="w-6 h-6 text-orange-400" />,
        description:
            "A lightweight neural network that learns return patterns from past data",
        working:
            "Uses a single hidden layer to recursively predict future returns for simulation.",
    },
    {
        id: "hmm",
        name: "Hidden Markov Model",
        icon: <Radar className="w-6 h-6 text-pink-400" />,
        description:
            "Learns hidden market regimes and switches between them probabilistically.",
        working:
            "IEstimates hidden states using transition probabilities and observed price sequences.",
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
                <FloatImg imgSrc="/assets/bg.png" alt="crypto" />
                <h1 className="text-5xl sm:text-7xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight mb-6 drop-shadow-[0_0px_30px_rgba(0,0,0,0.2)]">
                    <span className="bg-gradient-to-r from-[var(--color-text-primary)] via-[var(--color-accent-muted)] to-[var(--color-text-tertiary)] bg-clip-text text-transparent animate-gradient-x">
                        Crypseer
                    </span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto font-light mb-10 leading-relaxed relative animate-fade-in">
                    Turning financial uncertainty into actionable insights.
                    <br />
                    <span className="text-[var(--color-text-tertiary)] text-sm sm:text-base md:text-lg">
                        The market whispers, let the data translate it.
                    </span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4 animate-fade-up">

                    <Link
                        to="/backtest"
                        className="px-12 py-4 text-lg rounded-2xl bg-[var(--color-accent)]/90 text-white font-semibold shadow-lg shadow-[rgba(0,0,0,0.15)] hover:bg-[var(--color-accent-muted)] hover:shadow-[0_0_10px_rgba(0,0,0,0.2)] active:scale-[0.97] transition-all duration-200 backdrop-blur-sm "
                    >
                        Launch Backtester
                    </Link>

                    <a
                        href="#models"
                        className="px-12 py-4 text-lg rounded-2xl 
                       border border-[var(--color-border-secondary)] bg-white/30 backdrop-blur-md text-[var(--color-text-primary)] hover:bg-white/40 hover:shadow-[0_0_10px_rgba(0,0,0,0.1)] active:scale-[0.97] transition-all duration-200"
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


                {state.signals && <SignalsCard signals={state.signals} simulated={state.simulated} />}

                {state.simulated.length > 0 && (
                    <div className="p-3 mt-10 mb-20 bg-transparent h-[55vh] md:h-[65vh] lg:h-[70vh]">
                        <HeatMap simulatedPaths={state.simulated} />
                    </div>
                )}

                <div className="mx-auto max-w-7xl py-16" id="models">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-extrabold gradient-text-modern mb-2">
                            Meet the Simulation Models
                        </h2>
                        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-sm md:text-base">
                            Each model offers a unique approach to forecasting, from classic financial theories
                            to cutting-edge machine learning.
                        </p>
                    </div>


                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4">
                        {MODEL_INFO.map((m) => (
                            <div
                                key={m.id}
                                onClick={() => setState((p) => ({ ...p, model: m.id }))}
                                className={`group cursor-pointer rounded-2xl p-6 bg-[var(--color-bg-secondary)]/80 border border-[var(--color-border-primary)] shadow-xs transition-all duration-250  hover:shadow-[0_0_8px_rgba(0,0,0,0.2)] hover:-translate-y-1 flex flex-col gap-3 
                                    ${state.model === m.id ? "ring-2 ring-[var(--color-accent)] ring-offset-2" : ""}`}
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--color-text-primary)]/70 to-[var(--color-accent)]/100 shadow-inner group-hover:scale-105 transition-transform">
                                    {m.icon}
                                </div>


                                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                    {m.name}
                                </h3>

                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    {m.description}
                                </p>
                                {/* <p className="mt-auto text-xs italic opacity-80 text-[var(--color-text-tertiary)]">
                                    {m.working}
                                </p> */}
                            </div>
                        ))}
                    </div>
                </div>

            </div>


            <footer className="bg-[var(--color-bg-primary)] mt-10">
                <p className="text-center text-xs text-[var(--color-text-tertiary)] my-auto py-6">
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
