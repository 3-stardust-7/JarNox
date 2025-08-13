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

const CompanySelector = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  
  // Redux selectors
  const companies = useSelector(selectCompanies);
  const loading = useSelector(selectCompaniesLoading);
  const error = useSelector(selectCompaniesError);
  const selectedTicker = useSelector(selectSelectedCompany);
  
  // Fetch companies on mount
  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);
  
  const selectedCompany = companies.find(c => c.ticker === selectedTicker);
  
  const handleSelectCompany = (ticker) => {
    dispatch(setSelectedCompany(ticker));
    setIsOpen(false);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Stock Market Dashboard</h1>
          <p className="text-blue-100">Select a company to view historical data and charts</p>
        </div>
        
        <div className="p-6">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-gray-200 transition-all duration-200 hover:border-blue-300"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">
                    {selectedCompany ? selectedCompany.ticker : 'Select Company'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedCompany ? selectedCompany.name : 'Choose from available companies'}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading companies...</div>
                ) : error ? (
                  <div className="p-6 text-center text-red-500">{error}</div>
                ) : (
                  <div className="py-2">
                    {companies.map((company) => (
                      <button
                        key={company.ticker}
                        onClick={() => handleSelectCompany(company.ticker)}
                        className={`w-full text-left px-6 py-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          selectedTicker === company.ticker ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="font-bold text-blue-600 text-lg">{company.ticker}</div>
                        <div className="text-sm text-gray-600 mt-1">{company.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySelector;