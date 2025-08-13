import { configureStore } from "@reduxjs/toolkit";
import CompanySlice from "./CompanySlice";
import SelectedCompanySlice from "./SelectedCompanySlice";

export const store = configureStore({
  reducer: {
    companies: CompanySlice,           // For companies + historical data
    selectedCompany: SelectedCompanySlice // For which company is selected
  },
});
