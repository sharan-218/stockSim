// SymbolInput.jsx (Revised for better integration)

import { useState } from "react";
import Button from "./Button";

export default function SymbolInput({ onSubmit }) {
  const [symbol, setSymbol] = useState("BTCUSDT");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation to prevent empty submission
    if (symbol.trim()) {
      onSubmit(symbol.trim());
    }
  };

  return (
    // CHANGE: Removed 'max-w-xl mx-auto p-4 rounded-xl'
    // Applying 'flex gap-4 w-full items-end' to align the input and button correctly
    <form onSubmit={handleSubmit} className="flex gap-4 w-full items-end">
      
      {/* Input Field */}
      <div className="flex-grow">
          {/* Note: We are keeping the label outside in Home.jsx, 
             so this input should just be the field itself. 
             If you want a label here, you'd need to adjust Home.jsx 
             and ModelSelect.jsx to match.
          */}
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter symbol, e.g., BTCUSDT"
            className="input-modern w-full"
            aria-label="Stock or Crypto Symbol"
          />
      </div>
      
      {/* Button Field (now inside the form for submission) */}
      <Button 
        type="submit" 
        className="btn-modern flex-shrink-0" 
      >
        Fetch
      </Button>
    </form>
  );
}