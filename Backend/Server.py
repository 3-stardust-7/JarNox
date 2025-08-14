# Backend/Server.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta

app = FastAPI(title="Stock Data API")

# CORS - Add your Vercel URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://jar-nox-git-main-v-kirubhas-projects.vercel.app",
        "https://jar-nox.vercel.app",
        "http://localhost:3000",  # for local development
        "http://localhost:5173"   # for Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Stock Data API is running!"}

# Health check endpoint
@app.get("/ping")
async def ping():
    return {"message": "pong"}

# Get companies (API-only version)
@app.get("/companies")
async def get_companies():
    """Get first 10 S&P 500 companies from Wikipedia"""
    try:
        print("Fetching companies from Wikipedia...")
        url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
        table = pd.read_html(url)[0]
        
        companies = []
        for symbol in table["Symbol"].unique()[:10]:
            try:
                ticker_obj = yf.Ticker(symbol)
                info = ticker_obj.info
                name = info.get("longName", symbol)
            except Exception as e:
                print(f"Error getting info for {symbol}: {e}")
                name = symbol
            
            companies.append({
                "ticker": symbol, 
                "name": name
            })
        
        print(f"Successfully fetched {len(companies)} companies")
        return companies
        
    except Exception as e:
        print(f"Error fetching companies: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching companies: {str(e)}")

# Get historical data (API-only version)
@app.get("/historical/{ticker}")
async def get_historical(ticker: str, start_date: str = None, end_date: str = None):
    """Get historical stock data for a ticker"""
    try:
        print(f"Fetching historical data for {ticker}...")
        
        ticker_obj = yf.Ticker(ticker)
        
        # Set default date range if not provided
        if not start_date or not end_date:
            end = datetime.today()
            start = end - timedelta(days=30)
            start_date = start.strftime("%Y-%m-%d")
            end_date = end.strftime("%Y-%m-%d")
        
        # Fetch historical data
        hist = ticker_obj.history(start=start_date, end=end_date)
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for ticker {ticker}")
        
        # Convert to list of dictionaries
        hist = hist.reset_index()
        data = []
        
        for _, row in hist.iterrows():
            data.append({
                "date": row["Date"].strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": float(row["Volume"])
            })
        
        print(f"Successfully fetched {len(data)} records for {ticker}")
        return {
            "ticker": ticker.upper(),
            "historical_data": data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching historical data for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching data for {ticker}: {str(e)}")

# API status endpoint
@app.get("/status")
async def get_status():
    """Get API status"""
    return {
        "status": "running",
        "message": "Stock Data API is operational",
        "endpoints": [
            "/companies - Get list of companies",
            "/historical/{ticker} - Get historical data for a ticker",
            "/ping - Health check"
        ]
    }