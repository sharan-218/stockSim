import BacktestPage from "./pages/BacktestPage";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/backtest" element={<BacktestPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;

