import { useState } from "react";
import Button from "./Button";

export default function SymbolInput({ onSubmit }) {
  const [symbol, setSymbol] = useState("BTCUSDT");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSubmit(symbol.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 w-full items-end">
      <div className="flex-grow">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter symbol, e.g., BTCUSDT"
            className="input-modern w-full"
            aria-label="Stock or Crypto Symbol"
          />
      </div>
      <Button 
        type="submit" 
        className="btn-modern flex-shrink-0" 
      >
        Fetch
      </Button>
    </form>
  );
}