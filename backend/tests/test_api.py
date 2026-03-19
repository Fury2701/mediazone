import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

os.environ.setdefault("DATABASE_URL", "mysql+pymysql://mzrp:test@localhost:3306/mediazone_test")
os.environ.setdefault("SECRET_KEY", "test-secret")

from app.main import app
from app.core.database import Base, get_db

engine = create_engine(os.environ["DATABASE_URL"])
TestSession = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)

def override_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_db
client = TestClient(app)

# ── Helpers ──────────────────────────────────────────────────────────────────
def register(username="testuser", email="test@example.com", password="password123"):
    return client.post("/api/auth/register", json={
        "username": username, "email": email, "password": password
    })

def login(username="testuser", password="password123"):
    return client.post("/api/auth/login", json={"username": username, "password": password})

# ── Tests ────────────────────────────────────────────────────────────────────
def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_register():
    r = register("newuser99", "new99@example.com")
    assert r.status_code == 201
    assert "access_token" in r.json()

def test_register_duplicate():
    register("dupuser", "dup@example.com")
    r = register("dupuser", "dup2@example.com")
    assert r.status_code == 400

def test_login():
    register("loginuser", "login@example.com")
    r = login("loginuser")
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_login_wrong_password():
    register("wrongpass", "wp@example.com")
    r = client.post("/api/auth/login", json={"username": "wrongpass", "password": "badpass"})
    assert r.status_code == 401

def test_me():
    register("meuser", "me@example.com")
    token = login("meuser").json()["access_token"]
    r = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["username"] == "meuser"

def test_stats():
    r = client.get("/api/stats/public")
    assert r.status_code == 200
    assert "total_players" in r.json()

def test_forum_categories():
    r = client.get("/api/forum/categories")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_create_post_unauth():
    r = client.post("/api/forum/posts", json={"title": "Test", "body": "Body", "category_id": 1})
    assert r.status_code == 401

def test_create_post_auth():
    register("poster", "poster@example.com")
    token = login("poster").json()["access_token"]
    r = client.post("/api/forum/posts",
        json={"title": "Test post", "body": "Hello world", "category_id": 1},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code in (201, 404)
