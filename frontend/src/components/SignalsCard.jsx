import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const IconWrap = ({ children }) => (
    <div className="h-6 w-6 flex items-center justify-center translate-y-[-5px] shrink-0">
        {children}
    </div>
);

export default function SignalsCard({ signals }) {
    if (!signals) return null;

    const action = signals.suggested_actions?.[0] || "hold";

    const actionLabel =
        action === "consider_add"
            ? "Consider Adding"
            : action === "consider_reduce"
                ? "Consider Reducing"
                : "Hold";

    const iconSizeClass = "w-6 h-6";
    const icons = {
        consider_add: <TrendingUp className={`${iconSizeClass} text-emerald-500`} />,
        consider_reduce: <TrendingDown className={`${iconSizeClass} text-rose-500`} />,

        hold: <Minus className={`${iconSizeClass} text-amber-500 mt-[1px]`} />
    };

    const actionBorder =
        action === "consider_add"
            ? "border-emerald-500/70"
            : action === "consider_reduce"
                ? "border-rose-500/70"
                : "border-amber-500/70";

    const percentileColors = {
        5: "text-rose-500",
        50: "text-yellow-400",
        95: "text-emerald-500"
    };


    return (
        <div className="glass-modern mb-20 p-8 md:p-12 rounded-3xl space-y-16">

            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-extrabold gradient-text-modern mb-3">
                    Simulation Signals
                </h2>
                <p className="text-sm md:text-base text-[var(--color-text-secondary)]">
                    Extracted using stochastic simulations & probabilistic inference.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                <div className={`card-modern p-6 rounded-2xl flex flex-col space-y-4 border-l-4 ${actionBorder}`}>

                    <div className="flex items-center gap-3 leading-none">
                        <p className="text-sm font-semibold">Suggested Action</p>
                    </div>

                    <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                        {actionLabel}
                    </p>

                    <p className="text-xs text-[var(--color-text-secondary)]">
                        Based on probability-weighted market outcomes.
                    </p>
                </div>


                <div className="card-modern p-6 rounded-2xl space-y-4 flex flex-col">
                    <p className="text-sm font-semibold">Model Confidence</p>

                    <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                        {(signals.confidence * 100).toFixed(1)}%
                    </p>

                    <div className="h-2 bg-[var(--color-border-primary)]/40 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--color-accent)] transition-all duration-700"
                            style={{ width: `${(signals.confidence * 100).toFixed(1)}%` }}
                        ></div>
                    </div>

                    <p className="text-xs text-[var(--color-text-tertiary)]">
                        Confidence level of the current simulation environment.
                    </p>
                </div>



                <div className="relative card-modern p-6 rounded-2xl flex flex-col justify-between border border-white/5 hover:border-rose-500/40 transition-all">
                    <div className="absolute left-0 top-0 h-full w-1 bg-rose-500/60 rounded-l-xl"></div>

                    <div className="space-y-2">

                        <div className="flex items-center gap-3 leading-none">
                            <IconWrap>
                                <TrendingDown className={`${iconSizeClass} text-rose-500`} />
                            </IconWrap>
                            <p className="text-sm font-semibold">CVaR (95%)</p>
                        </div>

                        <p className="text-3xl font-bold text-rose-500">
                            -${signals.tail_risk_cvar95?.toFixed(2)}
                        </p>
                    </div>

                    <p className="text-xs mt-2 text-[var(--color-text-secondary)]">
                        Expected extreme downside loss at 5% tail probability.
                    </p>
                </div>


                <div className="card-modern p-6 rounded-2xl space-y-3 flex flex-col">
                    <p className="text-sm font-semibold">Percentiles</p>

                    {Object.entries(signals.percentiles_final || {}).map(([p, val]) => (
                        <div key={p} className="flex justify-between text-sm">
                            <span className="text-[var(--color-text-secondary)]">{p}th</span>
                            <span className={`font-bold ${percentileColors[p] || "text-[var(--color-text-primary)]"}`}>
                                {Math.round(val).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


                <div className="card-modern p-6 rounded-2xl space-y-4">
                    <p className="text-sm font-semibold">Target Price Probability</p>

                    <div className="flex items-center justify-between">
                        <p className="text-xl font-bold">
                            ${signals.prob_checks?.add?.target?.toLocaleString()}
                        </p>

                        <p className="text-3xl font-bold text-[var(--color-accent)]">
                            {(signals.prob_checks?.add?.prob * 100).toFixed(2)}%
                        </p>
                    </div>
                </div>

                <div className="card-modern p-6 rounded-2xl flex items-center justify-start gap-6 relative">

                    <div>
                        <p className="text-sm text-[var(--color-text-tertiary)] uppercase leading-none">Scenario</p>
                        <p className="text-3xl font-bold capitalize text-[var(--color-text-primary)] leading-none">
                            {signals.scenario?.majority}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-none">
                            Based on Monte Carlo probability clustering.
                        </p>
                    </div>
                </div>

            </div>

            <div>
                <h3 className="text-xl font-bold mb-4">Probability Checks</h3>

                <div className="flex gap-6 flex-wrap">
                    {Object.entries(signals.prob_checks || {}).map(([label, info]) => {
                        const isAdd = label === "add";
                        const isReduce = label === "reduce";

                        const borderColor = isAdd
                            ? "border-emerald-400/60"
                            : isReduce
                                ? "border-rose-400/60"
                                : "border-amber-400/60";

                        const icon = isAdd ? (
                            <IconWrap>
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </IconWrap>
                        ) : isReduce ? (
                            <IconWrap>
                                <TrendingDown className="w-5 h-5 text-rose-500 " />
                            </IconWrap>
                        ) : (

                            icons[label]
                        );

                        return (
                            <div
                                key={label}
                                className={`flex-auto p-6 rounded-2xl shadow-sm transition-all hover:shadow-md border
                                ${label === "add"
                                        ? "bg-emerald-100/20 border-emerald-100"
                                        : label === "reduce"
                                            ? "bg-rose-100/60 border-rose-100"
                                            : "bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]"
                                    }`}
                            >

                                <div className="flex items-center gap-2 mb-3 leading-none">
                                    <IconWrap>{icon}</IconWrap>
                                    <p className="text-lg font-semibold capitalize">{label}</p>
                                </div>

                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Target: {info.target.toLocaleString()}
                                </p>

                                <p className="text-lg font-bold mt-2 text-[var(--color-text-primary)]">
                                    Probability: {(info.prob * 100).toFixed(0)}%
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}