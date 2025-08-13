import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { 
  fetchCompanies, 
  selectCompanies, 
  selectCompaniesLoading, 
  selectCompaniesError 
} from '../store/CompanySlice';
import { 
  setSelectedCompany, 
  selectSelectedCompany 
} from '../store/SelectedCompanySlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const companies = useSelector(selectCompanies);
  const loading = useSelector(selectCompaniesLoading);
  const error = useSelector(selectCompaniesError);
  const selectedTicker = useSelector(selectSelectedCompany);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  return (
    <div className="flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div
        className={`w-80 bg-white shadow-xl flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-700 hover:text-gray-900"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-b from-blue-600 to-blue-400 text-white">
          <h2 className="text-2xl font-bold mb-1">Companies</h2>
          <p className="text-sm">Select a company</p>
        </div>

        {/* Company list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading companies...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : (
            companies.map((company) => (
              <button
                key={company.ticker}
                onClick={() => {
  dispatch(setSelectedCompany(company.ticker));
  setIsSidebarOpen(false); // or true if you want it to open
}}

                className={`w-full text-left p-4 flex items-center gap-3 border-b transition-all ${
                  selectedTicker === company.ticker
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-blue-600">{company.ticker}</div>
                  <div className="text-sm text-gray-600">{company.name}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 ml-0 lg:ml-80 p-6 overflow-auto">
        {/* Toggle button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Open Companies
        </button>

        {/* Your dashboard content goes here */}
      </div>
    </div>
  );
};

export default Sidebar;
