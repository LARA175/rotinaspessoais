import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

caminho_env = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=caminho_env)

DB_PATH = os.getenv("DB_PATH", "db/rotinas.db")

caminho_base = Path(__file__).resolve().parent.parent.parent
caminho_db = os.path.join(str(caminho_base), DB_PATH)
os.makedirs(os.path.dirname(caminho_db), exist_ok=True)

SQLITE_URL = f"sqlite:///{caminho_db}"

engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def obter_sessao():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
