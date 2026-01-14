// Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  Zap,
  Target,
  Shield,
  BarChart3,
  Volume2,
  TrendingUp as SMAIcon,
  ChevronRight,
  DollarSign
} from 'lucide-react';

const Dashboard = () => {
  // State for selected stock
  const [selectedStock, setSelectedStock] = useState('AAPL');
  
  // Asset data state
  const [assets, setAssets] = useState([
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      price: 192.13, 
      volatility: 0.8,
      history: [],
      color: '#007AFF',
      signal: 'SELL',
      confidence: 79,
      stopLoss: 183.40,
      takeProfit: 212.35,
      indicators: {
        rsi: 66.6,
        volume: '1.33x',
        sma: 'Bullish'
      },
      risk: 'low'
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft', 
      price: 406.50, 
      volatility: 0.7,
      history: [],
      color: '#7FBA00',
      signal: 'BUY',
      confidence: 72,
      stopLoss: 385.00,
      takeProfit: 430.00,
      indicators: {
        rsi: 58.2,
        volume: '1.20x',
        sma: 'Bullish'
      },
      risk: 'low'
    },
    { 
      symbol: 'BTC-USD', 
      name: 'Bitcoin USD', 
      price: 43570.02, 
      volatility: 2.5,
      history: [],
      color: '#F7931A',
      signal: 'BUY',
      confidence: 85,
      stopLoss: 42000.00,
      takeProfit: 46000.00,
      indicators: {
        rsi: 62.4,
        volume: '1.50x',
        sma: 'Bullish'
      },
      risk: 'medium'
    },
    { 
      symbol: 'ETH-USD', 
      name: 'Ethereum USD', 
      price: 2316.17, 
      volatility: 2.0,
      history: [],
      color: '#627EEA',
      signal: 'HOLD',
      confidence: 65,
      stopLoss: 2200.00,
      takeProfit: 2500.00,
      indicators: {
        rsi: 54.8,
        volume: '1.25x',
        sma: 'Neutral'
      },
      risk: 'medium'
    },
    { 
      symbol: 'META', 
      name: 'Meta Platforms', 
      price: 412.29, 
      volatility: 1.2,
      history: [],
      color: '#0081FB',
      signal: 'BUY',
      confidence: 81,
      stopLoss: 390.00,
      takeProfit: 450.00,
      indicators: {
        rsi: 59.7,
        volume: '1.40x',
        sma: 'Bullish'
      },
      risk: 'low'
    },
    { 
      symbol: 'ETC', 
      name: 'Ethereum Classic', 
      price: 2325.62, 
      volatility: 1.8,
      history: [],
      color: '#04A5A5',
      signal: 'SELL',
      confidence: 68,
      stopLoss: 2400.00,
      takeProfit: 2150.00,
      indicators: {
        rsi: 71.2,
        volume: '0.90x',
        sma: 'Bearish'
      },
      risk: 'high'
    }
  ]);

  const canvasRefs = useRef({});

  // Get current selected stock data
  const currentStock = assets.find(asset => asset.symbol === selectedStock);

  // Initialize chart data
  useEffect(() => {
    const initialAssets = assets.map(asset => ({
      ...asset,
      history: Array.from({ length: 30 }, () => asset.price + (Math.random() - 0.5) * asset.price * (asset.volatility/100))
    }));
    setAssets(initialAssets);
  }, []);

  // Initialize canvas drawing
  useEffect(() => {
    assets.forEach(asset => {
      drawChart(asset.symbol);
    });
  }, [assets]);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      updatePrices();
    }, 2000);

    return () => clearInterval(interval);
  }, [assets]);

  const drawChart = (symbol) => {
    const canvas = canvasRefs.current[symbol];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const asset = assets.find(a => a.symbol === symbol);
    if (!asset || !asset.history.length) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculate min/max for scaling
    const history = asset.history;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;

    // Create gradient for line
    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, asset.color);
    lineGradient.addColorStop(1, `${asset.color}80`);

    // Draw area gradient
    const areaGradient = ctx.createLinearGradient(0, 0, 0, height);
    areaGradient.addColorStop(0, `${asset.color}20`);
    areaGradient.addColorStop(1, `${asset.color}05`);

    // Begin drawing
    ctx.beginPath();

    // Draw line
    for (let i = 0; i < history.length; i++) {
      const x = padding + (i / (history.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((history[i] - min) / range) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        // Smooth curve with bezier
        const prevX = padding + ((i - 1) / (history.length - 1)) * chartWidth;
        const prevY = padding + chartHeight - ((history[i - 1] - min) / range) * chartHeight;
        
        const cp1x = prevX + (x - prevX) / 3;
        const cp1y = prevY;
        const cp2x = x - (x - prevX) / 3;
        const cp2y = y;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }
    }

    // Stroke the line
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Fill area under curve
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.closePath();
    ctx.fillStyle = areaGradient;
    ctx.fill();
  };

  const updatePrices = () => {
    setAssets(prevAssets => 
      prevAssets.map(asset => {
        const lastPrice = asset.price;
        let change = 0;

        // Simulate realistic price movement
        change += (Math.random() - 0.5) * asset.volatility;
        
        // Add momentum if there's history
        if (asset.history.length > 5) {
          const recentTrend = asset.history[asset.history.length - 1] - asset.history[asset.history.length - 5];
          change += recentTrend * 0.05;
        }
        
        // Add micro-fluctuations
        change += (Math.random() - 0.5) * 0.3;
        
        const newPrice = lastPrice + change;
        
        // Update history
        const newHistory = [...asset.history.slice(-29), newPrice];

        // Update signal occasionally (more realistic)
        let newSignal = asset.signal;
        let newConfidence = asset.confidence;
        
        if (Math.random() > 0.95) {
          const signals = ['BUY', 'SELL', 'HOLD'];
          newSignal = signals[Math.floor(Math.random() * signals.length)];
          newConfidence = Math.max(60, Math.min(90, asset.confidence + (Math.random() - 0.5) * 10));
        }

        return {
          ...asset,
          price: parseFloat(newPrice.toFixed(2)),
          history: newHistory,
          signal: newSignal,
          confidence: newConfidence
        };
      })
    );
  };

  const handleStockClick = (symbol) => {
    setSelectedStock(symbol);
  };

  const getSignalColor = (signal) => {
    switch(signal) {
      case 'BUY': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'SELL': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HOLD': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSignalIcon = (signal) => {
    switch(signal) {
      case 'BUY': return <TrendingUp className="w-6 h-6" />;
      case 'SELL': return <TrendingDown className="w-6 h-6" />;
      case 'HOLD': return <Activity className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatPrice = (price, symbol) => {
    if (symbol.includes('USD') && price > 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(2)}`;
  };

  if (!currentStock) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI Trading Dashboard
          </h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">LIVE</span>
          </div>
        </div>
        <p className="text-gray-400">Real-time signals with risk analysis</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Asset Cards - 6 items spanning 2 columns */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {assets.map((asset) => (
              <div 
                key={asset.symbol}
                onClick={() => handleStockClick(asset.symbol)}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 hover:shadow-xl cursor-pointer transform hover:-translate-y-1 ${
                  selectedStock === asset.symbol 
                    ? 'border-blue-500 shadow-lg shadow-blue-900/20' 
                    : 'border-gray-700/50 hover:border-gray-600/50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{asset.symbol}</h3>
                    <p className="text-sm text-gray-400">{asset.name}</p>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    {selectedStock === asset.symbol && (
                      <ChevronRight className="w-4 h-4 text-blue-400 ml-1" />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold font-mono">
                    {formatPrice(asset.price, asset.symbol)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Live price movement</div>
                </div>

                {/* Chart Container */}
                <div className="h-20 w-full">
                  <canvas
                    ref={el => canvasRefs.current[asset.symbol] = el}
                    width={300}
                    height={80}
                    className="w-full h-full"
                  />
                </div>

                {/* Click hint */}
                {selectedStock !== asset.symbol && (
                  <div className="text-xs text-gray-500 text-center mt-2">
                    Click for trade analysis
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Trade Signal Analysis */}
        <div className="space-y-6">
          {/* Trade Signal Analysis for Selected Stock */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
            {/* Selected Stock Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${currentStock.color}20, ${currentStock.color}10)`,
                      border: `2px solid ${currentStock.color}40`
                    }}
                  >
                    {currentStock.symbol}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{currentStock.name}</h2>
                    <p className="text-gray-400">Trade Signal Analysis</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-3xl font-bold font-mono mb-1">
                {formatPrice(currentStock.price, currentStock.symbol)}
              </div>
              <div className="text-center text-sm text-gray-400">
                Current Market Price
              </div>
            </div>

            {/* Signal Display - Now shows BUY/SELL */}
            <div className={`text-center py-6 mb-6 rounded-xl border-2 ${
              currentStock.signal === 'BUY' 
                ? 'bg-green-500/10 border-green-500/40' 
                : currentStock.signal === 'SELL'
                ? 'bg-red-500/10 border-red-500/40'
                : 'bg-yellow-500/10 border-yellow-500/40'
            }`}>
              <div className="flex flex-col items-center justify-center gap-3">
                {getSignalIcon(currentStock.signal)}
                <div className={`text-4xl font-bold ${
                  currentStock.signal === 'BUY' ? 'text-green-400' :
                  currentStock.signal === 'SELL' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {currentStock.signal}
                </div>
                <div className="text-sm text-gray-300">Recommended Action</div>
                <div className="text-xs text-gray-400 mt-2">
                  AI-generated trading signal
                </div>
              </div>
            </div>

            {/* Confidence */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                <span>AI Confidence Level</span>
                <span className="font-semibold">{currentStock.confidence.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${currentStock.confidence}%` }}
                />
              </div>
            </div>

            {/* Trade Levels */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Stop Loss</span>
                </div>
                <div className="font-semibold font-mono text-lg">
                  {formatPrice(currentStock.stopLoss, currentStock.symbol)}
                </div>
                <div className="text-xs text-red-400 mt-1">
                  {((currentStock.price - currentStock.stopLoss) / currentStock.price * 100).toFixed(1)}% downside protection
                </div>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Take Profit</span>
                </div>
                <div className="font-semibold font-mono text-lg">
                  {formatPrice(currentStock.takeProfit, currentStock.symbol)}
                </div>
                <div className="text-xs text-green-400 mt-1">
                  {((currentStock.takeProfit - currentStock.price) / currentStock.price * 100).toFixed(1)}% potential gain
                </div>
              </div>
            </div>

            {/* Indicators */}
            <div>
              <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Technical Indicators
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-900/30 rounded-lg border border-gray-700/30">
                  <div className="text-xs text-gray-400 mb-1">RSI</div>
                  <div className={`font-semibold text-lg ${
                    currentStock.indicators.rsi > 70 ? 'text-red-400' :
                    currentStock.indicators.rsi < 30 ? 'text-green-400' : 'text-white'
                  }`}>
                    {currentStock.indicators.rsi}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-900/30 rounded-lg border border-gray-700/30">
                  <div className="text-xs text-gray-400 mb-1">Volume</div>
                  <div className="font-semibold text-lg">{currentStock.indicators.volume}</div>
                </div>
                <div className="text-center p-3 bg-gray-900/30 rounded-lg border border-gray-700/30">
                  <div className="text-xs text-gray-400 mb-1">SMA 20/50</div>
                  <div className={`font-semibold text-lg ${
                    currentStock.indicators.sma === 'Bullish' ? 'text-green-400' : 
                    currentStock.indicators.sma === 'Bearish' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {currentStock.indicators.sma}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Overview */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Risk Overview
              </h2>
              <div className={`px-3 py-1 rounded-full text-xs border ${getRiskColor(currentStock.risk)}`}>
                {currentStock.risk.toUpperCase()} RISK
              </div>
            </div>

            <div className="space-y-3">
              {assets.map((asset) => (
                <div 
                  key={asset.symbol}
                  onClick={() => handleStockClick(asset.symbol)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedStock === asset.symbol
                      ? 'bg-gray-700/50 border-gray-600'
                      : 'border-gray-700/50 hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${asset.color}20, ${asset.color}10)`,
                        border: `1px solid ${asset.color}30`
                      }}
                    >
                      {asset.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-xs text-gray-400">{asset.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold font-mono">
                      {formatPrice(asset.price, asset.symbol)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Click to analyze
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 pt-4 border-t border-gray-800/50">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Connected to live feed</span>
            </div>
            <span>•</span>
            <span>Analyzing: <span className="font-semibold text-white">{currentStock.symbol}</span> - Signal: <span className={`font-semibold ${
              currentStock.signal === 'BUY' ? 'text-green-400' :
              currentStock.signal === 'SELL' ? 'text-red-400' :
              'text-yellow-400'
            }`}>{currentStock.signal}</span></span>
            <span>•</span>
            <span>Last update: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="text-xs">
            Click any asset to view AI trading signals
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;