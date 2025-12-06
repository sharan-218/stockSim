
import React, { useEffect, useState, useMemo } from "react";
import BacktestChart from "../components/BacktestChart";
import PriceChart from "../components/PriceChart";
import StrategySelect from "../components/StrategySelect";
import BacktestControls from "../components/BacktestControls";
import { runBacktest } from "../utils/useBacktest";
import { Link } from 'react-router-dom'
export default function BacktestPage() {
    const [data, setData] = useState(null);
    const [strategy, setStrategy] = useState("sma");
    const [symbol, setSymbol] = useState("BTCUSDT");
    const [limit, setLimit] = useState(365);
    const [initialCapital, setInitialCapital] = useState(1000);
    const [loading, setLoading] = useState(false);

    const handleRunBacktest = async () => {
        setLoading(true);
        try {
            const result = await runBacktest({
                strategy,
                symbol,
                limit,
                initialCapital,
            });
            setData(result);
        } catch (err) {
            console.error("Backtest error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleRunBacktest();
    }, []);

    const metrics = useMemo(() => {
        if (!data) return null;

        const finalValue = data.final_value ?? 0;
        const totalReturnPct =
            initialCapital > 0
                ? ((finalValue / initialCapital - 1) * 100).toFixed(2)
                : "0.00";

        const maxDDPct = (data.max_drawdown * 100).toFixed(2);

        const barsTested = data.closes?.length ?? 0;

        return {
            finalValue: finalValue.toFixed(2),
            totalReturnPct,
            maxDDPct,
            barsTested,
        };
    }, [data, initialCapital]);

    if (!data || !metrics) {
        return (
            <div className="home min-h-screen flex items-center justify-center">
                <div className="glass-modern max-w-md w-full text-center">
                    <p className="text-lg text-[var(--color-text-secondary)] shimmer">
                        Running your first backtest…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="home min-h-screen flex justify-center">
            <div className="w-full max-w-[1650px] flex flex-col lg:flex-row gap-8 px-6 lg:px-10 xl:px-12 py-10">

                <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 glass-modern flex flex-col gap-6 h-fit lg:sticky lg:top-8">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <div>
                            <h1 className="gradient-text-modern text-2xl font-semibold">
                                Backtester
                            </h1>
                            <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                                Configure strategy & parameters.
                            </p>

                            <Link to="/" className="text-sm text-[var(--color-bg-tertiary)] mt-1">
                                Home
                            </Link>
                        </div>
                    </div>

                    <div className="card-subtle">
                        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                            Strategy
                        </h2>
                        <StrategySelect strategy={strategy} setStrategy={setStrategy} />
                    </div>

                    <div className="card-subtle">
                        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                            Parameters
                        </h2>
                        <BacktestControls
                            symbol={symbol}
                            setSymbol={setSymbol}
                            limit={limit}
                            setLimit={setLimit}
                            initialCapital={initialCapital}
                            setInitialCapital={setInitialCapital}
                        />
                    </div>

                    <button
                        onClick={handleRunBacktest}
                        className="btn-modern w-full mt-1 transition-smooth"
                        disabled={loading}
                    >
                        {loading ? "Running Backtest..." : "Run Backtest"}
                    </button>

                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                        Tip: adjust the lookback period to stress-test strategies across
                        different regimes.
                    </p>
                </aside>


                <main className="flex-1 flex flex-col gap-6 lg:gap-8 px-3">

                    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-semibold text-[var(--color-text-primary)]">
                                Backtest Overview
                            </h2>
                            <p className="text-sm md:text-base text-[var(--color-text-secondary)] mt-2 text-balance">
                                Visualize performance, risk and behavior of{" "}
                                <span className="font-semibold">{strategy.toUpperCase()}</span> on{" "}
                                <span className="font-semibold">{symbol}</span> over the last{" "}
                                <span className="font-semibold">{limit}</span> candles.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 md:justify-end">
                            <div className="badge-modern text-xs md:text-sm text-[var(--color-active)]">
                                Bars: {metrics.barsTested}
                            </div>
                            <div className="badge-modern text-xs md:text-sm text-[var(--color-active)]">
                                Initial: ${initialCapital.toLocaleString()}
                            </div>
                        </div>
                    </header>

                    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                        <div className="card-modern">
                            <p className="text-xs uppercase tracking-wide text-[var(--color-text-tertiary)] mb-1">
                                Final Portfolio Value
                            </p>
                            <p className="text-2xl md:text-3xl font-semibold">
                                ${Number(metrics.finalValue).toLocaleString()}
                            </p>
                        </div>

                        <div className="card-modern">
                            <p className="text-xs uppercase tracking-wide text-[var(--color-text-tertiary)] mb-1">
                                Total Return
                            </p>
                            <p
                                className={`text-2xl md:text-3xl font-semibold ${Number(metrics.totalReturnPct) >= 0
                                    ? "text-emerald-600"
                                    : "text-rose-600"
                                    }`}
                            >
                                {metrics.totalReturnPct}%
                            </p>
                        </div>

                        <div className="card-modern">
                            <p className="text-xs uppercase tracking-wide text-[var(--color-text-tertiary)] mb-1">
                                Max Drawdown
                            </p>
                            <p className="text-2xl md:text-3xl font-semibold text-rose-600">
                                {metrics.maxDDPct}%
                            </p>
                        </div>

                        <div className="card-modern">
                            <p className="text-xs uppercase tracking-wide text-[var(--color-text-tertiary)] mb-1">
                                Regime Insight
                            </p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                {Number(metrics.totalReturnPct) >= 0
                                    ? "Strategy performed well in this window."
                                    : "Strategy struggled, tweak parameters."}
                            </p>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-2">
                        <div className="card-subtle glow-hover">
                            <h3 className="text-lg font-semibold mb-3">Price & SMA</h3>
                            <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
                                Zoom & pan to inspect trends and crossovers.
                            </p>
                            <PriceChart closes={data.closes} sma={data.sma} />
                        </div>

                        <div className="card-subtle glow-hover">
                            <h3 className="text-lg font-semibold mb-3">Equity Curve</h3>
                            <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
                                Tracks portfolio value with interactive zoom.
                            </p>
                            <BacktestChart returns={data.returns} />
                        </div>
                    </section>

                    <section className="card-subtle mt-2">
                        <h3 className="text-base font-semibold mb-2">Backtest Summary</h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Starting from <span className="font-semibold">${initialCapital}</span>,
                            the <span className="font-semibold">{strategy.toUpperCase()}</span> strategy
                            on <span className="font-semibold">{symbol}</span> reached{" "}
                            <span className="font-semibold">
                                ${Number(metrics.finalValue).toLocaleString()}
                            </span>{" "}
                            with a return of{" "}
                            <span className="font-semibold">{metrics.totalReturnPct}%</span>
                            and max drawdown{" "}
                            <span className="font-semibold">{metrics.maxDDPct}%</span>.
                        </p>
                    </section>

                </main>

            </div>
        </div>
    );

}
