// components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { socket } from "../socket";
import { TradeSignalCard } from "./TradeSignalCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Activity } from "lucide-react";

const Dashboard = () => {
  const [assets, setAssets] = useState({});
  const [signals, setSignals] = useState({});
  const [selectedAsset, setSelectedAsset] = useState("AAPL");

  // Mock data for initial display
  const initialAssets = {
    "AAPL": { symbol: "AAPL", current_price: 193.05, trend: "Bullish" },
    "MSFT": { symbol: "MSFT", current_price: 412.50, trend: "Bullish" },
    "BTC-USD": { symbol: "BTC-USD", current_price: 43560, trend: "Bullish" },
    "ETH-USD": { symbol: "ETH-USD", current_price: 2322, trend: "Bullish" }
  };

  const initialSignals = {
    "AAPL": {
      signal: "BUY",
      confidence: 78,
      risk_level: "LOW",
      current_price: 193.05,
      indicators: { rsi: 65.4, volume_ratio: 1.2, sma_20: 192.5, sma_50: 190.3 },
      levels: { stop_loss: 183.40, take_profit: 212.35 }
    },
    "MSFT": {
      signal: "BUY",
      confidence: 72,
      risk_level: "MEDIUM",
      current_price: 412.50,
      indicators: { rsi: 58.2, volume_ratio: 0.9, sma_20: 410.8, sma_50: 405.6 },
      levels: { stop_loss: 391.88, take_profit: 453.75 }
    },
    "BTC-USD": {
      signal: "HOLD",
      confidence: 45,
      risk_level: "HIGH",
      current_price: 43560,
      indicators: { rsi: 72.8, volume_ratio: 1.5, sma_20: 43200, sma_50: 42800 },
      levels: { stop_loss: 41382, take_profit: 47916 }
    },
    "ETH-USD": {
      signal: "SELL",
      confidence: 65,
      risk_level: "MEDIUM",
      current_price: 2322,
      indicators: { rsi: 75.6, volume_ratio: 1.1, sma_20: 2300, sma_50: 2350 },
      levels: { stop_loss: 2461.32, take_profit: 2089.8 }
    }
  };

  useEffect(() => {
    // Set initial data
    setAssets(initialAssets);
    setSignals(initialSignals);

    // Socket connection
    socket.on("market_update", (data) => {
      const updatedAssets = {};
      const updatedSignals = {};
      
      data.forEach(item => {
        updatedAssets[item.symbol] = item;
        if (item.trade_signal) {
          updatedSignals[item.symbol] = item.trade_signal;
        }
      });
      
      setAssets(prev => ({ ...prev, ...updatedAssets }));
      setSignals(prev => ({ ...prev, ...updatedSignals }));
    });

    // Request initial data
    socket.emit("start_stream", { 
      symbols: ["AAPL", "MSFT", "BTC-USD", "ETH-USD"] 
    });

    return () => {
      socket.off("market_update");
    };
  }, []);

  // Generate chart data
  const generateChartData = (symbol) => {
    const basePrice = assets[symbol]?.current_price || 100;
    const data = [];
    for (let i = 0; i < 10; i++) {
      data.push({
        time: `${i * 5}m`,
        price: basePrice * (1 + (Math.random() - 0.5) * 0.02)
      });
    }
    return data;
  };

  const getPriceColor = (trend) => {
    return trend === "Bullish" ? "text-green-400" : "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            AI Trading Dashboard
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">
            Real-time signals with risk analysis
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg">
          <Activity className="w-5 h-5 text-green-400 animate-pulse" />
          <div className="text-sm">
            <div className="font-medium">Live Updates</div>
            <div className="text-gray-400 text-xs">Connected to market stream</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(initialAssets).map((symbol) => (
              <div 
                key={symbol}
                className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-gray-700 hover:bg-gray-900/70 hover:transform hover:scale-[1.02] ${
                  selectedAsset === symbol ? "ring-2 ring-blue-500 ring-opacity-50" : ""
                }`}
                onClick={() => setSelectedAsset(symbol)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{symbol}</h3>
                    <p className="text-gray-400 text-sm">Live price movement</p>
                  </div>
                  {signals[symbol] && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      signals[symbol].signal === "BUY" ? "bg-green-900/50 text-green-300" :
                      signals[symbol].signal === "SELL" ? "bg-red-900/50 text-red-300" :
                      "bg-gray-800 text-gray-300"
                    }`}>
                      {signals[symbol].signal}
                    </span>
                  )}
                </div>

                <div className="flex items-end justify-between mb-4">
                  <div className="text-2xl font-bold">
                    ${assets[symbol]?.current_price?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || "0.00"}
                  </div>
                  <div className="flex items-center gap-1">
                    {assets[symbol]?.trend === "Bullish" ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={getPriceColor(assets[symbol]?.trend)}>
                      {assets[symbol]?.trend || "Neutral"}
                    </span>
                  </div>
                </div>

                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generateChartData(symbol)}>
                      <defs>
                        <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={signals[symbol]?.signal === "BUY" ? "#10b981" : 
                                                       signals[symbol]?.signal === "SELL" ? "#ef4444" : "#8b5cf6"} 
                                stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={signals[symbol]?.signal === "BUY" ? "#10b981" : 
                                                       signals[symbol]?.signal === "SELL" ? "#ef4444" : "#8b5cf6"} 
                                stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke={signals[symbol]?.signal === "BUY" ? "#10b981" : 
                               signals[symbol]?.signal === "SELL" ? "#ef4444" : "#8b5cf6"}
                        strokeWidth={2}
                        dot={false}
                        fill={`url(#gradient-${symbol})`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signal Panel */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Trade Signal Analysis</h2>
              <div className={`px-2 py-1 rounded text-xs ${
                signals[selectedAsset]?.risk_level === "LOW" ? "bg-green-900/30 text-green-300" :
                signals[selectedAsset]?.risk_level === "MEDIUM" ? "bg-yellow-900/30 text-yellow-300" :
                "bg-red-900/30 text-red-300"
              }`}>
                {signals[selectedAsset]?.risk_level || "MEDIUM"} RISK
              </div>
            </div>
            
            {signals[selectedAsset] ? (
              <TradeSignalCard signal={signals[selectedAsset]} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Loading trade signal...
              </div>
            )}
          </div>

          {/* Risk Summary */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-5">
            <h2 className="text-lg font-bold mb-4">Risk Overview</h2>
            <div className="space-y-3">
              {Object.entries(signals).map(([symbol, signal]) => (
                <div key={symbol} className="flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      signal.risk_level === "LOW" ? "bg-green-500" :
                      signal.risk_level === "MEDIUM" ? "bg-yellow-500" : "bg-red-500"
                    }`} />
                    <div>
                      <div className="font-medium">{symbol}</div>
                      <div className="text-sm text-gray-400">{signal.signal}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      signal.risk_level === "LOW" ? "text-green-400" :
                      signal.risk_level === "MEDIUM" ? "text-yellow-400" : "text-red-400"
                    }`}>
                      {signal.risk_level}
                    </div>
                    <div className="text-xs text-gray-400">
                      {signal.confidence}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Status */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-5">
            <h2 className="text-lg font-bold mb-4">Market Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Total Signals</div>
                <div className="font-bold">4 Active</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-400">High Confidence</div>
                <div className="font-bold text-green-400">3 Signals</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-400">Last Update</div>
                <div className="font-mono text-sm">11:35:52 am</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;