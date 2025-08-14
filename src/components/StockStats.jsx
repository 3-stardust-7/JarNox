import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const StockStats = ({ data }) => {
  const [selectedStat, setSelectedStat] = useState(null); // For modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!data || !data.length) return null;

  const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sortedData[0];
  const previous = sortedData[1];
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
    color: 'text-gray-900',
    definition: 'The latest price at which the stock was traded during the market’s most recent session. This value is often used as a reference point for gauging daily market performance.'
  },
  { 
    label: 'Daily Change', 
    value: `${change > 0 ? '+' : ''}${change.toFixed(2)}`, 
    icon: change >= 0 ? TrendingUp : TrendingDown,
    color: change >= 0 ? 'text-green-600' : 'text-red-600',
    definition: 'The difference between today’s closing price and the previous trading day’s closing price. A positive value indicates the stock has gained, while a negative value shows a loss.'
  },
  { 
    label: 'Change %', 
    value: `${change > 0 ? '+' : ''}${changePercent.toFixed(2)}%`, 
    icon: change >= 0 ? TrendingUp : TrendingDown,
    color: change >= 0 ? 'text-green-600' : 'text-red-600',
    definition: 'The daily change expressed as a percentage of the previous day’s closing price. This helps investors quickly gauge the scale of a stock’s movement relative to its prior value.'
  },
  { 
    label: 'Volume', 
    value: volume.toLocaleString(), 
    icon: Calendar,
    color: 'text-gray-900',
    definition: 'The total number of shares that were traded during the current trading session. High volume can indicate strong investor interest or market-moving events.'
  },
  {
    label: 'Day High',
    value: `${parseFloat(latest.high).toFixed(2)}`,
    icon: TrendingUp,
    color: 'text-green-600',
    definition: 'The highest transaction price recorded for the stock during the current trading day, representing the peak of investor demand within that period.'
  },
  {
    label: 'Day Low',
    value: `${parseFloat(latest.low).toFixed(2)}`,
    icon: TrendingDown,
    color: 'text-red-600',
    definition: 'The lowest transaction price recorded for the stock during the current trading day, indicating the weakest point of demand in the session.'
  },
  {
    label: 'Period High',
    value: `${high.toFixed(2)}`,
    icon: TrendingUp,
    color: 'text-green-600',
    definition: 'The maximum price reached by the stock over the entire selected time range. It’s a useful benchmark for identifying upward resistance levels.'
  },
  {
    label: 'Period Low',
    value: `${low.toFixed(2)}`,
    icon: TrendingDown,
    color: 'text-red-600',
    definition: 'The minimum price reached by the stock over the entire selected time range. Traders use this as a reference for potential support levels.'
  }
];


  const openModal = (stat) => {
    setSelectedStat(stat);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStat(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => openModal(stat)}
            className="cursor-pointer bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
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
              <span className="text-sm sm:text-lg xl:text-2xl 2xl:text-4xl text-gray-600">{stat.label}</span>
            </div>
            <div className={`text-sm sm:text-lg xl:text-xl 2xl:text-3xl flex justify-center font-semibold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
 {/* Modal */}
{isModalOpen && selectedStat && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 px-4"
    onClick={closeModal} // click on background closes modal
  >
    <div
      className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg relative"
      onClick={(e) => e.stopPropagation()} // prevent background click when inside modal
    >
      <h2 className="text-xl 2xl:text-3xl font-bold mb-4">
        {selectedStat.label}
      </h2>
      <p className="text-gray-700 2xl:text-3xl mb-6">
        {selectedStat.definition}
      </p>
      <button
        onClick={closeModal}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
      <div className={`text-lg 2xl:text-3xl font-semibold ${selectedStat.color}`}>
        {selectedStat.value}
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default StockStats;
