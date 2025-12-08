import React from "react";

export default function StrategySelect({ strategy, setStrategy }) {
    const strategies = [
        { id: "sma", name: "SMA" },
        { id: "macd", name: "MACD" },
        // { id: "bollinger", name: "Bollinger Bands" },
        // { id: "dual_sma", name: "SMA Crossover" },
    ];

    return (
        <div className="form-control-modern w-full">
            <label className="label-modern">
                Select Strategy
            </label>

            <select
                className="select-modern w-full"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
            >
                {strategies.map((s) => (
                    <option key={s.id} value={s.id} className="w-full">
                        {s.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
