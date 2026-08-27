"""Controladores (regras de negócio) para as entidades Categoria e Evento."""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.rotina_model import Categoria, Evento, sanitizar


class CategoriaController:
    """Operações de crud para categorias."""
    @staticmethod
    def criar(db: Session, dados: dict) -> Categoria:
        categoria = Categoria(
            nome=sanitizar(dados["nome"]),
            cor=dados.get("cor", "#6366f1"),
            icone=dados.get("icone", "calendar")
        )
        db.add(categoria)
        db.commit()
        db.refresh(categoria)
        return categoria

    @staticmethod
    def listar(db: Session):
        return db.query(Categoria).order_by(Categoria.nome).all()

    @staticmethod
    def buscar_por_id(db: Session, categoria_id: int):
        return db.query(Categoria).filter(Categoria.id == categoria_id).first()

    @staticmethod
    def atualizar(db: Session, categoria_id: int, dados: dict):
        categoria = CategoriaController.buscar_por_id(db, categoria_id)
        if not categoria:
            return None
        if "nome" in dados:
            categoria.nome = sanitizar(dados["nome"])
        if "cor" in dados:
            categoria.cor = dados["cor"]
        if "icone" in dados:
            categoria.icone = dados["icone"]
        db.commit()
        db.refresh(categoria)
        return categoria

    @staticmethod
    def deletar(db: Session, categoria_id: int):
        categoria = CategoriaController.buscar_por_id(db, categoria_id)
        if not categoria:
            return False
        db.delete(categoria)
        db.commit()
        return True


class EventoController:
    """Operações de crud e consultas para eventos/rotinas."""
    @staticmethod
    def criar(db: Session, dados: dict) -> Evento:
        evento = Evento(
            titulo=sanitizar(dados["titulo"]),
            descricao=sanitizar(dados.get("descricao")) if dados.get("descricao") else None,
            categoria_id=dados["categoria_id"],
            data_inicio=dados["data_inicio"],
            data_fim=dados.get("data_fim"),
            convidados=dados.get("convidados"),
            cor_personalizada=dados.get("cor_personalizada"),
            lembrete_minutos=dados.get("lembrete_minutos", 0),
            alarme_sonoro=dados.get("alarme_sonoro"),
            recorrencia=dados.get("recorrencia", "unico")
        )
        db.add(evento)
        db.commit()
        db.refresh(evento)
        return evento

    @staticmethod
    def listar(db: Session, data_inicio: datetime = None, data_fim: datetime = None):
        query = (
            db.query(Evento, Categoria)
            .join(Categoria, Evento.categoria_id == Categoria.id)
            .filter(Evento.categoria_id == Categoria.id)
        )
        if data_inicio:
            query = query.filter(Evento.data_inicio >= data_inicio)
        if data_fim:
            query = query.filter(Evento.data_inicio <= data_fim)
        return query.order_by(Evento.data_inicio).all()

    @staticmethod
    def listar_por_dia(db: Session, data: datetime):
        inicio = data.replace(hour=0, minute=0, second=0, microsecond=0)
        fim = inicio + timedelta(days=1)
        resultados = (
            db.query(Evento, Categoria)
            .join(Categoria, Evento.categoria_id == Categoria.id)
            .filter(Evento.data_inicio >= inicio, Evento.data_inicio < fim)
            .order_by(Evento.data_inicio)
            .all()
        )
        eventos = []
        for evento, categoria in resultados:
            evento_dict = {
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
            }
            eventos.append(evento_dict)
        return eventos

    @staticmethod
    def buscar_por_id(db: Session, evento_id: int):
        resultado = (
            db.query(Evento, Categoria)
            .join(Categoria, Evento.categoria_id == Categoria.id)
            .filter(Evento.id == evento_id)
            .first()
        )
        if not resultado:
            return None
        evento, categoria = resultado
        return {
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
        }

    @staticmethod
    def atualizar(db: Session, evento_id: int, dados: dict):
        evento = db.query(Evento).filter(Evento.id == evento_id).first()
        if not evento:
            return None
        for chave, valor in dados.items():
            if valor is not None:
                if chave == "titulo":
                    setattr(evento, chave, sanitizar(valor))
                elif chave in ("descricao", "convidados"):
                    setattr(evento, chave, sanitizar(valor) if valor else None)
                else:
                    setattr(evento, chave, valor)
        db.commit()
        db.refresh(evento)
        return EventoController.buscar_por_id(db, evento_id)

    @staticmethod
    def deletar(db: Session, evento_id: int):
        evento = db.query(Evento).filter(Evento.id == evento_id).first()
        if not evento:
            return False
        db.delete(evento)
        db.commit()
        return True
