# Rotinas Pessoais

![Status do Projeto](https://img.shields.io/badge/status-em%20desenvolvimento-orange)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20SQLAlchemy-20F9AD)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB)
![Database](https://img.shields.io/badge/Banco-SQLite-003B55)

> **Sistema Dinâmico de Gerenciamento de Rotinas (IFMT)** — Projeto acadêmico para gerenciamento de rotinas estudantis, serviços domésticos e atividades profissionais, com calendarização estilo Google Calendar e sistema de alarmes sonoros.

---

## 📋 Informações Acadêmicas

- **Projeto:** Sistema Dinâmico de Gerenciamento de Rotinas (IFMT)
- **Autores:** João Eduardo Sousa Ferreira e Lara Ohana Rodrigues Galvão
- **Turma:** 3º Ano B - Ensino Médio Técnico em Informática
- **Orientador:** Prof. Carlos David Rocha de Souza
- **Instituição:** Instituto Federal de Mato Grosso (IFMT) - Campus Barra do Garças
- **Disciplina:** Desenvolvimento Web

---

## 🎯 Visão Geral

O **Rotinas Pessoais** é uma plataforma web dinâmica, moderna e responsiva desenvolvida para o gerenciamento de rotinas do dia a dia. O sistema categoriza as atividades em três domínios:

1. **Estudantil** — Rotinas voltadas ao estudo no IFMT (Ensino Médio Técnico em Informática).
2. **Serviços Domésticos** — Tarefas e organização do lar.
3. **Trabalho** — Estágio, freelas e compromissos profissionais.

A aplicação oferece uma interface semelhante ao Google Calendar, com visualização por dia, semana e mês, além de um sistema robusto de alarmes e notificações que emitem sons no momento exato agendado.

---

## ✨ Funcionalidades

### Backend (API REST)

| Funcionalidade | Endpoint | Descrição |
|---|---|---|
| Health Check | `GET /api/health` | Verifica status da API |
| Listar Categorias | `GET /api/categorias` | Retorna todas as categorias |
| Criar Categoria | `POST /api/categorias` | Cria uma nova categoria |
| Buscar Categoria | `GET /api/categorias/{id}` | Busca categoria por ID |
| Atualizar Categoria | `PUT /api/categorias/{id}` | Atualiza categoria existente |
| Deletar Categoria | `DELETE /api/categorias/{id}` | Remove categoria |
| Listar Eventos | `GET /api/eventos` | Lista eventos (com filtro por data) |
| Criar Evento | `POST /api/eventos` | Cria um novo evento |
| Eventos por Dia | `GET /api/eventos/dia/{data}` | Lista eventos de um dia específico |
| Buscar Evento | `GET /api/eventos/{id}` | Busca evento por ID |
| Atualizar Evento | `PUT /api/eventos/{id}` | Atualiza evento existente |
| Deletar Evento | `DELETE /api/eventos/{id}` | Remove evento |

### Frontend (React)

| Página | Componente | Descrição |
|---|---|---|
| `/` | `Dashboard.jsx` | Visão geral das tarefas do dia, métricas de progresso e atalhos rápidos |
| `/calendario` | `CalendarView.jsx` | Calendário estilo Google Calendar (dia/semana/mês) |
| `/eventos/novo` | `EventoForm.jsx` | Formulário de criação de eventos |
| `/eventos/editar/:id` | `EventoForm.jsx` | Formulário de edição de eventos |
| `/categorias` | `CategoriaManager.jsx` | Gerenciamento de categorias |
| Global | `Header.jsx` | Cabeçalho com navegação e dados acadêmicos |
| Global | `Footer.jsx` | Rodapé com identificação acadêmica do IFMT |
| Global | `AlarmManager.jsx` | Sistema de alarmes sonoros e notificações |

### Recursos Específicos

- **Alarme Sonoro:** Emite som no momento exato agendado (`HH:mm`)
- **Lembrete Configurável:** Notificação X minutos antes do evento (5, 10, 30, 60, 1440 minutos)
- **Recorrência:** Eventos recorrentes (único, diário, semanal, mensal)
- **Categorias Padrão:** Estudantil, Serviços Domésticos, Trabalho
- **Formatação Regional:** Data no formato `dd/mm/yyyy`, hora no formato `HH:mm` (24h), fuso UTC-3

---

## 🏗️ Arquitetura & Tecnologias

### Padrão MVC (Backend)

```
api/
├── src/
│   ├── app.py                          # FastAPI app (rotas, middleware, estáticos)
│   ├── config/
│   │   └── database.py                 # Configuração SQLAlchemy (SQLite)
│   ├── models/
│   │   └── rotina_model.py             # Models: Categoria, Evento
│   ├── views/
│   │   └── rotina_views.py             # Schemas Pydantic (validação)
│   ├── controllers/
│   │   └── rotina_controller.py        # Regras de negócio
│   └── rotas/
│       └── rotina_rotas.py             # Endpoints REST
└── main.py                             # Entry point (Uvicorn)
```

- **Python 3.13** com FastAPI e SQLAlchemy 2.0
- Arquitetura **MVC** (Model-View-Controller) bem definida
- Banco de dados **SQLite 3** via ORM SQLAlchemy
- Validação de dados com **Pydantic 2**
- Server **Uvicorn** (ASGI)

### Frontend

- **React 18** com **Vite** (build rápido)
- **TailwindCSS 3** para styling responsivo
- **Axios** para integração com a API
- **React Hook Form** para validação de formulários
- **React Icons** para UI
- **Date-fns** com locale `pt-BR` para formatação de datas
- **React Router DOM 6** para navegação

---

## 📁 Estrutura de Pastas

```
rotinaspessoais/
├── .gitignore
├── Doc/
│   └── plano_projeto.md
│   └── plano_readme.md
├── api/
│   ├── .env                     [PROTEGIDO]
│   ├── .env.example
│   ├── main.py
│   ├── package.json
│   ├── requirements.txt
│   ├── db/
│   │   └── rotinas.db
│   └── src/
│       ├── app.py
│       ├── config/
│       │   └── database.py
│       ├── controllers/
│       │   └── rotina_controller.py
│       ├── models/
│       │   └── rotina_model.py
│       ├── views/
│       │   └── rotina_views.py
│       └── rotas/
│           └── rotina_rotas.py
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── Header.jsx
        │   ├── Footer.jsx
        │   ├── Dashboard.jsx
        │   ├── CalendarView.jsx
        │   ├── EventoForm.jsx
        │   ├── CategoriaManager.jsx
        │   └── AlarmManager.jsx
        └── services/
            └── api.js
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- **Python 3.10+**
- **Node.js 18+**
- **npm** ou **yarn**

### 1. Clonar o repositório

```bash
git clone https://github.com/LARA175/rotinaspessoais.git
cd rotinaspessoais
```

### 2. Configurar Backend (Python)

```bash
cd api

# Criar ambiente virtual
python -m venv .venv

# Ativar (Linux/Mac)
source .venv/bin/activate

# Ativar (Windows)
.venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Copiar e configurar .env
cp .env.example .env
# Edite o .env com suas configurações
```

### 3. Executar Backend

```bash
cd api
source .venv/bin/activate
python main.py
```

A API estará disponível em `http://localhost:3000`

### 4. Configurar Frontend (React)

```bash
cd frontend
npm install

# Configurar proxy (já configurado em vite.config.js para localhost:3000)
```

### 5. Executar Frontend

```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

---

## 🔐 Boas Práticas de Segurança

### Variáveis de Ambiente

O projeto utiliza um arquivo `.env` para armazenar todas as variáveis de ambiente sensíveis. **Nunca commit esse arquivo ao repositório.** Ele está incluída no `.gitignore`.

**Variáveis necessárias (`api/.env`):**

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta do servidor backend | `3000` |
| `ORIGEM_PERMITIDA` | Origem CORS permitida | `http://localhost:5173` |
| `DB_PATH` | Caminho do banco SQLite | `db/rotinas.db` |
| `ALGORITHM` | Algoritmo JWT | `HS256` |
| `SECRET_KEY` | Chave secreta para tokens | Use `python -c "from secrets import token_hex; print(token_hex(32))"` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiração do token (min) | `60` |
| `DB_ENCRYPTION_KEY` | Chave de criptografia do DB | Use `python -c "from secrets import token_hex; print(token_hex(32))"` |

### Geração de Chaves Seguras

```bash
# Para SECRET_KEY e DB_ENCRYPTION_KEY
python -c "from secrets import token_hex; print(token_hex(32))"
```

### Arquivo `.gitignore`

```
api/.env
api/.venv/
api/db/*.db
frontend/node_modules/
frontend/dist/
```

---

## 📊 Modelo de Dados

### Categoria
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Integer (PK) | ID auto-incremento |
| `nome` | String(80) | Nome da categoria |
| `cor` | String(7) | HEX da cor (ex: #3b82f6) |
| `icone` | String(50) | Nome do ícone |
| `data_criacao` | DateTime | Timestamp de criação |

### Evento
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | Integer (PK) | ID auto-incremento |
| `titulo` | String(200) | Título do evento |
| `descricao` | Text | Descrição detalhada |
| `categoria_id` | Integer (FK) | Referência à categoria |
| `data_inicio` | DateTime | Data/hora de início |
| `data_fim` | DateTime | Data/hora de fim |
| `convidados` | Text | Emails de convidados |
| `cor_personalizada` | String(7) | Cor customizada do evento |
| `lembrete_minutos` | Integer | Lembrete X minutos antes |
| `alarme_sonoro` | String(100) | Arquivo de som do alarme |
| `recorrencia` | String(20) | Tipo de recorrência |
| `data_criacao` | DateTime | Timestamp de criação |

---

## 📡 API Endpoints

### Exemplo de Uso

```bash
# Health Check
curl http://localhost:3000/api/health

# Listar categorias
curl http://localhost:3000/api/categorias

# Criar evento
curl -X POST http://localhost:3000/api/eventos \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Aula de Desenvolvimento Web",
    "descricao": "Projeto acadêmico",
    "categoria_id": 1,
    "data_inicio": "2026-08-25T15:00:00",
    "data_fim": "2026-08-25T17:00:00",
    "lembrete_minutos": 10,
    "recorrencia": "unico"
  }'

# Eventos de um dia específico
curl "http://localhost:3000/api/eventos/dia/2026-08-25"
```

---

## ⌚ Padrões Regionais

- **Formato de Data:** `dd/mm/yyyy` (ex: `25/08/2026`)
- **Formato de Hora:** `HH:mm` no padrão 24h (ex: `14:30`)
- **Fuso Horário:** Horário de Brasília (`UTC-3`)
- **Locale:** `pt-BR` (Date-fns)

---

## 📄 Licença

Este projeto é acadêmico, desenvolvido como requisito para a disciplina de **Desenvolvimento Web** no IFMT - Campus Barra do Garças.
