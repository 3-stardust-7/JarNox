import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSelectedCompany } from '../store/SelectedCompanySlice';
import { 
  fetchHistoricalData, 
  selectHistoricalData, 
  selectHistoricalLoading, 
  selectHistoricalError 
} from '../store/CompanySlice';
import StockChart from './StockChart';
import StockStats from './StockStats';

const StockDashboard = () => {
  const dispatch = useDispatch();
  const selectedTicker = useSelector(selectSelectedCompany);
  
  const historicalData = useSelector(selectHistoricalData(selectedTicker));
  const historicalLoading = useSelector(selectHistoricalLoading(selectedTicker));
  const historicalError = useSelector(selectHistoricalError(selectedTicker));
  
  useEffect(() => {
    if (selectedTicker) {
      dispatch(fetchHistoricalData({ ticker: selectedTicker }));
    }
  }, [selectedTicker, dispatch]);
  
  if (!selectedTicker) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Please select a company to view its stock data</div>
      </div>
    );
  }
  
  if (historicalLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-20"></div>
          ))}
        </div>
        <div className="bg-gray-200 rounded-2xl h-96"></div>
        <div className="bg-gray-200 rounded-2xl h-64"></div>
      </div>
    );
  }
  
  if (historicalError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">Error loading data: {historicalError}</div>
        <button 
          onClick={() => dispatch(fetchHistoricalData({ ticker: selectedTicker }))}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Handle both possible data structures from your API
  const stockData = historicalData?.historical_data || historicalData?.prices || [];
  
  console.log('Historical Data Structure:', historicalData);
  console.log('Stock Data Array:', stockData);
  
  if (!stockData.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No historical data available for {selectedTicker}</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Stock Statistics */}
      <StockStats data={stockData} />
      
      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTicker} Stock Price</h2>
          <p className="text-gray-600">Historical price movement and trends</p>
        </div>
        
        <div className="p-6">
          <StockChart data={stockData} ticker={selectedTicker} />
        </div>
      </div>
      
      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Historical Data</h3>
          <p className="text-gray-600">Detailed price and volume information</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Open</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">High</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Low</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Close</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Volume</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((record, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{record.date}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-700">${parseFloat(record.open).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-700">${parseFloat(record.high).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-700">${parseFloat(record.low).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">${parseFloat(record.close).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-700">{parseInt(record.volume).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;