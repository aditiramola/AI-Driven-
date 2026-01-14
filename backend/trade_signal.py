# trade_signal.py
import numpy as np
from data_fetcher import fetch_data
from predictor import predict_price
from risk import calculate_risk
from datetime import datetime, timedelta

class TradeSignalGenerator:
    def __init__(self):
        self.signal_history = {}
    
    def generate_signal(self, symbol, data):
        """Generate trade signal with risk assessment"""
        try:
            # Get current data
            current_price = data["Close"].iloc[-1]
            
            # Technical indicators
            sma_20 = data["Close"].rolling(window=20).mean().iloc[-1]
            sma_50 = data["Close"].rolling(window=50).mean().iloc[-1]
            
            # RSI calculation
            delta = data["Close"].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs.iloc[-1]))
            
            # Volume analysis
            volume_avg = data["Volume"].rolling(window=20).mean().iloc[-1]
            volume_current = data["Volume"].iloc[-1]
            volume_ratio = volume_current / volume_avg if volume_avg > 0 else 1
            
            # MACD
            exp1 = data["Close"].ewm(span=12, adjust=False).mean()
            exp2 = data["Close"].ewm(span=26, adjust=False).mean()
            macd = exp1 - exp2
            signal_line = macd.ewm(span=9, adjust=False).mean()
            
            # Bollinger Bands
            bb_upper = data["Close"].rolling(window=20).mean() + (data["Close"].rolling(window=20).std() * 2)
            bb_lower = data["Close"].rolling(window=20).mean() - (data["Close"].rolling(window=20).std() * 2)
            
            # Signal logic
            signal = "HOLD"
            confidence = 0
            risk_level = "MEDIUM"
            
            # Price vs SMAs
            if current_price > sma_20 and sma_20 > sma_50:
                signal = "BUY"
                confidence += 25
            elif current_price < sma_20 and sma_20 < sma_50:
                signal = "SELL"
                confidence += 25
            
            # RSI signals
            if rsi < 30:
                signal = "BUY"
                confidence += 20
                risk_level = "LOW"
            elif rsi > 70:
                signal = "SELL"
                confidence += 20
                risk_level = "LOW"
            elif 30 <= rsi <= 70:
                confidence -= 10
            
            # Volume confirmation
            if volume_ratio > 1.5 and signal != "HOLD":
                confidence += 15
                risk_level = "LOW"
            elif volume_ratio < 0.7:
                confidence -= 10
                risk_level = "HIGH"
            
            # MACD signal
            macd_current = macd.iloc[-1]
            signal_current = signal_line.iloc[-1]
            if macd_current > signal_current and signal == "BUY":
                confidence += 15
            elif macd_current < signal_current and signal == "SELL":
                confidence += 15
            else:
                confidence -= 10
            
            # Bollinger Bands
            bb_position = (current_price - bb_lower.iloc[-1]) / (bb_upper.iloc[-1] - bb_lower.iloc[-1])
            if bb_position < 0.2:
                signal = "BUY"
                confidence += 15
                risk_level = "LOW"
            elif bb_position > 0.8:
                signal = "SELL"
                confidence += 15
                risk_level = "LOW"
            
            # Final confidence adjustment
            confidence = max(0, min(100, confidence))
            
            # Calculate stop loss and take profit levels
            if signal == "BUY":
                stop_loss = current_price * 0.95  # 5% stop loss
                take_profit = current_price * 1.10  # 10% take profit
            elif signal == "SELL":
                stop_loss = current_price * 1.05  # 5% stop loss
                take_profit = current_price * 0.90  # 10% take profit
            else:
                stop_loss = None
                take_profit = None
            
            return {
                "signal": signal,
                "confidence": round(confidence),
                "risk_level": risk_level,
                "current_price": round(current_price, 2),
                "indicators": {
                    "rsi": round(rsi, 2),
                    "volume_ratio": round(volume_ratio, 2),
                    "sma_20": round(sma_20, 2),
                    "sma_50": round(sma_50, 2),
                    "macd": round(macd_current, 4),
                    "bb_position": round(bb_position, 2)
                },
                "levels": {
                    "stop_loss": round(stop_loss, 2) if stop_loss else None,
                    "take_profit": round(take_profit, 2) if take_profit else None
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error generating signal for {symbol}: {str(e)}")
            return {
                "signal": "HOLD",
                "confidence": 0,
                "risk_level": "HIGH",
                "current_price": 0,
                "indicators": {},
                "levels": {},
                "timestamp": datetime.now().isoformat()
            }