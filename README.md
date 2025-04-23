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
tree -I real_stock_dashboard/
├── backend/              # Flask API
│   ├── server.py
│   └── thread.py        # price-fetching thread logic
│   └── requirements.txt
├── frontend/             # React app
│   ├── src/
│   │   ├── index.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── components/
│   ├── public/
└── README.md


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




## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
