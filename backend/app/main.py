from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from app.routers import health, data, simulation


load_dotenv()

APP_NAME = "Crypto Quant API"
APP_PORT = 8000


app = FastAPI(
    title=APP_NAME,
    description="API backend for Crypto Quant Simulator — supports multiple financial models.",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(data.router)
app.include_router(simulation.router)


@app.get("/")
def root():
    return "Got you! Welcome to the Crypto Quant"
