# Real Time Stock Dashboard

A full-stack application providing live stock price monitoring, interactive charting, and historical data export. Built with a **Flask** backend that fetches data from Yahoo Finance and a **React** frontend using Recharts and Plotly.


## Features

- **Live Price Updates**: Fetches real-time quotes from `yfinance` via a Python/Flask backend.
- **High/Low Stats**: Tracks and displays session highs and lows
- **Custom Chart Viewer / Interactive Charts**:
    - **Candlestick**, **Line**, or **Area** chart types  
    - Overlaid **RSI (Relative Strength Index 14-period)**  indicator  
    - **Dark / Light** theme toggle
    - Adjustable time period and interval (including auto intervals)
- **Historical Data Table**:
  - Columns: Time | Close | Volume | Open | High | Low  
- **Export CSV**: Download historical data in CSV format.


## Technical Stack

- **Frontend:** React, CSS, recharts (for UI, charts, live updates)
- **Backend:** Python + Flask (multithreaded price fetching)
- **API:** yfinance (real stock data)
- **Deployment:** Vercel + Render (Host frontend & backend)


## Prerequisites

- Python 3.8+ and `pip`
- Node.js 14+ and `npm` 


## Installation

### Backend Setup
1. Clone the repo and switch to the `backend` folder:
```bash
git clone https//github.com/tahn1234/real-stock-dashboard.git
cd real-stock-dashboard/backend
```
2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate    # Windows
```
3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Frontend Setup
1. In a separate terminal, navigate to the `frontend` folder:
```bash
cd ../frontend
```
2. Install npm packages:
```bash
npm install
```

### Running the App
1. Start the backend (from `backend/`):
```bash
source venv/bin/activate
python server.py
```
2. Start the frontend (from `frontend/`):
```bash
npm start
```



## Usage
- **Dashboard**: Displays live cards for each ticker with current price, high, low, and percent change
- **Chart Viewer**: 
    1. Select Ticker, Time Period, Interval, and Chart Type
    2. Toggle Dark/Light mode with the top-right button
    View combined price + RSI overlay when in Candlestick mode
- **Historical Data**: Scroll through the table below the chart. Click Export CSV to download.


## Project Structure
```bash
real_stock_dashboard/
├── backend/              # Flask API
│   ├── server.py
│   └── thread.py         # price-fetching thread logic
│   └── requirements.txt
├── frontend/             # React app
│   ├── src/
│   │   ├── index.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── components/
│   ├── public/
└── README.md
```


## Configuration

- **Tickers**: Modify the `TICKERS` list in `backend/server.py`.
- **Fetch interval**: Adjust the default polling interval in `thread.fetch_real_price`.
- **CORS**: Configured to allow requests from `localhost:3000`.


## Contributing

I would love any help! Whether you find a bug, want to propose a new feature, or improve the documentation, any contributions are welcome:
1. Fork the repo.
2. Create your feature branch 
3. Commit your changes
4. Push your branch
4. Crete a pull request


## License

Distributed under MIT License. See `LICENSE` for more information.

