export default function SignalsCard({ signals }) {
    if (!signals) return null;

    const action = signals.suggested_actions?.[0] || "hold";
    const actionLabel =
        action === "consider_add" ? "Consider Adding"
            : action === "consider_reduce" ? "Consider Reducing"
                : "Hold";

    const actionColor =
        action === "consider_add"
            ? "bg-[var(--color-success)]"
            : action === "consider_reduce"
                ? "bg-[var(--color-error)]"
                : "bg-[var(--color-text-muted)]";

    return (
        <div className="p-8 mb-10 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)]">
            <h2 className="text-3xl font-bold mb-6 text-[var(--color-text-primary)]">
                Simulation Signals
            </h2>

            {/* Suggested Action */}
            <div className="mb-6 p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]">
                <p className="text-lg font-semibold">
                    Suggested Action:
                    <span
                        className={`ml-2 px-3 py-1 rounded-full text-sm text-white ${actionColor}`}
                    >
                        {actionLabel}
                    </span>
                </p>
            </div>

            {/* Confidence Meter */}
            <div className="mb-6">
                <p className="text-[var(--color-text-secondary)] font-medium mb-1">Model Confidence</p>

                <div className="w-full h-3 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--color-accent)] transition-all duration-700"
                        style={{ width: `${(signals.confidence * 100).toFixed(1)}%` }}
                    ></div>
                </div>

                <p className="text-sm mt-1 text-[var(--color-text-tertiary)]">
                    {(signals.confidence * 100).toFixed(1)}%
                </p>
            </div>

            {/* CVaR */}
            <div className="mb-6 p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]">
                <p className="font-semibold text-[var(--color-text-secondary)]">
                    Tail Risk (CVaR 95%):
                    <span className="ml-2 text-[var(--color-text-primary)]">
                        {signals.tail_risk_cvar95?.toFixed(2)}
                    </span>
                </p>
            </div>

            {/* Scenario */}
            <div className="mb-6">
                <p className="text-[var(--color-text-secondary)] font-medium mb-2">Scenario</p>
                <p className="text-xl font-bold text-[var(--color-text-primary)] capitalize">
                    {signals.scenario?.majority}
                </p>
            </div>

            {/* Probability Checks */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                    Probability Checks
                </h3>

                <div className="space-y-3">
                    {Object.entries(signals.prob_checks || {}).map(([label, info]) => (
                        <div
                            key={label}
                            className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]"
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

            {/* Final Percentiles */}
            <div>
                <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                    Final Percentiles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(signals.percentiles_final || {}).map(([p, val]) => (
                        <div
                            key={p}
                            className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]"
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
