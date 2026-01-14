import pickle
import numpy as np
from data_fetcher import fetch_data

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

def predict_price(symbol):
    data = fetch_data(symbol)
    closes = data["Close"].values

    if len(closes) < 10:
        raise ValueError("Not enough data")

    X = closes[-10:].reshape(1, -1)

    prediction = model.predict(X)
    prediction = np.asarray(prediction)

    predicted_price = float(prediction.flatten()[0])
    current_price = float(closes[-1])

    return {
        "current_price": round(current_price, 2),
        "predicted_price": round(predicted_price, 2),
        "trend": "Bullish" if predicted_price > current_price else "Bearish"
    }
