from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


def _default_database_url() -> str:
    project_root = Path(__file__).resolve().parents[3]
    database_path = project_root / "database" / "buildlog.sqlite3"
    database_path.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite+pysqlite:///{database_path.as_posix()}"


def get_database_url() -> str:
    return get_settings().database_url or _default_database_url()


def create_database_engine(database_url: str | None = None) -> Engine:
    url = database_url or get_database_url()
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=connect_args, pool_pre_ping=True)


engine = create_database_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session
