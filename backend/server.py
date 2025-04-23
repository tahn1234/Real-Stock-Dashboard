import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from threading import Thread, Lock
from thread import fetch_real_price
import yfinance as yf
import pandas as pd

app = Flask(__name__)
CORS(app, supports_credentials=True)

TICKERS = ["AAPL", "TSLA", "AMZN"]
price_data = {ticker: 100.0 for ticker in TICKERS}
stats_data = {ticker: {"high": 100.0, "low": 100.0} for ticker in TICKERS}
lock = Lock()

if not os.path.exists("logs"):
    os.makedirs("logs")

for ticker in TICKERS:
    thread = Thread(
        target=fetch_real_price,
        args=(ticker, price_data, lock, stats_data, 60),
        daemon=True,
    )
    thread.start()

@app.route("/")
def home():
    return "Flask is running!"

@app.route("/api/prices")
def get_prices():
    with lock:
        return jsonify(price_data)

@app.route("/api/stats")
def get_stats():
    with lock:
        return jsonify(stats_data)

@app.route("/api/history")
def get_history():
    ticker = request.args.get("ticker", "AAPL")
    period = request.args.get("period", "1d")
    interval = request.args.get("interval", "1m")
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period, interval=interval)

        if hist.empty or "Close" not in hist.columns:
            print(f"[WARN] No data for {ticker} with {period}/{interval}")
            return jsonify([])

        hist = hist.reset_index()
        hist["time"] = hist["Datetime"].dt.strftime("%Y-%m-%d %H:%M")

        data = []
        for _, row in hist.iterrows():
            if pd.isna(row["Close"]):
                continue  # Skip invalid rows
            data.append({
                "time": row["time"],
                "price": float(row["Close"]),
                "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else None,
                "open": float(row["Open"]) if not pd.isna(row["Open"]) else None,
                "high": float(row["High"]) if not pd.isna(row["High"]) else None,
                "low": float(row["Low"]) if not pd.isna(row["Low"]) else None,
                "close": float(row["Close"]),
            })
        return jsonify(data)

    except Exception as e:
        print(f"[ERROR] /api/history failed: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)