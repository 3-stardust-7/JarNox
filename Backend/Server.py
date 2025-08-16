# Backend/Server.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .db import (
    Company, HistoricalPrice,
    SessionLocal,
    populate_companies_db,
    populate_historical_data,
    get_companies_fallback,
    get_historical_fallback
)
from datetime import datetime, timedelta

app = FastAPI(title="Stock Data API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Root endpoint - Fix the 404 error
@app.get("/")
async def root():
    return {"message": "Stock Data API is running!", "status": "healthy"}

# Endpoints
@app.get("/ping")
async def ping():
    return {"message": "pong"}

@app.post("/populate-companies")
async def populate_companies(db: Session = Depends(get_db)):
    try:
        populate_companies_db(db)
        count = db.query(Company).count()
        return {"message": f"Companies populated: {count}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/companies")
async def get_companies(db: Session = Depends(get_db)):
    try:
        companies = db.query(Company).all()
        if not companies:
            print("No companies found, populating...")
            populate_companies_db(db)
            companies = db.query(Company).all()
        
        result = [{"ticker": c.ticker, "name": c.name} for c in companies]
        print(f"Returning {len(result)} companies")
        return result
    except Exception as e:
        print(f"Error getting companies from DB: {e}")
        return await get_companies_fallback()

@app.get("/historical/{ticker}")
async def get_historical(ticker: str, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    try:
        print(f"Getting historical data for {ticker}...")
        
        # Find company in database
        company = db.query(Company).filter(Company.ticker == ticker).first()
        if not company:
            print(f"Company {ticker} not found in database")
            raise HTTPException(status_code=404, detail=f"{ticker} not found in companies")
        
        # Check for existing historical data
        existing_data = db.query(HistoricalPrice).filter(
            HistoricalPrice.company_id == company.id
        ).order_by(HistoricalPrice.date.desc()).all()
        
        print(f"Found {len(existing_data)} existing records for {ticker}")
        
        # If we have data, use it
        if existing_data:
            # Check if data is recent (within last 7 days)
            latest_date = existing_data[0].date
            days_old = (datetime.now().date() - latest_date).days
            
            if days_old <= 7:
                print(f"Using existing data for {ticker} (last update: {latest_date})")
                result = [{
                    "date": d.date.strftime("%Y-%m-%d"), 
                    "open": d.open_price, 
                    "high": d.high_price, 
                    "low": d.low_price, 
                    "close": d.close_price, 
                    "volume": d.volume
                } for d in existing_data]
                return {"ticker": ticker, "historical_data": result}
            else:
                print(f"Data is {days_old} days old, will try to refresh...")
        
        # Only try to populate if no data exists OR data is very old
        if not existing_data or days_old > 7:
            try:
                print(f"Attempting to populate fresh data for {ticker}...")
                populate_historical_data(db, ticker)
                
                # Try to get the newly populated data
                fresh_data = db.query(HistoricalPrice).filter(
                    HistoricalPrice.company_id == company.id
                ).order_by(HistoricalPrice.date.desc()).all()
                
                if fresh_data:
                    print(f"Successfully got fresh data for {ticker}")
                    result = [{
                        "date": d.date.strftime("%Y-%m-%d"), 
                        "open": d.open_price, 
                        "high": d.high_price, 
                        "low": d.low_price, 
                        "close": d.close_price, 
                        "volume": d.volume
                    } for d in fresh_data]
                    return {"ticker": ticker, "historical_data": result}
                
            except Exception as populate_error:
                print(f"Failed to populate fresh data: {populate_error}")
                
                # If we have old data, use it as fallback
                if existing_data:
                    print(f"Using old data as fallback for {ticker}")
                    result = [{
                        "date": d.date.strftime("%Y-%m-%d"), 
                        "open": d.open_price, 
                        "high": d.high_price, 
                        "low": d.low_price, 
                        "close": d.close_price, 
                        "volume": d.volume
                    } for d in existing_data]
                    return {"ticker": ticker, "historical_data": result}
        
        # If all else fails, use API fallback
        print(f"Using API fallback for {ticker}")
        return await get_historical_fallback(ticker, start_date, end_date)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_historical for {ticker}: {e}")
        # Last resort: try API fallback
        try:
            return await get_historical_fallback(ticker, start_date, end_date)
        except:
            raise HTTPException(status_code=500, detail=f"Could not get data for {ticker}")

@app.get("/db-status")
async def get_db_status(db: Session = Depends(get_db)):
    try:
        companies_count = db.query(Company).count()
        historical_count = db.query(HistoricalPrice).count()
        
        # Get some sample data
        sample_companies = db.query(Company).limit(5).all()
        sample_tickers = [c.ticker for c in sample_companies]
        
        return {
            "status": "connected",
            "companies": companies_count,
            "historical_records": historical_count,
            "sample_tickers": sample_tickers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Debug endpoint to check specific ticker
@app.get("/debug/{ticker}")
async def debug_ticker(ticker: str, db: Session = Depends(get_db)):
    try:
        company = db.query(Company).filter(Company.ticker == ticker).first()
        if not company:
            return {"error": f"Company {ticker} not found"}
        
        historical_count = db.query(HistoricalPrice).filter(
            HistoricalPrice.company_id == company.id
        ).count()
        
        latest_record = db.query(HistoricalPrice).filter(
            HistoricalPrice.company_id == company.id
        ).order_by(HistoricalPrice.date.desc()).first()
        
        return {
            "ticker": ticker,
            "company_id": company.id,
            "company_name": company.name,
            "historical_records": historical_count,
            "latest_date": latest_record.date.strftime("%Y-%m-%d") if latest_record else None,
            "latest_close": latest_record.close_price if latest_record else None
        }
    except Exception as e:
        return {"error": str(e)}