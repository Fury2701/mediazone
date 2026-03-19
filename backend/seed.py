"""
Seed default categories into the database.
Retries until MySQL is ready — safe to run at container startup.
"""
import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

MAX_RETRIES = 30
RETRY_DELAY = 2  # seconds


def wait_for_db():
    from sqlalchemy import text
    from app.core.database import engine
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"✓ MySQL ready (attempt {attempt})")
            return
        except Exception as e:
            print(f"  Waiting for MySQL [{attempt}/{MAX_RETRIES}]: {e}")
            time.sleep(RETRY_DELAY)
    print("✗ MySQL not available — giving up")
    sys.exit(1)


def seed():
    from app.core.database import SessionLocal, engine, Base
    from app.models.user import User           # noqa — registers model
    from app.models.forum import Category, Post, Reply, Character  # noqa

    Base.metadata.create_all(bind=engine)

    # Add new columns to existing tables if they don't exist yet
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE posts ADD COLUMN video_url VARCHAR(512)"))
            conn.commit()
            print("✓ Migration: posts.video_url added")
        except Exception:
            pass  # column already exists

    CATEGORIES = [
        ("announcements", "Оголошення",        "Офіційні новини та оновлення сервера", "📢", 1),
        ("roleplay",      "Roleplay",           "Обговорення ігрових ситуацій",          "🎭", 2),
        ("complaints",    "Скарги та апеляції", "Подати скаргу або оскаржити рішення",   "📝", 3),
        ("factions",      "Заявки у фракції",   "Вступ до поліції, мафії та організацій","💼", 4),
        ("suggestions",   "Пропозиції",         "Ідеї щодо покращення сервера",          "🛠️", 5),
        ("offtopic",      "Флудилка",           "Спілкування поза грою, меми, відео",    "💬", 6),
    ]

    db = SessionLocal()
    try:
        added = 0
        for slug, name, desc, icon, order in CATEGORIES:
            if not db.query(Category).filter(Category.slug == slug).first():
                db.add(Category(slug=slug, name=name, description=desc, icon=icon, order=order))
                added += 1
        db.commit()
        print(f"✓ Seed done — {added} categories added")
    except Exception as e:
        db.rollback()
        print(f"✗ Seed failed: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    wait_for_db()
    seed()
