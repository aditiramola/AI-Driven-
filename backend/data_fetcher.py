import yfinance as yf

def fetch_data(symbol, period="1y", interval="1d"):
    data = yf.download(symbol, period=period, interval=interval, progress=False)
    data.dropna(inplace=True)
    return data
