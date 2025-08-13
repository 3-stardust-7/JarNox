# Backend/db.py
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from fastapi import HTTPException

# Database setup
DATABASE_URL = "postgresql://stockuser:keira@localhost/stockdb"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -----------------------
# Models
# -----------------------
class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True)
    name = Column(String)
    historical_prices = relationship("HistoricalPrice", back_populates="company")

class HistoricalPrice(Base):
    __tablename__ = "historical_prices"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    date = Column(Date)
    open_price = Column(Float)
    high_price = Column(Float)
    low_price = Column(Float)
    close_price = Column(Float)
    volume = Column(Float)
    company = relationship("Company", back_populates="historical_prices")

# Create tables if not exist
Base.metadata.create_all(bind=engine)

# -----------------------
# Helper functions
# -----------------------
def populate_companies_db(db: Session):
    """Populate DB with first 10 S&P 500 companies"""
    try:
        if db.query(Company).count() > 0:
            return

        url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
        table = pd.read_html(url)[0]

        for symbol in table["Symbol"].unique()[:10]:
            try:
                ticker_obj = yf.Ticker(symbol)
                name = ticker_obj.info.get("longName", symbol)
            except Exception:
                name = symbol

            company = Company(ticker=symbol, name=name)
            db.add(company)
            db.commit()
            db.refresh(company)

    except Exception as e:
        db.rollback()
        raise e

def populate_historical_data(db: Session, ticker: str, days: int = 30):
    try:
        company = db.query(Company).filter(Company.ticker == ticker).first()
        if not company:
            raise ValueError(f"Company {ticker} not found")

        if db.query(HistoricalPrice).filter(HistoricalPrice.company_id == company.id).count() > 0:
            return

        ticker_obj = yf.Ticker(ticker)
        end = datetime.today()
        start = end - timedelta(days=days)

        hist = ticker_obj.history(start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"))
        if hist.empty:
            return

        hist = hist.reset_index()
        for _, row in hist.iterrows():
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
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

# -----------------------
# Fallback functions
# -----------------------
async def get_companies_fallback():
    try:
        url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
        table = pd.read_html(url)[0]
        companies = []
        for symbol in table["Symbol"].unique()[:10]:
            try:
                ticker_obj = yf.Ticker(symbol)
                name = ticker_obj.info.get("longName", symbol)
            except Exception:
                name = symbol
            companies.append({"ticker": symbol, "name": name})
        return companies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_historical_fallback(ticker: str, start_date: str = None, end_date: str = None):
    try:
        ticker_obj = yf.Ticker(ticker)
        if not start_date:
            end = datetime.today()
            start = end - timedelta(days=30)
            start_date = start.strftime("%Y-%m-%d")
            end_date = end.strftime("%Y-%m-%d")
        hist = ticker_obj.history(start=start_date, end=end_date)
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data for {ticker}")
        hist = hist.reset_index().head(10)
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
        return {"ticker": ticker, "historical_data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
