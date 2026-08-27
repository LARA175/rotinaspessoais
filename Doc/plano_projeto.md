# Plano de Projeto - Rotinas Pessoais

## Contexto do Projeto Acadêmico
- **Alunos:** João Eduardo Sousa Ferreira e Lara Ohana Rodrigues Galvão
- **Série/Turma:** 3º Ano B
- **Orientador:** Prof. Carlos David Rocha de Souza
- **Instituição:** Instituto Federal de Educação, Ciência e Tecnologia de Mato Grosso (IFMT) - Campus Barra do Garças
- **Disciplina:** Desenvolvimento Web

## Arquitetura MVC

### Backend (Python - FastAPI + SQLAlchemy)
- **Models:** `src/models/rotina_model.py` - Categoria e Evento
- **Views:** `src/views/rotina_views.py` - Schemas Pydantic
- **Controllers:** `src/controllers/rotina_controller.py` - Regras de negócio
- **Routes:** `src/rotas/rotina_rotas.py` - Endpoints REST
- **Config:** `src/config/database.py` - Conexão SQLAlchemy
- **App:** `src/app.py` - FastAPI com CORS e estáticos

### Frontend (React + Vite + TailwindCSS)
- **Components:** Dashboard, CalendarView, EventoForm, CategoriaManager, AlarmManager
- **Services:** API cliente com Axios
- **Routing:** React Router DOM

## Endpoints da API
- `GET /api/saude` - Verificação de saúde
- `GET/POST /api/categorias` - CRUD categorias
- `GET/POST /api/eventos` - CRUD eventos
- `GET /api/eventos/dia/{data}` - Eventos por dia

## Tecnologias
- Backend: FastAPI, SQLAlchemy, SQLite, Uvicorn
- Frontend: React 18, Vite, TailwindCSS, Axios, Date-fns, React Hook Form, React Icons
- Padrão: RESTful API, MVC
