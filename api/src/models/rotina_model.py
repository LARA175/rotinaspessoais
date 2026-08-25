from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..config.database import Base
import html

def sanitizar(texto: str) -> str:
    if not texto:
        return ""
    return html.escape(str(texto).strip())

class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(80), nullable=False, unique=True)
    cor = Column(String(7), default="#6366f1")
    icone = Column(String(50), default="calendar")
    data_criacao = Column(DateTime, default=datetime.now)

    eventos = relationship("Evento", back_populates="categoria", cascade="all, delete-orphan")

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text, default=None)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)
    data_inicio = Column(DateTime, nullable=False)
    data_fim = Column(DateTime, default=None)
    convidados = Column(Text, default=None)
    cor_personalizada = Column(String(7), default=None)
    lembrete_minutos = Column(Integer, default=0)
    alarme_sonoro = Column(String(100), default=None)
    recorrencia = Column(String(20), default="unico")
    data_criacao = Column(DateTime, default=datetime.now)

    categoria = relationship("Categoria", back_populates="eventos")
