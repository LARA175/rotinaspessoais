"""Aplicação principal FastAPI: configura CORS, rotas da API e servimento do frontend."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
caminho_env = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=caminho_env)

from .rotas.rotina_rotas import router as rotina_router

# Instância da aplicação com metadados em português
app = FastAPI(
    title="API Gerenciamento de Rotinas",
    description="API REST para gerenciamento de rotinas estudantis, serviços domésticos e trabalho.",
    version="1.0.0"
)

# Configuração de CORS com base na origem permitida (ORIGEM_PERMITIDA)
origem_permitida = os.getenv("ORIGEM_PERMITIDA", "*")
origens = [origem_permitida] if origem_permitida != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origens,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas de rotinas sob o prefixo /api
app.include_router(rotina_router, prefix="/api")

@app.get("/api/saude")
def verificar_saude():
    """Endpoint de verificação de saúde da API."""
    return {"sucesso": True, "mensagem": "API de Rotinas funcionando!"}

# Define a pasta de arquivos estáticos (build de produção ou código do frontend)
caminho_dist = Path(__file__).resolve().parent.parent.parent / 'frontend' / 'dist'
caminho_frontend = Path(__file__).resolve().parent.parent.parent / 'frontend'
pasta_estatica = caminho_dist if caminho_dist.exists() else caminho_frontend

if pasta_estatica.exists():
    app.mount("/static", StaticFiles(directory=str(pasta_estatica)), name="static")

@app.get("/{full_path:path}")
async def servir_frontend(request: Request, full_path: str):
    """Serve o frontend (SPA) para qualquer rota que não seja da API."""
    if full_path.startswith("api"):
        return {"erro": "Endpoint não encontrado"}
    caminho_arquivo = pasta_estatica / full_path
    if full_path and caminho_arquivo.is_file():
        return FileResponse(caminho_arquivo)
    index_path = pasta_estatica / "index.html"
    if index_path.is_file():
        return FileResponse(index_path)
    return {"erro": "Página não encontrada"}
