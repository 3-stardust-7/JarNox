# Backend/db.py
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from fastapi import HTTPException
import os
from dotenv import load_dotenv

load_dotenv()  

# Database setup with Railway PostgreSQL handling
DATABASE_URL = os.getenv("DATABASE_URL")

# Railway provides DATABASE_URL, but SQLAlchemy 2.0+ needs postgresql:// not postgres://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Fallback for local development
if not DATABASE_URL:
    DATABASE_URL = "postgresql://user:password@localhost/dbname"

print(f"Connecting to database: {DATABASE_URL[:20]}...")  # Don't log full URL for security

# Create engine with connection pool settings for Railway
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False  # Set to True for debugging SQL queries
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), unique=True, index=True)  # Added length constraint
    name = Column(String(255))  # Added length constraint
    historical_prices = relationship("HistoricalPrice", back_populates="company")

class HistoricalPrice(Base):
    __tablename__ = "historical_prices"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    date = Column(Date, index=True)  # Added index for faster queries
    open_price = Column(Float)
    high_price = Column(Float)
    low_price = Column(Float)
    close_price = Column(Float)
    volume = Column(Float)
    company = relationship("Company", back_populates="historical_prices")

# Create tables with error handling
try:
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print(" Database tables created successfully")
except Exception as e:
    print(f" Error creating tables: {e}")

# Helper functions
def populate_companies_db(db: Session):
    """Populate DB with first 10 S&P 500 companies"""
    try:
        print("Checking if companies already exist...")
        if db.query(Company).count() > 0:
            print("Companies already populated")
            return

        print("Fetching companies from Wikipedia...")
        url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
        table = pd.read_html(url)[0]

        companies_added = 0
        for symbol in table["Symbol"].unique()[:20]:  # Get first 20 companies
            try:
                print(f"Processing {symbol}...")
                
                # Check if company already exists
                existing = db.query(Company).filter(Company.ticker == symbol).first()
                if existing:
                    continue
                
                # Try to get company name with rate limiting protection
                try:
                    import time
                    time.sleep(0.1)  # Small delay to avoid rate limiting
                    ticker_obj = yf.Ticker(symbol)
                    info = ticker_obj.info
                    name = info.get("longName", symbol)
                    if not name or len(name) > 255:  # Ensure name fits in database
                        name = symbol
                except Exception as yf_error:
                    print(f"  yfinance failed for {symbol}: {yf_error}")
                    name = symbol
                    if "429" in str(yf_error):  # Rate limited
                        print("Rate limited, using symbol as name")
                        time.sleep(1)  # Longer delay if rate limited

                # Create and save company
                company = Company(ticker=symbol, name=name)
                db.add(company)
                db.commit()
                db.refresh(company)
                companies_added += 1
                print(f" Added {symbol}: {name}")

            except Exception as e:
                print(f" Error processing {symbol}: {e}")
                db.rollback()
                continue

        print(f"Successfully added {companies_added} companies to database")

    except Exception as e:
        print(f" Error in populate_companies_db: {e}")
        db.rollback()
        raise e

def populate_historical_data(db: Session, ticker: str, days: int = 30):
    """Populate historical data for a specific ticker"""
    try:
        print(f"Populating historical data for {ticker}...")
        
        company = db.query(Company).filter(Company.ticker == ticker).first()
        if not company:
            print(f" Company {ticker} not found in database")
            raise ValueError(f"Company {ticker} not found")

        # Check if data already exists
        existing_count = db.query(HistoricalPrice).filter(HistoricalPrice.company_id == company.id).count()
        if existing_count > 0:
            print(f"Historical data already exists for {ticker} ({existing_count} records)")
            return

        # Fetch from yfinance
        ticker_obj = yf.Ticker(ticker)
        end = datetime.today()
        start = end - timedelta(days=days)

        print(f"Fetching data from {start.strftime('%Y-%m-%d')} to {end.strftime('%Y-%m-%d')}")
        hist = ticker_obj.history(start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"))
        
        if hist.empty:
            print(f" No historical data found for {ticker}")
            return

        # Save to database
        hist = hist.reset_index()
        records_added = 0
        
        for _, row in hist.iterrows():
            try:
                record = HistoricalPrice(
                    company_id=company.id,
                    date=row["Date"].date(),
                    open_price=float(row["Open"]),
                    high_price=float(row["High"]),
                    low_price=float(row["Low"]),
                    close_price=float(row["Close"]),
                    volume=float(row["Volume"])
                )
                db.add(record)
                records_added += 1
            except Exception as row_error:
                print(f"Error processing row: {row_error}")
                continue
        
        db.commit()
        print(f" Added {records_added} historical records for {ticker}")
        
    except Exception as e:
        print(f" Error in populate_historical_data for {ticker}: {e}")
        db.rollback()
        raise e

# Fallback functions
async def get_companies_fallback():
    """Fallback when database is not available"""
    try:
        print("Using companies fallback (no database)")
        url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
        table = pd.read_html(url)[0]
        companies = []
        
        for symbol in table["Symbol"].unique()[:10]:
            try:
                ticker_obj = yf.Ticker(symbol)
                info = ticker_obj.info
                name = info.get("longName", symbol)
            except Exception:
                name = symbol
            companies.append({"ticker": symbol, "name": name})
            
        return companies
    except Exception as e:
        print(f" Error in companies fallback: {e}")
        # Ultimate fallback
        return [
            {"ticker": "AAPL", "name": "Apple Inc."},
            {"ticker": "MSFT", "name": "Microsoft Corporation"},
            {"ticker": "GOOGL", "name": "Alphabet Inc."},
            {"ticker": "AMZN", "name": "Amazon.com Inc."},
            {"ticker": "TSLA", "name": "Tesla Inc."},
            {"ticker": "MMM", "name": "3M Company"}
        ]

async def get_historical_fallback(ticker: str, start_date: str = None, end_date: str = None):
    """Fallback when database is not available"""
    try:
        print(f"Using historical fallback for {ticker} (no database)")
        ticker_obj = yf.Ticker(ticker)
        
        if not start_date:
            end = datetime.today()
            start = end - timedelta(days=30)
            start_date = start.strftime("%Y-%m-%d")
            end_date = end.strftime("%Y-%m-%d")
            
        hist = ticker_obj.history(start=start_date, end=end_date)
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {ticker}")
            
        hist = hist.reset_index().head(30)  # Limit to prevent timeout
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
            
        return {"ticker": ticker.upper(), "historical_data": data}
    except Exception as e:
        print(f" Error in historical fallback for {ticker}: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching data for {ticker}: {str(e)}")

# Test database connection
def test_db_connection():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            print(" Database connection successful")
            return True
    except Exception as e:
        print(f" Database connection failed: {e}")
        return False

# Run connection test on import
if __name__ == "__main__":
    test_db_connection()