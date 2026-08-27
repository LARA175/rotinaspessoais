"""Configuração de conexão com o banco de dados (SQLAlchemy + SQLite)."""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Caminho para o arquivo .env localizado na raiz da pasta da API
caminho_env = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=caminho_env)

# Lê o caminho do banco a partir da variável de ambiente CAMINHO_BANCO
CAMINHO_BANCO = os.getenv("CAMINHO_BANCO", "db/rotinas.db")

caminho_base = Path(__file__).resolve().parent.parent.parent
caminho_db = os.path.join(str(caminho_base), CAMINHO_BANCO)
os.makedirs(os.path.dirname(caminho_db), exist_ok=True)

# String de conexão do SQLite
SQLITE_URL = f"sqlite:///{caminho_db}"

# Engine e fábrica de sessões do SQLAlchemy
engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base para os modelos declarativos
Base = declarative_base()

def obter_sessao():
    """Gera uma sessão do banco para ser usada como dependência (injeção)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
