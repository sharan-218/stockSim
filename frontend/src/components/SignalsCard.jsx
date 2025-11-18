export default function SignalsCard({ signals }) {
    if (!signals) return null;

    const action = signals.suggested_actions?.[0] || "hold";

    const actionLabel =
        action === "consider_add"
            ? "Consider Adding"
            : action === "consider_reduce"
                ? "Consider Reducing"
                : "Hold";

    const actionColor =
        action === "consider_add"
            ? "bg-[var(--color-success)]"
            : action === "consider_reduce"
                ? "bg-[var(--color-error)]"
                : "bg-[var(--color-warning)]";

    return (
        <div className="card-modern mb-12 !p-10 !shadow-none">

            <h2 className="text-4xl font-bold mb-8 text-[var(--color-text-primary)]">
                Simulation Signals
            </h2>


            <div className="card-subtle mb-8 p-5 !hover:bg-transparent !hover:border-[var(--color-border-primary)]">
                <p className="text-xl font-semibold text-[var(--color-text-secondary)]">
                    Suggested Action
                </p>
                <span
                    className={`inline-block mt-3 px-4 py-2 rounded-full text-sm font-semibold text-white ${actionColor}`}
                >
                    {actionLabel}
                </span>
            </div>


            <div className="mb-10">
                <p className="text-[var(--color-text-secondary)] font-medium mb-2">
                    Model Confidence
                </p>

                <div className="w-full h-3 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--color-accent)] transition-all duration-700 ease-out"
                        style={{ width: `${(signals.confidence * 100).toFixed(1)}%` }}
                    ></div>
                </div>

                <p className="text-sm mt-2 text-[var(--color-text-tertiary)] font-medium">
                    {(signals.confidence * 100).toFixed(1)}%
                </p>
            </div>

            <div className="card-subtle mb-8 p-5 flex items-center justify-between !hover:bg-transparent !hover:border-[var(--color-border-primary)]">
                <span className="font-semibold text-[var(--color-text-secondary)]">
                    Risk Tail (CVaR 95%)
                </span>
                <span className="text-xl font-bold text-[var(--color-text-primary)]">
                    {signals.tail_risk_cvar95?.toFixed(2)}
                </span>
            </div>


            <div className="card-subtle mb-8 p-5 flex items-center justify-between !hover:bg-transparent !hover:border-[var(--color-border-primary)]">
                <span className="font-semibold text-[var(--color-text-secondary)]">
                    Scenario
                </span>
                <span className="text-2xl font-bold capitalize text-[var(--color-text-primary)]">
                    {signals.scenario?.majority}
                </span>
            </div>

            <div className="mb-12">
                <h3 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">
                    Probability Checks
                </h3>

                <div className="space-y-4">
                    {Object.entries(signals.prob_checks || {}).map(([label, info]) => (
                        <div
                            key={label}
                            className="card-subtle p-4 !hover:bg-transparent !hover:border-[var(--color-border-primary)]"
                        >
                            <p className="font-semibold capitalize text-[var(--color-text-primary)]">
                                {label}
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Target: {info.target.toLocaleString()}
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Probability: {(info.prob * 100).toFixed(2)}%
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">
                    Final Percentiles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(signals.percentiles_final || {}).map(([p, val]) => (
                        <div
                            key={p}
                            className="card-subtle p-4 !hover:bg-transparent !hover:border-[var(--color-border-primary)]"
                        >
                            <p className="font-semibold text-[var(--color-text-primary)]">
                                {p}th Percentile
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                {Math.round(val).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
