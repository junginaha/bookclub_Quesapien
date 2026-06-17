"""
19호실 출판OS — FastAPI 백엔드
실행: uvicorn backend.main:app --reload --port 8001
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from backend.database import init_db
from backend.routers import books, manuscripts, exports, layouts, ai_tools


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    # Ensure output/upload dirs exist
    for d in ["./uploads", "./outputs"]:
        Path(d).mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="19호실 출판OS API",
    description="1인 출판사를 위한 AI 기반 출판 자동화 플랫폼",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static output files
outputs_dir = Path("./outputs")
outputs_dir.mkdir(exist_ok=True)
app.mount("/files", StaticFiles(directory=str(outputs_dir)), name="files")

# Routers
app.include_router(books.router, prefix="/api")
app.include_router(manuscripts.router, prefix="/api")
app.include_router(exports.router, prefix="/api")
app.include_router(layouts.router, prefix="/api")
app.include_router(ai_tools.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "19호실 출판OS"}
