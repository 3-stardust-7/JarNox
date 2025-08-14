import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const StockStats = ({ data }) => {
  if (!data || !data.length) return null;
  
  // Sort data by date to ensure proper ordering
  const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const latest = sortedData[0]; // Most recent
  const previous = sortedData[1]; // Previous day
  
  const currentPrice = parseFloat(latest.close);
  const previousPrice = previous ? parseFloat(previous.close) : currentPrice;
  const change = currentPrice - previousPrice;
  const changePercent = previous ? ((change / previousPrice) * 100) : 0;
  const volume = parseInt(latest.volume);
  
  const high = Math.max(...data.map(d => parseFloat(d.high)));
  const low = Math.min(...data.map(d => parseFloat(d.low)));
  
  const stats = [
    { 
      label: 'Current Price', 
      value: `${currentPrice.toFixed(2)}`, 
      icon: DollarSign,
      color: 'text-gray-900'
    },
    { 
      label: 'Daily Change', 
      value: `${change > 0 ? '+' : ''}${change.toFixed(2)}`, 
      icon: change >= 0 ? TrendingUp : TrendingDown,
      color: change >= 0 ? 'text-green-600' : 'text-red-600'
    },
    { 
      label: 'Change %', 
      value: `${change > 0 ? '+' : ''}${changePercent.toFixed(2)}%`, 
      icon: change >= 0 ? TrendingUp : TrendingDown,
      color: change >= 0 ? 'text-green-600' : 'text-red-600'
    },
    { 
      label: 'Volume', 
      value: volume.toLocaleString(), 
      icon: Calendar,
      color: 'text-gray-900'
    },
    {
      label: 'Day High',
      value: `${parseFloat(latest.high).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Day Low',
      value: `${parseFloat(latest.low).toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-600'
    },
    {
      label: 'Period High',
      value: `${high.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Period Low',
      value: `${low.toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-600'
    }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <div className={`p-1 rounded-full ${
              stat.color === 'text-green-600' ? 'bg-green-50' :
              stat.color === 'text-red-600' ? 'bg-red-50' : 'bg-gray-50'
            }`}>
              <stat.icon className={`w-4 h-4 ${
                stat.color === 'text-green-600' ? 'text-green-600' :
                stat.color === 'text-red-600' ? 'text-red-600' : 'text-gray-500'
              }`} />
            </div>
            <span className="text-sm sm:text-lg xl:text-2xl 2xl:text-4xl text-gray-600 ">{stat.label}</span>
          </div>
          <div className={`text-sm sm:text-lg xl:text-xl 2xl:text-3xl flex justify-center font-semibold ${stat.color}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockStats;