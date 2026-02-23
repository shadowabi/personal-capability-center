"""
FastAPI Main Application for AI Memory Dashboard
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 从环境变量读取配置
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# 创建 FastAPI 应用
app = FastAPI(
    title="AI Memory Dashboard API",
    description="API for managing and searching AI conversation memory",
    version="1.0.0"
)

# 配置 CORS
logger.info(f"CORS Origins: {CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    logger.info(f"Request origin: {request.headers.get('origin')}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


# 导入路由
from routers import conversations, search, statistics, summary

# 注册路由
app.include_router(conversations.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(statistics.router, prefix="/api")
app.include_router(summary.router, prefix="/api", tags=["summary"])


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": "AI Memory Dashboard API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=API_HOST,
        port=API_PORT,
        reload=True
    )
