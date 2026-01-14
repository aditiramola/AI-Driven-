import numpy as np

def calculate_risk(data):
    returns = data["Close"].pct_change().dropna()

    volatility = returns.std() * np.sqrt(252)

    cumulative = (1 + returns).cumprod()
    peak = cumulative.cummax()
    drawdown = (cumulative - peak) / peak
    max_drawdown = drawdown.min()

    score = min((volatility * 100 + abs(max_drawdown) * 100) / 2, 100)

    if score < 30:
        level = "Low"
    elif score < 60:
        level = "Medium"
    else:
        level = "High"

    return {
        "risk_score": round(score, 1),
        "risk_level": level
    }
