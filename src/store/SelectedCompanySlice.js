import { createSlice } from '@reduxjs/toolkit';

const selectedCompanySlice = createSlice({
  name: 'selectedCompany',
  initialState: {
    ticker: null,
  },
  reducers: {
    setSelectedCompany: (state, action) => {
      state.ticker = action.payload;
    },
  },
});

export const { setSelectedCompany } = selectedCompanySlice.actions;
export const selectSelectedCompany = (state) => state.selectedCompany.ticker;
export default selectedCompanySlice.reducer;
