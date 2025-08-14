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

# Simple test endpoint
@app.get("/test")
async def test():
    """Test endpoint to verify basic functionality"""
    return {
        "status": "working",
        "message": "API is functional",
        "timestamp": datetime.now().isoformat()
    }

# Test companies endpoint with minimal data
@app.get("/companies-simple")
async def get_companies_simple():
    """Simple companies endpoint with hardcoded data"""
    return [
        {"ticker": "AAPL", "name": "Apple Inc."},
        {"ticker": "MSFT", "name": "Microsoft Corporation"},
        {"ticker": "GOOGL", "name": "Alphabet Inc."},
        {"ticker": "AMZN", "name": "Amazon.com Inc."},
        {"ticker": "TSLA", "name": "Tesla Inc."}
    ]

# Get companies (API-only version)
@app.get("/companies")
async def get_companies():
    """Get first 10 S&P 500 companies from Wikipedia"""
    try:
        print("Fetching companies from Wikipedia...")
        
        # Try to fetch from Wikipedia
        try:
            url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
            table = pd.read_html(url)[0]
            symbols = table["Symbol"].unique()[:10]
        except Exception as e:
            print(f"Error fetching from Wikipedia: {e}")
            # Fallback to hardcoded list
            symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX", "ADBE", "CRM"]
        
        companies = []
        for symbol in symbols:
            try:
                # Simplified approach - just use symbol as name initially
                companies.append({
                    "ticker": symbol, 
                    "name": symbol  # We'll try to get real names later
                })
                
                # Try to get real company name (but don't fail if it doesn't work)
                try:
                    ticker_obj = yf.Ticker(symbol)
                    info = ticker_obj.info
                    real_name = info.get("longName", symbol)
                    if real_name and real_name != symbol:
                        companies[-1]["name"] = real_name
                except:
                    pass  # Keep the symbol as name if yfinance fails
                    
            except Exception as e:
                print(f"Error processing {symbol}: {e}")
                continue
        
        print(f"Successfully fetched {len(companies)} companies")
        
        # Return at least some companies even if some failed
        if not companies:
            # Ultimate fallback
            companies = [
                {"ticker": "AAPL", "name": "Apple Inc."},
                {"ticker": "MSFT", "name": "Microsoft Corporation"},
                {"ticker": "GOOGL", "name": "Alphabet Inc."}
            ]
        
        return companies
        
    except Exception as e:
        print(f"Error in get_companies: {e}")
        # Return fallback data instead of failing
        return [
            {"ticker": "AAPL", "name": "Apple Inc."},
            {"ticker": "MSFT", "name": "Microsoft Corporation"},
            {"ticker": "GOOGL", "name": "Alphabet Inc."},
            {"ticker": "AMZN", "name": "Amazon.com Inc."},
            {"ticker": "TSLA", "name": "Tesla Inc."}
        ]

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