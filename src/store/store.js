import { configureStore } from "@reduxjs/toolkit";
import pingReducer from "./StockSlice";
import CompanySlice from "./CompanySlice"

export const store = configureStore({
  reducer: {
    ping: pingReducer,
     companies: CompanySlice,
  },
});