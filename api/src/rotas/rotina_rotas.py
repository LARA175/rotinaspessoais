"""Definição das rotas (endpoints) da API para categorias e eventos."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from ..config.database import obter_sessao, engine, Base
from ..models.rotina_model import Categoria, Evento
from ..controllers.rotina_controller import CategoriaController, EventoController
from ..views.rotina_views import (
    CategoriaCreate, CategoriaResponse, EventoCreate, EventoUpdate, EventoResponse
)

router = APIRouter()

@router.on_event("startup")
def criar_tabelas():
    """Cria as tabelas e insere as categorias padrão ao iniciar a aplicação."""
    Base.metadata.create_all(bind=engine)
    db = next(obter_sessao())
    categorias_padrao = [
        {"nome": "Estudantil", "cor": "#3b82f6", "icone": "graduation-cap"},
        {"nome": "Serviços Domésticos", "cor": "#ec4899", "icone": "home"},
        {"nome": "Trabalho", "cor": "#10b981", "icone": "briefcase"},
    ]
    for cat in categorias_padrao:
        if not db.query(Categoria).filter(Categoria.nome == cat["nome"]).first():
            nova = Categoria(nome=cat["nome"], cor=cat["cor"], icone=cat["icone"])
            db.add(nova)
    db.commit()
    db.close()


@router.get("/categorias", response_model=list[CategoriaResponse])
def listar_categorias(db: Session = Depends(obter_sessao)):
    return CategoriaController.listar(db)

@router.post("/categorias", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def criar_categoria(dados: CategoriaCreate, db: Session = Depends(obter_sessao)):
    return CategoriaController.criar(db, dados.model_dump())

@router.get("/categorias/{categoria_id}", response_model=CategoriaResponse)
def buscar_categoria(categoria_id: int, db: Session = Depends(obter_sessao)):
    categoria = CategoriaController.buscar_por_id(db, categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return categoria

@router.put("/categorias/{categoria_id}", response_model=CategoriaResponse)
def atualizar_categoria(categoria_id: int, dados: CategoriaCreate, db: Session = Depends(obter_sessao)):
    categoria = CategoriaController.atualizar(db, categoria_id, dados.model_dump())
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return categoria

@router.delete("/categorias/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_categoria(categoria_id: int, db: Session = Depends(obter_sessao)):
    sucesso = CategoriaController.deletar(db, categoria_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")


@router.get("/eventos", response_model=list[EventoResponse])
def listar_eventos(
    data_inicio: Optional[str] = None,
    data_fim: Optional[str] = None,
    db: Session = Depends(obter_sessao)
):
    inicio_dt = None
    fim_dt = None
    if data_inicio:
        inicio_dt = datetime.fromisoformat(data_inicio)
    if data_fim:
        fim_dt = datetime.fromisoformat(data_fim)
    resultados = EventoController.listar(db, inicio_dt, fim_dt)
    eventos = []
    for evento, categoria in resultados:
        eventos.append({
            "id": evento.id,
            "titulo": evento.titulo,
            "descricao": evento.descricao,
            "categoria_id": evento.categoria_id,
            "categoria_nome": categoria.nome,
            "categoria_cor": categoria.cor,
            "data_inicio": evento.data_inicio,
            "data_fim": evento.data_fim,
            "convidados": evento.convidados,
            "cor_personalizada": evento.cor_personalizada,
            "lembrete_minutos": evento.lembrete_minutos,
            "alarme_sonoro": evento.alarme_sonoro,
            "recorrencia": evento.recorrencia,
            "data_criacao": evento.data_criacao,
        })
    return eventos

@router.post("/eventos", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
def criar_evento(dados: EventoCreate, db: Session = Depends(obter_sessao)):
    categoria = CategoriaController.buscar_por_id(db, dados.categoria_id)
    if not categoria:
        raise HTTPException(status_code=400, detail="Categoria inválida")
    evento = EventoController.criar(db, dados.model_dump())
    return EventoController.buscar_por_id(db, evento.id)

@router.get("/eventos/dia/{data}", response_model=list[dict])
def listar_eventos_dia(data: str, db: Session = Depends(obter_sessao)):
    try:
        # Normaliza o sufixo 'Z' (UTC) aceito pelo front-end para o formato ISO do Python
        data_dt = datetime.fromisoformat(data.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de data inválido")
    return EventoController.listar_por_dia(db, data_dt)

@router.get("/eventos/{evento_id}", response_model=EventoResponse)
def buscar_evento(evento_id: int, db: Session = Depends(obter_sessao)):
    evento = EventoController.buscar_por_id(db, evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return evento

@router.put("/eventos/{evento_id}", response_model=EventoResponse)
def atualizar_evento(evento_id: int, dados: EventoUpdate, db: Session = Depends(obter_sessao)):
    evento = EventoController.atualizar(db, evento_id, dados.model_dump(exclude_unset=True))
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return evento

@router.delete("/eventos/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_evento(evento_id: int, db: Session = Depends(obter_sessao)):
    sucesso = EventoController.deletar(db, evento_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return None
