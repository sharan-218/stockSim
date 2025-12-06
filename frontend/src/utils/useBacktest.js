export async function runBacktest({strategy = "sma",symbol = "BTCUSDT",limit = 365,initialCapital = 1000}) {
  const data = await fetch(`${import.meta.env.VITE_SERVER_BACKTEST_DATA}/${symbol}?interval=1d&limit=${limit}`)
    .then(r => r.json());

  const closes = data.map(c => ({ close: c.close }));

  const result = await fetch(`${import.meta.env.VITE_SERVER_BACKTEST}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      strategy,
      historical: closes,
      initial_capital: initialCapital
    })
  }).then(r => r.json());

  return {
    closes: result.closes,
    sma: result.sma,         
    returns: result.returns, 
    final_value: result.final_value,
    max_drawdown: result.max_drawdown
  };
}
