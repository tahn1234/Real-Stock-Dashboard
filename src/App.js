import { useEffect, useState } from "react";
import "./App.css";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend} from "recharts";
import { ComposedChart, Area, Bar, AreaChart } from "recharts";
import Plot from "react-plotly.js";


const downloadCSV = (data, filename = "history.csv") => {
  const headers = ["Time", "Price", "Volume"];
  const rows = data.map((row) => [
    row.time ?? "--",
    row.price != null ? row.price.toFixed(2) : "--", 
    row.volume != null ? row.volume : "--",
  ]);

  const csvContent = [headers, ...rows]
    .map((e) => e.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


function calculateRSI(data, period = 14) {
  const rsi = [];
  let gains = 0, losses = 0;

  for (let i = 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;

    if (i < period) {
      if (diff > 0) gains += diff;
      else losses -= diff;
      rsi.push(null); 
    } else if (i === period) {
      if (diff > 0) gains += diff;
      else losses -= diff;
      const avgGain = gains / period;
      const avgLoss = losses / period || 1;
      const rs = avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    } else {
      const prevRSI = rsi[rsi.length - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      gains = (gains * (period - 1) + gain) / period;
      losses = (losses * (period - 1) + loss) / period;
      const rs = gains / (losses || 1);
      rsi.push(100 - 100 / (1 + rs));
    }
  }

  return rsi;
}



function App() {
  const [prices, setPrices] = useState({});
  const [stats, setStats] = useState({});
  const [history, setHistory] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [chartType, setChartType] = useState("candlestick");
  const [period, setPeriod] = useState("1d");
  const [interval, setIntervalVal] = useState("auto");
  const [customHistory, setCustomHistory] = useState([]);

  const periodLabelMap = {
    "1d": "1 Day",
    "5d": "5 Days",
    "1mo": "1 Month",
    "3mo": "3 Months",
  };
  
  const intervalLabelMap = {
    "1m": "1 Min",
    "5m": "5 Min",
    "30m": "30 Min",
    "1h": "1 Hour",
  };

  const autoInterval = {
    "1d": "1m",
    "5d": "5m",
    "1mo": "30m",
    "3mo": "1h"      
  };

  const effectiveInterval = interval === "auto" ? autoInterval[period] || "1m" : interval;
  const periodLabel = periodLabelMap[period] || period;
  const intervalLabel = intervalLabelMap[interval] || interval;
  
  
  function formatVolume(number) {
    if (number >= 1_000_000) {
      return (number / 1_000_000).toFixed(1) + "M";
    } else if (number >= 1_000) {
      return (number / 1_000).toFixed(1) + "K";
    }
    return number.toString();
  }


  const latestData = customHistory.length ? customHistory[customHistory.length - 1] : null;
  const minPrice = customHistory.length ? Math.min(...customHistory.map(d => d.price)) : null;
  const maxPrice = customHistory.length ? Math.max(...customHistory.map(d => d.price)) : null;
  const totalVolume = customHistory.length ? customHistory.reduce((acc, d) => acc + d.volume, 0) : null;
  const parseDate = (raw) => new Date(raw.replace(" ", "T"));
  const getTickFormat = () => {
    if (period === "1d") return "%H:%M"; 
    else return "%Y-%m-%d %H:%M";
  };

  let priceNote = "";
  if (latestData && maxPrice && minPrice) {
    const pctToHigh = Math.abs((maxPrice - latestData.price) / maxPrice);
    const pctToLow = Math.abs((latestData.price - minPrice) / minPrice);

    if (pctToHigh < 0.005) priceNote = "🔺 Near Daily High";
    else if (pctToLow < 0.005) priceNote = "🔻 Near Daily Low";
  }
  let priceChange = null;
  let pricePercent = null;
  
  if (customHistory.length >= 2) {
    const prev = customHistory[customHistory.length - 2].price;
    const curr = customHistory[customHistory.length - 1].price;
  
    priceChange = curr - prev;
    pricePercent = (priceChange / prev) * 100;
  }

  function formatVolume(number) {
    if (number >= 1_000_000) return (number / 1_000_000).toFixed(1) + "M";
    if (number >= 1_000) return (number / 1_000).toFixed(1) + "K";
    return number.toString();
  }
  
  useEffect(() => {
    setIsDarkMode(true); 
  }, []);

  


  


  

  // Fetch prices from Flask API every 60 seconds
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [priceRes, statsRes] = await Promise.all([
          fetch("${process.env.REACT_APP_API_BASE}/api/prices"),
          fetch("${process.env.REACT_APP_API_BASE}/api/stats"),
        ]);
        const priceData = await priceRes.json();
        const statsData = await statsRes.json();
  
        // Update chart history
        setHistory((prevHistory) => {
          const updatedHistory = { ...prevHistory };
  
          Object.keys(priceData).forEach((ticker) => {
            if (!updatedHistory[ticker]) updatedHistory[ticker] = [];
            updatedHistory[ticker].push({
              time: new Date().toLocaleTimeString(),
              price: priceData[ticker],
            });
  
            if (updatedHistory[ticker].length > 20) {
              updatedHistory[ticker].shift();
            }
          });
  
          return updatedHistory;
        });
  
        setPrices(priceData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch prices:", err);
      }
    };
  
    fetchPrices(); // load once
    const interval = setInterval(fetchPrices, 60000); // refresh every 60s
  
    return () => clearInterval(interval); // cleanup on unmount
  }, []);


  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const effectiveInterval = interval === "auto" ? autoInterval[period] || "1m" : interval;
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE}/api/history?ticker=${selectedTicker}&period=${period}&interval=${effectiveInterval}`
        );
        const data = await res.json();
        const rsi = calculateRSI(data);
        const rsiHistory = data.map((d, i) => ({ ...d, rsi: rsi[i] ?? null }));
        setCustomHistory(rsiHistory);
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
      }
    };
  
    fetchChartData();
  }, [selectedTicker, period, interval]);
  
  
  
  

  const tickers = Object.keys(prices);
  
  return ( 
    <div
      className="dashboard"
      style={{ backgroundColor: isDarkMode ? "#111827" : "#ffffff", color: isDarkMode ? "#f9fafb" : "#111827",minHeight: "100vh",
        padding: "2rem", transition: "background-color 0.3s ease, color 0.3s ease" }} >
      <h1 className="title" style={{fontSize: "2rem", marginBottom: "0.5rem", color: isDarkMode ? "#ffffff" : "#111827"}} >
        Real-Time Stock Market Dashboard
      </h1>
      <p className="subtitle" style={{ marginBottom: "2rem", fontStyle: "italic" }}>
        
      </p>
      {customHistory.length > 0 && (
        <div
        style={{
          marginBottom: "1.5rem",
          backgroundColor: isDarkMode ? "#0b1120" : "#e5e7eb",
          padding: "1rem",
          borderRadius: "0.75rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "1rem",
          fontSize: "0.95rem",
        }}>
          <div>
            <strong>Last Price:</strong> ${latestData?.price != null ? latestData.price.toFixed(2) : "--"}
            <span style={{ fontWeight: "bold", color: priceNote.includes("🔺") ? "#16a34a" : priceNote.includes("🔻") ? "#dc2626" : "#6b7280" }}>
              {priceNote}
            </span>
          </div>
          <div>
            <strong> High:</strong> ${maxPrice != null ? maxPrice.toFixed(2) : "--"}
          </div>
          <div>
            <strong>Low:</strong> ${minPrice != null ? minPrice.toFixed(2) : "--"}
          </div>
          <div>
            <strong>Volume:</strong> {formatVolume(totalVolume)} 
          </div>
        </div>
      )}
      
      <button onClick={() => setIsDarkMode((prev) => !prev)}
      style={{
        position: "absolute", 
        top: 16, 
        right: 16, 
        padding: "8px 12px", 
        borderRadius: 8, 
        border: "none",
        backgroundColor: isDarkMode ? "#f3f4f6" : "#111827", 
        color: isDarkMode ? "#111827" : "#f3f4f6", 
        cursor: "pointer", 
        fontWeight: "bold"}}>
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
        
        <div style={{marginBottom: "1rem", textAlign: "left" }}>
          <div style={{ fontSize: "1rem", fontWeight: 600, color: isDarkMode ? "#e2e8f0" : "#1f2937" }}>
            {selectedTicker}
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>
            {latestData ? latestData.price.toFixed(2) : "--"} USD
          </div>
          
          {priceChange !== null && (
            <div
            style={{
              fontSize: "1rem",
              fontWeight: 500,
              color: priceChange < 0 ? "#dc2626" : "#16a34a",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}>
              {priceChange < 0 ? "🔻" : "🔺"} {priceChange != null ? priceChange.toFixed(2) : "--"}
              ({pricePercent != null ? pricePercent.toFixed(2) : "--"})
            </div>
          )}
        </div>
        
        <p
        style={{
          marginTop: "1rem",
          marginBottom: "0",
          fontSize: "1rem",
          fontWeight: "600",
          color: isDarkMode ? "#f9fafb" : "#1f2937"
          }}>
            {selectedTicker} · {period === "1d" ? "1 Day" : period === "5d" ? "5 Days" : period === "1mo" ? "1 Month" : "3 Months"} ·{" "}
            {interval === "1m" ? "1 Min" : interval === "5m" ? "5 Min" : interval === "30m" ? "30 Min" : "1 Hour"}
        </p>
        
        <p
        style={{
          marginTop: "0.25rem",
          marginBottom: "1rem",
          fontSize: "0.85rem",
          color: isDarkMode ? "#9ca3af" : "#4b5563"
        }}>
          {customHistory.length > 0 ? `${parseDate(customHistory[0].time).toLocaleDateString()} — ${parseDate(customHistory[customHistory.length - 1].time).toLocaleDateString()}` : "--"}
        </p>
        
        
        {/* Chart Control Panel */}
        <div style={{
          maxWidth: "1000px",
          width: "100%",
          margin: "0 auto",
          backgroundColor: isDarkMode ? "#1e293b" : "#e0f2fe",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: isDarkMode
            ? "0 0 30px rgba(255, 255, 255, 0.05)"
            : "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}>
            <h2 style={{
              marginBottom: "1rem",
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}>
              {selectedTicker} Chart Viewer
            </h2>
            
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <div className="dropdown-group">
                <label style={{color: isDarkMode ? "#ffffff" : "#111827", fontWeight: "500", marginBottom: "0.25rem", display: "block",}}>
                  Ticker
                </label>
                <select className="dropdown-select" value={selectedTicker} onChange={(e) => setSelectedTicker(e.target.value)}>
                  <option value="AAPL">AAPL</option>
                  <option value="TSLA">TSLA</option>
                  <option value="AMZN">AMZN</option>
                  <option value="GOOG">GOOG</option>
                </select>
              </div>
              
              <div className="dropdown-group">
                <label style={{color: isDarkMode ? "#ffffff" : "#111827", fontWeight: "500", marginBottom: "0.25rem", display: "block",}}>
                  Time Period
                </label>
                <select className="dropdown-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option value="1d">1 Day</option>
                  <option value="5d">5 Days</option>
                  <option value="1mo">1 Month</option>
                  <option value="3mo">3 Months</option>
                </select>
              </div>
              
              <div className="dropdown-group">
                <label style={{
                  color: isDarkMode ? "#ffffff" : "#111827",
                  fontWeight: "500",
                  marginBottom: "0.25rem",
                  display: "block", }}>
                    Interval
                </label>
                <select className="dropdown-select" value={interval} onChange={(e) => setIntervalVal(e.target.value)}>
                  <option value="auto">Auto</option>
                  <option value="1m">1 min</option>
                  <option value="5m">5 min</option>
                  <option value="30m">30 min</option>
                  <option value="1h">1 hour</option>
                </select>
              </div>
              
              <div className="dropdown-group">
                <label style={{
                  color: isDarkMode ? "#ffffff" : "#111827",
                  fontWeight: "500",
                  marginBottom: "0.25rem",
                  display: "block",}}>
                    Chart Type
                </label>
                <select className="dropdown-select" value={chartType} onChange={(e) => setChartType(e.target.value)}>
                  <option value="candlestick">Candlestick</option>
                  <option value="line">Line</option>
                  <option value="area">Area</option>
                </select>
              </div>
            </div>
            
            
            
            <ResponsiveContainer width="100%" height={500}>
              {chartType === "candlestick" ? (
                <Plot
                data={[
                  {
                    type: "candlestick",
                    x: customHistory.map((d) => d.time),
                    open: customHistory.map((d) => d.open),
                    high: customHistory.map((d) => d.high),
                    low: customHistory.map((d) => d.low),
                    close: customHistory.map((d) => d.close),
                    name: "Price",
                    yaxis: "y",
                    increasing: { line: { color: "#4ade80" } },
                    decreasing: { line: { color: "#f87171" } },
                  },
                  {
                    type: "scatter",
                    mode: "lines",
                    x: customHistory.map((d) => d.time),
                    y: customHistory.map((d) => d.rsi),
                    name: "RSI 14",
                    yaxis: "y2",
                    line: { color: "#3b82f6", width: 1},
                  },
                ]}
                layout={{
                  title: `${selectedTicker} ${period} · ${interval}`,
                  height: 450,
                  margin: { t: 40, r: 80, b: 40, l: 60 },
                  plot_bgcolor: isDarkMode ? "#111827" : "#ffffff",
                  paper_bgcolor: isDarkMode ? "#111827" : "#ffffff",
                  font: { color: isDarkMode ? "#f9fafb" : "#111827" },
                  margin: { t: 60, r: 80, b: 40, l: 60 },
              
                  xaxis: {
                    title: "Time",
                    rangeslider: { visible: true },
                    type: "date",
                  },
                  yaxis: {
                    title: "Price (USD)",
                    side: "left",
                  },
                  yaxis2: {
                    title: "RSI",
                    overlaying: "y",
                    side: "right",
                    range: [0, 100],
                  },
                  legend: { x: 1.05, y: 1, orientation: "v" },
                }}
                config={{ responsive: true }}
                useResizeHandler
                style={{ width: "100%", height: "100%" }}
              />
              
              

              
              ) : chartType === "area" ? (
              <AreaChart data={customHistory}>
                <XAxis dataKey="time" tick={{ angle: -45, fontSize: 10 }} interval={Math.floor(customHistory.length / 20)} tickFormatter={(tick) => (period === "1d" ? tick.split(" ")[1] : tick.split(" ")[0])}/>
                <YAxis yAxisId="left" domain={["dataMin", "dataMax"]} tickFormatter={(value) => `$${value.toFixed(2)}`}/>
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }}/>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle"/>
                <Area type="monotone" dataKey="close" stroke="#3b82f6" fill="#dbeafe" yAxisId="left" />
                <Line type="monotone" dataKey="rsi" stroke="#10b981" strokeDasharray="5 5" yAxisId="right" />
                </AreaChart>
              ) : (
              <LineChart data={customHistory}>
                <XAxis dataKey="time" tick={{ angle: -45, fontSize: 10 }} interval={Math.floor(customHistory.length / 20)}
                tickFormatter={(tick) => (period === "1d" ? tick.split(" ")[1] : tick.split(" ")[0])}/>
                <YAxis yAxisId="left" domain={["dataMin", "dataMax"]} tickFormatter={(value) => `$${value.toFixed(2)}`}/>
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10 }}/>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle"/>
                <Line type="monotone" dataKey="close" name="Price" dot={false} stroke="#3b82f6" strokeWidth={2} yAxisId="left" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        

        <h3 style={{ marginTop: "5rem" }}>Historical Price Data</h3>
        <div style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
          color: isDarkMode ? "#f9fafb" : "#111827",
          padding: "1rem",
          fontFamily: "monospace",
          fontSize: "0.85rem",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc" }}>
                <th style={{ textAlign: "left", padding: "8px" }}>Time</th>
                <th style={{ textAlign: "right", padding: "8px" }}>Close / Last</th>
                <th style={{ textAlign: "right", padding: "8px" }}>Volume</th>
                <th style={{ textAlign: "right", padding: "8px" }}>Open</th>
                <th style={{ textAlign: "right", padding: "8px" }}>High</th>
                <th style={{ textAlign: "right", padding: "8px" }}>Low</th>
              </tr>
            </thead>
            <tbody> 
              {customHistory.map((row, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>{row.time}</td>
                  <td style={{ textAlign: "right", padding: "6px 8px" }}>${row.close?.toFixed(2)}</td>
                  <td style={{ textAlign: "right", padding: "6px 8px" }}>{formatVolume(row.volume)}</td>
                  <td style={{ textAlign: "right", padding: "6px 8px" }}>${row.open?.toFixed(2)}</td>
                  <td style={{ textAlign: "right", padding: "6px 8px" }}>${row.high?.toFixed(2)}</td>
                  <td style={{ textAlign: "right", padding: "6px 8px" }}>${row.low?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
          <button
          onClick={() => downloadCSV(customHistory, `${selectedTicker}_history.csv`)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
            color: isDarkMode ? "#f3f4f6" : "#111827",
            border: "1px solid #ccc",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}>
            ⬇ Export CSV
          </button>
        </div>
        
        <footer className="footer" style={{ marginTop: "4rem", textAlign: "center" }}>
        © Built by Veronica
        </footer>
    </div>
  );
}

export default App;
