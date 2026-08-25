import os
import sys
from pathlib import Path

caminho_api = Path(__file__).resolve().parent
sys.path.insert(0, str(caminho_api))

from dotenv import load_dotenv
load_dotenv(dotenv_path=caminho_api / '.env')

from src.config.database import engine, Base
from src.models.rotina_model import Categoria, Evento

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)

    from src.config.database import SessionLocal
    db = SessionLocal()
    categorias_padrao = [
        {"nome": "Estudantil", "cor": "#3b82f6", "icone": "graduation-cap"},
        {"nome": "Serviços Domésticos", "cor": "#ec4899", "icone": "home"},
        {"nome": "Trabalho", "cor": "#10b981", "icone": "briefcase"},
    ]
    for cat in categorias_padrao:
        if not db.query(Categoria).filter(Categoria.nome == cat["nome"]).first():
            db.add(Categoria(nome=cat["nome"], cor=cat["cor"], icone=cat["icone"]))
    db.commit()
    db.close()

    import uvicorn
    porta = int(os.getenv("PORT", 3000))
    print(f"Servidor Python (FastAPI + Uvicorn) rodando na porta {porta}")
    uvicorn.run("src.app:app", host="0.0.0.0", port=porta, reload=True)
