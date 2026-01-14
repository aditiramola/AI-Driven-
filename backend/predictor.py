import pickle
import numpy as np
import os
from data_fetcher import fetch_data

# Use absolute path based on this file's location
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

def predict_price(symbol):
    data = fetch_data(symbol)
    closes = data["Close"].values

    if len(closes) < 10:
        raise ValueError("Not enough data for prediction")

    X = closes[-10:].reshape(1, -1)
    prediction = model.predict(X)
    predicted_price = float(np.asarray(prediction).flatten()[0])
    current_price = float(closes[-1])

    return {
        "current_price": round(current_price, 2),
        "predicted_price": round(predicted_price, 2),
        "trend": "Bullish" if predicted_price > current_price else "Bearish"
    }
