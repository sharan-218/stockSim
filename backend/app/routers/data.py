from fastapi import APIRouter, Query, HTTPException
import httpx
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv() 

BINANCE_BASE_URL = os.getenv("BINANCE_BASE_URL", "https://api.binance.com/api/v3/klines")
router = APIRouter(prefix="/data", tags=["Data"])

@router.get("/{symbol}")
async def get_symbol_data(
    symbol: str,
    interval: str = Query("1d", description="Candle interval: 1m, 5m, 1h, 1d, etc."),
    limit: int = Query(100, description="Number of candles to fetch")
):
    """
    Fetch OHLC (Open, High, Low, Close) data for a crypto symbol from Binance.
    """
    params = {
        "symbol": symbol,
        "interval": interval,
        "limit": limit
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(BINANCE_BASE_URL, params=params)
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    data = resp.json()

    if not data:
        raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
    df = pd.DataFrame(data, columns=[
        "open_time", "open", "high", "low", "close", "volume",
        "close_time", "quote_asset_volume", "num_trades",
        "taker_buy_base_asset_volume", "taker_buy_quote_asset_volume", "ignore"
    ])

    df[["open","high","low","close","volume"]] = df[["open","high","low","close","volume"]].astype(float)

    df["open_time"] = pd.to_datetime(df["open_time"], unit="ms")
    df["close_time"] = pd.to_datetime(df["close_time"], unit="ms")

    return df[["open_time","open","high","low","close","volume"]].to_dict(orient="records")
