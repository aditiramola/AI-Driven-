// components/TradeSignalCard.jsx
import React from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Shield, Target, AlertCircle } from "lucide-react";

export const TradeSignalCard = ({ signal }) => {
  if (!signal) return null;
  
  const getSignalColor = (signalType) => {
    switch(signalType) {
      case "BUY": return "bg-green-900/30 border-green-500";
      case "SELL": return "bg-red-900/30 border-red-500";
      default: return "bg-gray-900/30 border-gray-500";
    }
  };
  
  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case "LOW": return "text-green-400";
      case "MEDIUM": return "text-yellow-400";
      case "HIGH": return "text-red-400";
      default: return "text-gray-400";
    }
  };
  
  const getSignalIcon = (signalType) => {
    switch(signalType) {
      case "BUY": return <TrendingUp className="w-5 h-5" />;
      case "SELL": return <TrendingDown className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };
  
  const getRiskIcon = (riskLevel) => {
    switch(riskLevel) {
      case "LOW": return <Shield className="w-4 h-4 text-green-400" />;
      case "MEDIUM": return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case "HIGH": return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };
  
  return (
    <div className={`p-4 rounded-lg border ${getSignalColor(signal.signal)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getSignalIcon(signal.signal)}
          <span className="text-lg font-bold">{signal.signal}</span>
        </div>
        <div className="flex items-center space-x-2">
          {getRiskIcon(signal.risk_level)}
          <span className={`text-sm font-medium ${getRiskColor(signal.risk_level)}`}>
            {signal.risk_level} Risk
          </span>
        </div>
      </div>
      
      {/* Confidence Meter */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Confidence</span>
          <span>{signal.confidence}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              signal.confidence > 70 ? "bg-green-500" : 
              signal.confidence > 40 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${signal.confidence}%` }}
          />
        </div>
      </div>
      
      {/* Key Levels */}
      {(signal.levels?.stop_loss || signal.levels?.take_profit) && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {signal.levels.stop_loss && (
            <div className="bg-gray-900/50 p-2 rounded">
              <div className="flex items-center space-x-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-xs text-gray-400">Stop Loss</span>
              </div>
              <div className="text-sm font-bold">${signal.levels.stop_loss.toFixed(2)}</div>
            </div>
          )}
          {signal.levels.take_profit && (
            <div className="bg-gray-900/50 p-2 rounded">
              <div className="flex items-center space-x-1 mb-1">
                <Target className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-400">Take Profit</span>
              </div>
              <div className="text-sm font-bold">${signal.levels.take_profit.toFixed(2)}</div>
            </div>
          )}
        </div>
      )}
      
      {/* Indicators Summary */}
      {signal.indicators && (
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-2">Indicators</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-gray-400">RSI</div>
              <div className={`font-bold ${
                signal.indicators.rsi < 30 ? "text-green-400" : 
                signal.indicators.rsi > 70 ? "text-red-400" : "text-white"
              }`}>
                {signal.indicators.rsi?.toFixed(1) || "N/A"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Volume</div>
              <div className="font-bold">
                {signal.indicators.volume_ratio?.toFixed(2) || "N/A"}x
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">SMA 20/50</div>
              <div className={`font-bold ${
                signal.indicators.sma_20 > signal.indicators.sma_50 ? "text-green-400" : "text-red-400"
              }`}>
                {signal.indicators.sma_20 > signal.indicators.sma_50 ? "Bullish" : "Bearish"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};