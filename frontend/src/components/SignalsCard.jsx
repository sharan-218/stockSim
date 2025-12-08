export default function SignalsCard({ signals }) {
    if (!signals) return null;

    const action = signals.suggested_actions?.[0] || "hold";

    const actionLabel =
        action === "consider_add"
            ? "Consider Adding"
            : action === "consider_reduce"
                ? "Consider Reduce"
                : "Hold";

    const actionColor =
        action === "consider_add"
            ? "bg-emerald-500"
            : action === "consider_reduce"
                ? "bg-rose-500"
                : "bg-amber-500";

    return (
        <div className="glass-modern mb-20 p-10 rounded-3xl">

            <div className="text-center mb-14">
                <h2 className="text-4xl md:text-5xl font-extrabold gradient-text-modern">
                    Simulation Signals
                </h2>
                <p className="mt-2 text-sm md:text-base text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                    Extracted using stochastic simulations & probabilistic inference.
                </p>
            </div>

            <div className="card-subtle p-8 rounded-2xl mb-16">
                <p className="text-lg font-medium text-[var(--color-text-secondary)] text-center">
                    Suggested Action
                </p>

                <div className="flex justify-center mt-5">
                    <p
                        className={`px-4 py-2 rounded-full text-white font-semibold shadow-md ${actionColor}`}
                    >
                        {actionLabel}
                    </p>
                </div>

                <div className="mt-8">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Model Confidence
                    </p>

                    <div className="mt-2 w-full h-3 bg-[var(--color-border-primary)]/40 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--color-accent)] transition-all duration-700"
                            style={{ width: `${(signals.confidence * 100).toFixed(1)}%` }}
                        ></div>
                    </div>

                    <p className="text-xs mt-2 text-[var(--color-text-tertiary)] font-semibold">
                        {(signals.confidence * 100).toFixed(1)}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">

                <div className="card-modern p-8 rounded-2xl h-full flex flex-col justify-between">
                    <div className="self-end p-2 bg-red-100 text-red-600 rounded-md">
                        <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                    </div>

                    <div className="mt-2">
                        <p className="text-sm text-[var(--color-text-tertiary)] uppercase">CVaR 95%</p>
                        <p className="text-4xl font-bold mt-1 text-[var(--color-text-primary)]">
                            {signals.tail_risk_cvar95?.toFixed(2)}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] m-0">
                            Extreme loss estimate
                        </p>
                    </div>
                </div>


                <div className="card-modern p-8 rounded-2xl h-full flex items-center justify-between">
                    <div className="opacity-30">
                        <svg className="w-20 h-20 text-[var(--color-text-secondary)]" viewBox="0 0 100 100">
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <circle cx="1" cy="1" r="1.2" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#grid)" />
                        </svg>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-[var(--color-text-tertiary)] uppercase">Scenario</p>
                        <p className="text-3xl font-bold mt-1 capitalize">
                            {signals.scenario?.majority}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-20">
                <h3 className="text-2xl font-bold mb-6">Probability Checks</h3>

                <div className="flex gap-4 flex-wrap">
                    {Object.entries(signals.prob_checks || {}).map(([label, info]) => (
                        <div
                            key={label}
                            className={`flex-auto p-6 rounded-2xl shadow-sm transition-all hover:shadow-md border backdrop-blur-xl
                                ${label === "add"
                                    ? "bg-emerald-100/60 border-emerald-300"
                                    : label === "reduce"
                                        ? "bg-rose-100/60 border-rose-300"
                                        : "bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]"
                                }`}
                        >
                            <p className="font-semibold capitalize">{label}</p>
                            <p className="mt-1 text-sm">Target: {info.target.toLocaleString()}</p>
                            <p className="mt-1 text-sm">
                                Probability: {(info.prob * 100).toFixed(2)}%
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold mb-6">Final Percentiles</h3>

                <div className="flex flex-wrap justify-between gap-4">
                    {Object.entries(signals.percentiles_final || {}).map(([p, val]) => (
                        <div key={p} className="card-subtle p-5 rounded-xl shadow-sm flex-auto">
                            <p className="font-semibold">{p}th Percentile</p>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                {Math.round(val).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
