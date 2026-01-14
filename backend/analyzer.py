# analyzer.py - Updated
from data_fetcher import fetch_data
from predictor import predict_price
from risk import calculate_risk
from trade_signal import TradeSignalGenerator

signal_generator = TradeSignalGenerator()

def analyze_asset(symbol):
    data = fetch_data(symbol, period="1mo", interval="1h")
    
    prediction = predict_price(symbol)
    risk = calculate_risk(data)
    signal = signal_generator.generate_signal(symbol, data)
    
    return {
        "symbol": symbol,
        "price_data": {
            "current": prediction["current_price"],
            "predicted": prediction["predicted_price"],
            "trend": prediction["trend"]
        },
        "risk_metrics": risk,
        "trade_signal": signal,
        "timestamp": signal["timestamp"]
    }