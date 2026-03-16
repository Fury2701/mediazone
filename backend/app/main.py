from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.core.database import engine, Base
from app.routers import auth, users, forum, stats

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Media Zone RP API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,   prefix="/api/auth",   tags=["auth"])
app.include_router(users.router,  prefix="/api/users",  tags=["users"])
app.include_router(forum.router,  prefix="/api/forum",  tags=["forum"])
app.include_router(stats.router,  prefix="/api/stats",  tags=["stats"])

# Serve frontend static files
static_dir = "/app/static"
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=f"{static_dir}/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        index = f"{static_dir}/index.html"
        return FileResponse(index)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "mediazone-rp"}
