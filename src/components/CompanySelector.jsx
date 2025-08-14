import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, TrendingUp, Search, Building2, Menu } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0  bg-opacity-50 z-30 2xl:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-80 lg:w-100 2xl:w-120 bg-gradient-to-br from-gray-100 to-gray-100 shadow-2xl flex flex-col fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out border-r border-gray-200
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 2xl:translate-x-0`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gray-300 bg-opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                               radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`
            }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className=" bg-gray-500 bg-opacity-20 rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl text-gray-500 font-bold">Companies</h2>
            </div>
            <p className="text-blue-900 text-lg sm:text-xl lg:text-2xl 2xl:text-5xl font-bold">Select a company to view stock data</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-6 lg:h-6" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 lg:py-4 2xl:py-6 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-xl 2xl:text-2xl"
            />
          </div>
        </div>

        {/* Company list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Loading companies...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No companies found</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredCompanies.map((company, index) => (
                <button
                  key={company.ticker}
                  onClick={() => {
                    dispatch(setSelectedCompany(company.ticker));
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left p-4 lg:p-8 flex items-center gap-4 transition-all duration-200 group relative
                    ${selectedTicker === company.ticker
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500 shadow-sm'
                      : 'hover:bg-gray-50 hover:shadow-sm'
                    }`}
                >
                  {/* Company Icon */}
                  <div className={`w-12 h-12 xl:w-16 xl:h-16 sm:mr-2 rounded-xl flex items-center justify-center font-bold sm:text-lg text-sm xl:text-2xl transition-all
                    ${selectedTicker === company.ticker 
                      ? 'bg-gradient-to-br from-blue-900 to-indigo-600 text-white shadow-lg'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-600'
                    }`}
                  >
                    {company.ticker.substring(0, 1)}
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold sm:text-lg text-sm xl:text-2xl transition-colors truncate
                      ${selectedTicker === company.ticker
                        ? 'text-blue-800'
                        : 'text-gray-900 group-hover:text-blue-700'
                      }`}
                    >
                      {company.ticker}
                    </div>
                    <div className="sm:text-lg text-sm xl:text-2xl text-gray-600 truncate mt-0.5">
                      {company.name}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedTicker === company.ticker && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}

                  {/* Hover Arrow */}
                  <div className={`flex-shrink-0 transition-all duration-200
                    ${selectedTicker === company.ticker
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-300">
          <p className="text-sm lg:text-xl text-blue-900 font-bold text-center">
            {filteredCompanies.length} companies available
          </p>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 lg:ml-80 transition-all duration-300">
        {/* Toggle button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="2xl:hidden fixed top-4 right-4 z-20 p-3 bg-white text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
        >
          <Menu className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};

export default Sidebar;