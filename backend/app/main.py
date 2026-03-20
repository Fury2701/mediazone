from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.core.database import engine, Base
from app.models import news as _news_model  # noqa — register model for create_all
from app.routers import auth, users, forum, stats, news

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Media Zone RP API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)

app.include_router(auth.router,   prefix="/api/auth",   tags=["auth"])
app.include_router(users.router,  prefix="/api/users",  tags=["users"])
app.include_router(forum.router,  prefix="/api/forum",  tags=["forum"])
app.include_router(stats.router,  prefix="/api/stats",  tags=["stats"])
app.include_router(news.router,   prefix="/api/news",   tags=["news"])

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "mediazone-rp"}

STATIC = "/app/static"
if os.path.exists(STATIC):
    app.mount("/assets", StaticFiles(directory=f"{STATIC}/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        return FileResponse(f"{STATIC}/index.html")
