import React from "react";

export default function BacktestControls({
    symbol,
    setSymbol,
    limit,
    setLimit,
    initialCapital,
    setInitialCapital,
}) {
    return (
        <div className="w-full flex flex-col gap-4">
            <div className="form-control-modern w-full">
                <label className="label-modern">Crypto Symbol</label>
                <input
                    type="text"
                    className="input-modern w-full"
                    placeholder="BTCUSDT"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                />
            </div>
            <div className="form-control-modern w-full">
                <label className="label-modern">Data Limit</label>

                <select
                    className="select-modern w-full"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                >
                    <option value={90}>3 Months (90)</option>
                    <option value={180}>6 Months (180)</option>
                    <option value={365}>1 Year (365)</option>
                    <option value={730}>2 Years (730)</option>
                    <option value={1095}>3 Years (1095)</option>
                    <option value={1460}>4 Years (1460)</option>
                </select>
            </div>
            <div className="form-control-modern w-full">
                <label className="label-modern">Initial Portfolio Value ($)</label>
                <input
                    type="number"
                    className="input-modern w-full"
                    min="1"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                />
            </div>

        </div>
    );
}
