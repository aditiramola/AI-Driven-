# backend/app.py - UPDATED
from flask import Flask
from flask_socketio import SocketIO
import time
import threading
import random
from analyzer import analyze_asset

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# Add META to prices list
prices = {
    "AAPL": 190,
    "MSFT": 410,
    "BTC-USD": 43000,
    "ETH-USD": 2300,
    "META": 412.29,  
    "ETC": 2325.62   
}

signal_cache = {}

def generate_realistic_signal(symbol, current_price):
    """Generate more realistic trade signals"""
    # Market trends (simplified for demo) - Updated for all symbols
    trends = {
        "AAPL": {"base_volatility": 0.5, "trend": 0.1},
        "MSFT": {"base_volatility": 0.4, "trend": 0.08},
        "BTC-USD": {"base_volatility": 2.0, "trend": 0.5},
        "ETH-USD": {"base_volatility": 1.8, "trend": 0.4},
        "META": {"base_volatility": 0.6, "trend": 0.12},  
        "ETC": {"base_volatility": 1.5, "trend": 0.3}     
    }
    
    trend = trends.get(symbol, {"base_volatility": 1, "trend": 0})
    
    # Simulate price movement with trend
    price_change = random.uniform(-trend["base_volatility"], trend["base_volatility"]) + trend["trend"]
    prices[symbol] = max(0.01, prices[symbol] * (1 + price_change / 100))
    
    # Generate realistic signal based on trend and volatility
    if trend["trend"] > 0.2 and random.random() > 0.3:
        signal = "BUY"
        risk = "LOW" if trend["base_volatility"] < 1 else "MEDIUM"
    elif trend["trend"] < -0.2 and random.random() > 0.3:
        signal = "SELL"
        risk = "LOW" if trend["base_volatility"] < 1 else "MEDIUM"
    else:
        signal = random.choice(["BUY", "SELL", "HOLD"])
        risk = random.choice(["LOW", "MEDIUM", "HIGH"])
    
    confidence = random.randint(40, 90)
    
    return {
        "signal": signal,
        "confidence": confidence,
        "risk_level": risk,
        "current_price": round(prices[symbol], 2),
        "indicators": {
            "rsi": round(random.uniform(30, 70), 1),
            "volume_ratio": round(random.uniform(0.8, 1.5), 2),
            "sma_20": round(prices[symbol] * random.uniform(0.95, 1.05), 2),
            "sma_50": round(prices[symbol] * random.uniform(0.92, 1.08), 2)
        },
        "levels": {
            "stop_loss": round(prices[symbol] * 0.95, 2) if signal != "HOLD" else None,
            "take_profit": round(prices[symbol] * 1.1, 2) if signal != "HOLD" else None
        }
    }

def stream_market(symbols):
    """Stream market data with trade signals"""
    while True:
        results = []
        for symbol in symbols:
            # Update price
            signal_data = generate_realistic_signal(symbol, prices[symbol])
            
            # Cache signal
            signal_cache[symbol] = signal_data
            
            results.append({
                "symbol": symbol,
                "current_price": signal_data["current_price"],
                "predicted_price": round(prices[symbol] * random.uniform(0.98, 1.03), 2),
                "trend": "Bullish" if signal_data["signal"] == "BUY" else "Bearish",
                "risk_level": signal_data["risk_level"],
                "trade_signal": signal_data
            })
        
        socketio.emit("market_update", results)
        time.sleep(3)  # Update every 3 seconds

@socketio.on("start_stream")
def handle_start_stream(data):
    symbols = data["symbols"]
    thread = threading.Thread(target=stream_market, args=(symbols,), daemon=True)
    thread.start()

@socketio.on("get_signals")
def handle_get_signals(data):
    """Return cached signals for requested symbols"""
    symbols = data["symbols"]
    signals = {}
    for symbol in symbols:
        if symbol in signal_cache:
            signals[symbol] = signal_cache[symbol]
    socketio.emit("signals_update", signals)

if __name__ == "__main__":
    print(" Starting WebSocket server with 6 assets:")
    print("📈 Symbols: AAPL, MSFT, BTC-USD, ETH-USD, META, ETC")
    socketio.run(app, port=5000, debug=True)