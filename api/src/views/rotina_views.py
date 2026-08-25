from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class CategoriaCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=80)
    cor: Optional[str] = Field(default="#6366f1")
    icone: Optional[str] = Field(default="calendar")

class CategoriaResponse(BaseModel):
    id: int
    nome: str
    cor: str
    icone: str
    data_criacao: datetime

    class Config:
        from_attributes = True

class EventoCreate(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=200)
    descricao: Optional[str] = Field(default=None, max_length=1000)
    categoria_id: int
    data_inicio: datetime
    data_fim: Optional[datetime] = None
    convidados: Optional[str] = None
    cor_personalizada: Optional[str] = None
    lembrete_minutos: Optional[int] = Field(default=0)
    alarme_sonoro: Optional[str] = None
    recorrencia: Optional[str] = Field(default="unico")

class EventoUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    categoria_id: Optional[int] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    convidados: Optional[str] = None
    cor_personalizada: Optional[str] = None
    lembrete_minutos: Optional[int] = None
    alarme_sonoro: Optional[str] = None
    recorrencia: Optional[str] = None

class EventoResponse(BaseModel):
    id: int
    titulo: str
    descricao: Optional[str]
    categoria_id: int
    categoria_nome: Optional[str] = None
    categoria_cor: Optional[str] = None
    data_inicio: datetime
    data_fim: Optional[datetime] = None
    convidados: Optional[str]
    cor_personalizada: Optional[str]
    lembrete_minutos: int
    alarme_sonoro: Optional[str]
    recorrencia: str
    data_criacao: datetime

    class Config:
        from_attributes = True
