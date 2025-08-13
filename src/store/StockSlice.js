import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchPing = createAsyncThunk("ping/fetchPing", async () => {
  const res = await axios.get("http://127.0.0.1:8000/ping");
  return res.data; // should return { message: "pong" }
});

export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
  async () => {

    const res = await fetch("http://127.0.0.1:8000/companies"); // Adjust URL if needed
    console.warn("RESPONSEEEEEEEEE: ",res)
    if (!res.ok) throw new Error("Failed to fetch companies");
    return await res.json();
  }
);

const PingSlice = createSlice({
  name: "ping",
  initialState: {
    message: null,
    status: "idle",
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPing.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPing.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
      })
      .addCase(fetchPing.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default PingSlice.reducer;
