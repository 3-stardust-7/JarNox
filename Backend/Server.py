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
            populate_companies_db(db)
            companies = db.query(Company).all()
        return [{"ticker": c.ticker, "name": c.name} for c in companies]
    except Exception:
        return await get_companies_fallback()

@app.get("/historical/{ticker}")
async def get_historical(ticker: str, start_date: str = None, end_date: str = None, db: Session = Depends(get_db)):
    try:
        company = db.query(Company).filter(Company.ticker == ticker).first()
        if not company:
            raise HTTPException(status_code=404, detail=f"{ticker} not found")
        data = db.query(HistoricalPrice).filter(HistoricalPrice.company_id == company.id).order_by(HistoricalPrice.date.desc()).all()
        if not data:
            populate_historical_data(db, ticker)
            data = db.query(HistoricalPrice).filter(HistoricalPrice.company_id == company.id).order_by(HistoricalPrice.date.desc()).all()
        result = [{"date": d.date.strftime("%Y-%m-%d"), "open": d.open_price, "high": d.high_price, "low": d.low_price, "close": d.close_price, "volume": d.volume} for d in data]
        return {"ticker": ticker, "historical_data": result}
    except Exception:
        return await get_historical_fallback(ticker, start_date, end_date)

@app.get("/db-status")
async def get_db_status(db: Session = Depends(get_db)):
    try:
        return {
            "status": "connected",
            "companies": db.query(Company).count(),
            "historical_records": db.query(HistoricalPrice).count()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
