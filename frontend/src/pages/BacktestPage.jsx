import React, { useState, useMemo } from "react";
import BacktestChart from "../components/BacktestChart";
import PriceChart from "../components/PriceChart";
import StrategySelect from "../components/StrategySelect";
import BacktestControls from "../components/BacktestControls";
import { runBacktest } from "../utils/useBacktest";
import { Link } from "react-router-dom";

export default function BacktestPage() {
    const [data, setData] = useState(null);
    const [hasRun, setHasRun] = useState(false);

    const [strategy, setStrategy] = useState("sma");
    const [symbol, setSymbol] = useState("BTCUSDT");
    const [limit, setLimit] = useState(365);
    const [initialCapital, setInitialCapital] = useState(1000);
    const [loading, setLoading] = useState(false);

    const handleRunBacktest = async () => {
        setHasRun(true);
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

    const metrics = useMemo(() => {
        if (!data) return null;

        const finalValue = data.final_value ?? 0;
        const totalReturnPct =
            ((finalValue / initialCapital - 1) * 100).toFixed(2);
        const maxDDPct = (data.max_drawdown * 100).toFixed(2);
        const barsTested = data.closes?.length ?? 0;

        return {
            finalValue: finalValue.toFixed(2),
            totalReturnPct,
            maxDDPct,
            barsTested,
        };
    }, [data, initialCapital]);

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
                        Tip: Modify the lookback to compare regimes.
                    </p>
                </aside>

                <main className="flex-1 flex flex-col gap-6 lg:gap-8 px-3">

                    <header>
                        <h2 className="text-3xl md:text-5xl font-semibold text-[var(--color-text-primary)]">
                            Backtest Overview
                        </h2>
                        <p className="text-sm md:text-base text-[var(--color-text-secondary)] mt-2 text-balance">
                            Inspect performance, risk and behavior of{" "}
                            <span className="font-semibold">{strategy.toUpperCase()}</span> on{" "}
                            <span className="font-semibold">{symbol}</span>.
                        </p>
                    </header>

                    {!hasRun && (
                        <div className=" mt-6 p-10 text-center">
                            <h3 className="text-xl font-semibold mb-3 text-[var(--color-text-primary)]">
                                No Backtest Run Yet
                            </h3>
                            <p className="text-[var(--color-text-secondary)]">
                                Configure parameters {" "}
                                <span className="font-semibold">Run Backtest</span> to begin.
                            </p>
                        </div>
                    )}


                    {hasRun && data && metrics && (
                        <>

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
                                    <p className={`text-2xl md:text-3xl font-semibold ${metrics.totalReturnPct >= 0 ? "text-emerald-600" : "text-rose-600"
                                        }`}>
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
                                        {metrics.totalReturnPct >= 0
                                            ? "Strategy performed well."
                                            : "Strategy struggled in this window."}
                                    </p>
                                </div>
                            </section>


                            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-2">
                                <div className="card-subtle ">
                                    <h3 className="text-lg font-semibold mb-3">Price & Indicators</h3>
                                    <PriceChart closes={data.closes} indicators={data.indicators} />
                                </div>

                                <div className="card-subtle ">
                                    <h3 className="text-lg font-semibold mb-3">Equity Curve</h3>
                                    <BacktestChart returns={data.returns} />
                                </div>
                            </section>


                            <section className="card-subtle mt-2">
                                <h3 className="text-base font-semibold mb-2">Backtest Summary</h3>

                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Starting from <span className="font-semibold">${initialCapital}</span>,
                                    the <span className="font-semibold">{strategy.toUpperCase()}</span> strategy on{" "}
                                    <span className="font-semibold">{symbol}</span> reached{" "}
                                    <span className="font-semibold">${Number(metrics.finalValue).toLocaleString()}</span>
                                    {" "}with total return{" "}
                                    <span className="font-semibold">{metrics.totalReturnPct}%</span>
                                    {" "}and max drawdown{" "}
                                    <span className="font-semibold">{metrics.maxDDPct}%</span>.
                                </p>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
