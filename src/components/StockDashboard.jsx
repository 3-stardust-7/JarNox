import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCompanies,
  populateCompanies,
  fetchHistoricalData,
  checkDbStatus,
  clearErrors,
  selectCompanies,
  selectCompaniesLoading,
  selectCompaniesError,
  selectHistoricalData,
  selectHistoricalLoading,
  selectHistoricalError,
  selectDbStatus,
  selectDbStatusLoading,
  selectPopulationLoading,
  selectPopulationSuccess,
  selectPopulationError
} from "../store/CompanySlice";

const StockDashboard = () => {
  const dispatch = useDispatch();
  const [selectedTicker, setSelectedTicker] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-06-30'
  });

  // Selectors
  const companies = useSelector(selectCompanies);
  const companiesLoading = useSelector(selectCompaniesLoading);
  const companiesError = useSelector(selectCompaniesError);
  
  const historicalData = useSelector(selectHistoricalData(selectedTicker));
  const historicalLoading = useSelector(selectHistoricalLoading(selectedTicker));
  const historicalError = useSelector(selectHistoricalError(selectedTicker));
  
  const dbStatus = useSelector(selectDbStatus);
  const dbStatusLoading = useSelector(selectDbStatusLoading);
  
  const populationLoading = useSelector(selectPopulationLoading);
  const populationSuccess = useSelector(selectPopulationSuccess);
  const populationError = useSelector(selectPopulationError);

  // Initialize dashboard
  useEffect(() => {
    console.log('🚀 Dashboard initialized, checking DB status...');
    dispatch(checkDbStatus());
  }, [dispatch]);

  // Auto-fetch companies when DB status is loaded
  useEffect(() => {
    if (dbStatus && !companiesLoading && companies.length === 0) {
      console.log('📊 DB status loaded, fetching companies...');
      dispatch(fetchCompanies());
    }
  }, [dbStatus, dispatch, companiesLoading, companies.length]);

  const handlePopulateCompanies = () => {
    console.log('🔄 Manually populating companies...');
    dispatch(populateCompanies()).then(() => {
      // Refetch companies after population
      dispatch(fetchCompanies());
    });
  };

  const handleFetchHistorical = () => {
    if (!selectedTicker) {
      alert('Please select a company first');
      return;
    }
    
    console.log(`📈 Fetching historical data for ${selectedTicker}...`);
    dispatch(fetchHistoricalData({
      ticker: selectedTicker,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    }));
  };

  const handleClearErrors = () => {
    dispatch(clearErrors());
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Stock Dashboard</h1>

      {/* Database Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🗄️</span>
          Database Status
        </h2>
        
        {dbStatusLoading ? (
          <div className="text-blue-600">Checking database status...</div>
        ) : dbStatus ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded">
              <div className="text-green-700 font-medium">Status</div>
              <div className="text-green-600 capitalize">{dbStatus.status}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-blue-700 font-medium">Companies</div>
              <div className="text-blue-600">{dbStatus.companies}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-purple-700 font-medium">Historical Records</div>
              <div className="text-purple-600">{dbStatus.historical_records}</div>
            </div>
          </div>
        ) : (
          <div className="text-red-600">Unable to connect to database</div>
        )}
      </div>

      {/* Companies Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <span className="mr-2">🏢</span>
            Companies ({companies.length})
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(fetchCompanies())}
              disabled={companiesLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {companiesLoading ? 'Loading...' : 'Refresh Companies'}
            </button>
            
            <button
              onClick={handlePopulateCompanies}
              disabled={populationLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {populationLoading ? 'Populating...' : 'Populate DB'}
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {populationSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ {populationSuccess}
          </div>
        )}
        
        {(companiesError || populationError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>❌ {companiesError || populationError}</span>
            <button
              onClick={handleClearErrors}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          </div>
        )}

        {/* Companies Grid */}
        {companiesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div>Loading companies...</div>
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {companies.map((company) => (
              <div
                key={company.ticker}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTicker === company.ticker
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTicker(company.ticker)}
              >
                <div className="font-bold text-lg text-blue-600">{company.ticker}</div>
                <div className="text-sm text-gray-600 mt-1">{company.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No companies available.</div>
        )}
      </div>

      {/* Historical Data Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <span className="mr-2">📈</span>
            Historical Data
          </h2>
          
          <button
            onClick={handleFetchHistorical}
            disabled={historicalLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {historicalLoading ? 'Fetching...' : 'Fetch Historical Data'}
          </button>
        </div>

        {/* Date Range Inputs */}
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="border rounded p-2"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="border rounded p-2"
          />
        </div>

        {/* Historical Data Display */}
        {historicalLoading ? (
          <div className="text-center py-4">Loading historical data...</div>
        ) : historicalError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>❌ {historicalError}</span>
            <button
              onClick={handleClearErrors}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          </div>
        ) : historicalData ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Open</th>
                  <th className="px-4 py-2 border">High</th>
                  <th className="px-4 py-2 border">Low</th>
                  <th className="px-4 py-2 border">Close</th>
                  <th className="px-4 py-2 border">Volume</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.prices?.map((record, index) => (
                  <tr key={index} className="text-center">
                    <td className="px-4 py-2 border">{record.date}</td>
                    <td className="px-4 py-2 border">{record.open}</td>
                    <td className="px-4 py-2 border">{record.high}</td>
                    <td className="px-4 py-2 border">{record.low}</td>
                    <td className="px-4 py-2 border">{record.close}</td>
                    <td className="px-4 py-2 border">{record.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500">Select a company and fetch historical data.</div>
        )}
      </div>
    </div>
  );
};

export default StockDashboard;
