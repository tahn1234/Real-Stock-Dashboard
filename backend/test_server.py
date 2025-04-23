from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/prices")
def prices():
    return jsonify({"AAPL": 123.45, "TSLA": 678.90})

if __name__ == "__main__":
    app.run(port=5000)
    
