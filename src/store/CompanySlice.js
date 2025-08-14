// src/store/companySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "https://jarnox-production.up.railway.app";

//  Async thunk to fetch companies from FastAPI
export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      console.log(" Fetching companies from API...");
      const response = await fetch(`${API_BASE_URL}/companies-simple`);
      
      console.warn("RESPONSEEEEEEEEE: ", response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(" Companies data received:", data);
      
      return data;
    } catch (error) {
      console.error(" Error fetching companies:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to populate companies in database
export const populateCompanies = createAsyncThunk(
  "companies/populateCompanies",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🚀 Populating companies in database...");
      const response = await fetch(`${API_BASE_URL}/populate-companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(" Companies populated:", result);
      
      return result;
    } catch (error) {
      console.error(" Error populating companies:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

//  Async thunk to fetch historical data
export const fetchHistoricalData = createAsyncThunk(
  "companies/fetchHistoricalData",
  async ({ ticker, startDate, endDate, interval = "1d" }, { rejectWithValue }) => {
    try {
      console.log(`🚀 Fetching historical data for ${ticker}...`);
      
      let url = `${API_BASE_URL}/historical/${ticker}`;
      const params = new URLSearchParams();
      
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (interval) params.append("interval", interval);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      console.warn(`HISTORICAL RESPONSE for ${ticker}: `, response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(` Historical data received for ${ticker}:`, data);
      
      return data;
    } catch (error) {
      console.error(` Error fetching historical data for ${ticker}:`, error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to check database status
export const checkDbStatus = createAsyncThunk(
  "companies/checkDbStatus",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🚀 Checking database status...");
      const response = await fetch(`${API_BASE_URL}/db-status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Database status:", data);
      
      return data;
    } catch (error) {
      console.error(" Error checking database status:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

const companySlice = createSlice({
  name: "companies",
  initialState: {
    // Companies data
    data: [],
    loading: false,
    error: null,
    
    // Historical data
    historicalData: {},
    historicalLoading: {},
    historicalError: {},
    
    // Database status
    dbStatus: null,
    dbStatusLoading: false,
    dbStatusError: null,
    
    // Population status
    populationLoading: false,
    populationError: null,
    populationSuccess: null,
  },
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.historicalError = {};
      state.dbStatusError = null;
      state.populationError = null;
    },
    
    // Clear historical data for a specific ticker
    clearHistoricalData: (state, action) => {
      const ticker = action.payload;
      delete state.historicalData[ticker];
      delete state.historicalLoading[ticker];
      delete state.historicalError[ticker];
    },
    
    // Clear all historical data
    clearAllHistoricalData: (state) => {
      state.historicalData = {};
      state.historicalLoading = {};
      state.historicalError = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Populate Companies
      .addCase(populateCompanies.pending, (state) => {
        state.populationLoading = true;
        state.populationError = null;
        state.populationSuccess = null;
      })
      .addCase(populateCompanies.fulfilled, (state, action) => {
        state.populationLoading = false;
        state.populationSuccess = action.payload.message;
        state.populationError = null;
      })
      .addCase(populateCompanies.rejected, (state, action) => {
        state.populationLoading = false;
        state.populationError = action.payload || action.error.message;
        state.populationSuccess = null;
      })
      
      // Fetch Historical Data
      .addCase(fetchHistoricalData.pending, (state, action) => {
        const ticker = action.meta.arg.ticker;
        state.historicalLoading[ticker] = true;
        delete state.historicalError[ticker];
      })
      .addCase(fetchHistoricalData.fulfilled, (state, action) => {
        const ticker = action.payload.ticker;
        state.historicalLoading[ticker] = false;
        state.historicalData[ticker] = action.payload;
        delete state.historicalError[ticker];
      })
      .addCase(fetchHistoricalData.rejected, (state, action) => {
        const ticker = action.meta.arg.ticker;
        state.historicalLoading[ticker] = false;
        state.historicalError[ticker] = action.payload || action.error.message;
      })
      
      // Check DB Status
      .addCase(checkDbStatus.pending, (state) => {
        state.dbStatusLoading = true;
        state.dbStatusError = null;
      })
      .addCase(checkDbStatus.fulfilled, (state, action) => {
        state.dbStatusLoading = false;
        state.dbStatus = action.payload;
        state.dbStatusError = null;
      })
      .addCase(checkDbStatus.rejected, (state, action) => {
        state.dbStatusLoading = false;
        state.dbStatusError = action.payload || action.error.message;
      });
  },
});

// Export actions
export const { clearErrors, clearHistoricalData, clearAllHistoricalData } = companySlice.actions;

// Export selectors
export const selectCompanies = (state) => state.companies.data;
export const selectCompaniesLoading = (state) => state.companies.loading;
export const selectCompaniesError = (state) => state.companies.error;

export const selectHistoricalData = (ticker) => (state) => 
  state.companies.historicalData[ticker] || null;
export const selectHistoricalLoading = (ticker) => (state) => 
  state.companies.historicalLoading[ticker] || false;
export const selectHistoricalError = (ticker) => (state) => 
  state.companies.historicalError[ticker] || null;

export const selectDbStatus = (state) => state.companies.dbStatus;
export const selectDbStatusLoading = (state) => state.companies.dbStatusLoading;
export const selectDbStatusError = (state) => state.companies.dbStatusError;

export const selectPopulationLoading = (state) => state.companies.populationLoading;
export const selectPopulationError = (state) => state.companies.populationError;
export const selectPopulationSuccess = (state) => state.companies.populationSuccess;

// Export reducer
export default companySlice.reducer;