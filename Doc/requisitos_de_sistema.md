# Especificação de Requisitos de Sistema — Sistema Dinâmico de Gerenciamento de Rotinas (Rotinas Pessoais)

**Documento de Engenharia de Sistema — Perspectiva Técnica Interna, Contratos de Integração, Segurança e Runtime Node.js**  
**Conformidade:** OMG UML 2.5.1 | ISO/IEC/IEEE 29148:2018 | FURPS+ / ISO/IEC 25010 | OWASP ASVS 4.0  
**Projeto:** Rotinas Pessoais — IFMT Campus Barra do Garças  
**Versão:** 2.0.0  
**Data:** 03 de Setembro de 2026  
**Autores:** João Eduardo Sousa Ferreira e Lara Ohana Rodrigues Galvão  
**Orientador:** Prof. Carlos David Rocha de Souza  
**Stack Alvo:** Node.js 18+ (V8) + Express 4.x + SQLite 3 / PostgreSQL 15+ + HTML5/CSS3/JS Vanilla ES6+  
**Documentos Relacionados:** `requisitos_de_usuario.md` | `escopo_do_projeto.md`

---

## Sumário

1. [Visão Geral da Arquitetura de Sistema](#1-visão-geral-da-arquitetura-de-sistema)
2. [Requisitos Funcionais de Sistema (RSF) — Contratos REST, Middlewares e Payloads](#2-requisitos-funcionais-de-sistema-rsf)
3. [Requisitos Não Funcionais (RSNF) — Taxonomia FURPS+ / ISO 25010](#3-requisitos-não-funcionais-rsnf--taxonomia-furps-iso-25010)
4. [Diagramas de Sequência Dinâmicos de Backend (PlantUML)](#4-diagramas-de-sequência-dinâmicos-de-backend-plantuml)
5. [Diagrama Estrutural de Classes de Domínio e Controladores com OCL](#5-diagrama-estrutural-de-classes-de-domínio-e-controladores-com-ocl)
6. [Dicionário Técnico de Dados — Esquema Físico DDL](#6-dicionário-técnico-de-dados--esquema-físico-ddl)
7. [Contratos de API RESTful](#7-contratos-de-api-restful)
8. [Matriz Bidirecional de Rastreabilidade Técnica](#8-matriz-bidirecional-de-rastreabilidade-técnica)
9. [Aprovação](#9-aprovação)

---

## 1. Visão Geral da Arquitetura de Sistema

### 1.1 Estilo Arquitetural

Arquitetura **Cliente-Servidor Desacoplada** em 3 camadas lógicas, executada sobre **Node.js Event Loop (libuv)** não-bloqueante:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           SISTEMA ROTINAS PESSOAIS                           │
│                                                                              │
│  ┌─────────────────────────────────┐         HTTP/JSON (Fetch API)           │
│  │  CAMADA CLIENTE (HTML5/JS)      │◄──────────────────────────────────────►│
│  │  - HTML5 Semântico (sem React)  │         CORS + JSON                     │
│  │  - CSS3 (Tailwind ou Vanilla)   │                                         │
│  │  - JS Vanilla ES6+ (Fetch,      │         ┌──────────────────────────┐   │
│  │    DOMPurify, date-fns)         │         │  CAMADA SERVIDORA        │   │
│  │  - Web Audio API + Notification │         │  Node.js + Express 4.x   │   │
│  │  - AlarmManager (setInterval)   │         │  - Rotas (routes/)       │   │
│  └─────────────────────────────────┘         │  - Middlewares            │   │
│                                              │    (auth, sanitize, cors,  │   │
│                                              │     rateLimit, logger)     │   │
│                                              │  - Controllers             │   │
│                                              │  - Services                │   │
│                                              │  - Models (pg/sqlite3)     │   │
│                                              │  - Config (.env)           │   │
│                                              │           │                │   │
│                                              │           │ Prepared       │   │
│                                              │           │ Statements     │   │
│                                              │           ▼                │   │
│                                              │  ┌──────────────────┐     │   │
│                                              │  │  PERSISTÊNCIA    │     │   │
│                                              │  │  SQLite 3 (dev)  │     │   │
│                                              │  │  PostgreSQL 15+  │     │   │
│                                              │  │  (prod)          │     │   │
│                                              │  └──────────────────┘     │   │
│                                              └──────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Princípios de Design

| Princípio | Aplicação |
|---|---|
| **SoC / MVC** | Separação estrita: `routes` (roteamento), `controllers` (orquestração HTTP), `services` (regras de negócio), `models` (acesso a dados via Prepared Statements) |
| **Stateless (REST)** | Cada requisição contém todo contexto; autenticação via JWT auto-contido; sem sessão em memória |
| **Defense in Depth** | Sanitização em 3 pontos: cliente (DOMPurify), middleware (express-validator), banco (Prepared Statements) |
| **Fail Fast** | Validação síncrona no middleware antes de atingir Controller/Service |
| **Non-blocking I/O** | Todas as operações de I/O (DB, FS) assíncronas via `async/await` + pool de conexões; nunca bloquear Event Loop |

### 1.3 Estrutura de Pastas Física (Node.js Alvo)

```
rotinaspessoais/
├── api/                              # Backend Node.js
│   ├── .env                          # Variáveis de ambiente (protegido)
│   ├── .env.example
│   ├── package.json                  # express, pg, sqlite3, bcrypt, jsonwebtoken, express-validator, cors, helmet, dotenv
│   ├── server.js                     # Entry point (Express + listen)
│   ├── src/
│   │   ├── app.js                    # Criação do app Express, middlewares globais
│   │   ├── config/
│   │   │   ├── database.js           # Pool pg / sqlite3 Database + WAL
│   │   │   ├── env.js                # Validação de .env via dotenv + joi
│   │   │   └── constants.js          # Enums: STATUS, RECORRENCIA, LEMBRETE
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js      # JWT verify (Bearer / cookie)
│   │   │   ├── sanitize.middleware.js  # express-validator + escape
│   │   │   ├── cors.middleware.js      # cors({origin: ORIGEM_PERMITIDA})
│   │   │   ├── rateLimit.middleware.js # express-rate-limit
│   │   │   ├── error.middleware.js     # Handler centralizado
│   │   │   └── logger.middleware.js    # morgan / pino
│   │   ├── models/
│   │   │   ├── categoria.model.js      # Queries preparadas categorias
│   │   │   ├── evento.model.js         # Queries preparadas eventos
│   │   │   ├── usuario.model.js        # Queries usuarios (auth)
│   │   │   └── auditoria.model.js      # Logs de auditoria
│   │   ├── services/
│   │   │   ├── categoria.service.js
│   │   │   ├── evento.service.js       # Regras de data, transição status
│   │   │   └── auth.service.js         # bcrypt, jwt sign/verify
│   │   ├── controllers/
│   │   │   ├── categoria.controller.js
│   │   │   ├── evento.controller.js
│   │   │   └── auth.controller.js
│   │   ├── routes/
│   │   │   ├── categoria.routes.js     # Router Express
│   │   │   ├── evento.routes.js
│   │   │   ├── auth.routes.js
│   │   │   └── saude.routes.js
│   │   └── utils/
│   │       ├── sanitize.js             # Helpers DOMPurify-equivalente server
│   │       └── date.js                 # Helpers UTC-3
│   └── db/
│       ├── rotinas.db                  # SQLite file (dev)
│       ├── schema.sql                  # DDL completo
│       └── seed.sql                    # Dados iniciais
└── frontend/                          # Frontend Vanilla
    ├── index.html                      # Dashboard
    ├── calendario.html
    ├── login.html
    ├── solicitar.html                  # Formulário público
    ├── admin/
    │   └── eventos.html
    ├── css/
    │   └── style.css                   # Tailwind build ou vanilla
    ├── js/
    │   ├── api.js                      # Wrapper fetch + Authorization
    │   ├── dashboard.js
    │   ├── calendario.js
    │   ├── evento-form.js
    │   ├── categoria-manager.js
    │   ├── alarm-manager.js            # setInterval 1000ms + Audio
    │   ├── login.js
    │   ├── form-publico.js             # Validação + Toast
    │   └── toast.js                    # Toast renderer
    └── assets/
        └── sounds/
            └── bip_alerta.mp3
```

---

## 2. Requisitos Funcionais de Sistema (RSF)

> Convenção: `RSF-[MÓDULO]-[SEQ]` rastreia `RU-*`. Cada RSF detalha rota, middlewares, payload, validações, Prepared Statements e códigos HTTP.

### 2.1 RSF-01 — Gestão de Categorias

#### RSF-01-01 — Criar Categoria `POST /api/categorias`

| Aspecto | Especificação |
|---|---|
| **Rastreabilidade** | `RU-CAT-01` |
| **Rota Express** | `router.post('/api/categorias', sanitizeMiddleware.categoria, categoriaController.criar)` |
| **Middlewares** | `corsMiddleware` (global) → `sanitizeMiddleware.categoria` (express-validator) → `authMiddleware` (opcional, se modo protegido) → `controller` |
| **Método HTTP** | `POST` |
| **Headers Requeridos** | `Content-Type: application/json` <br> `Authorization: Bearer <token>` (se protegido) |
| **Payload Request (JSON)** | `{"nome": "Estudantil IFMT", "cor": "#20F9AD", "icone": "FaGraduationCap"}` <br> Tipos: `nome: string 1..80, cor: string pattern ^#[0-9A-Fa-f]{6}$, icone: string 1..50 enum` |
| **Validação Middleware (express-validator)** | `body('nome').trim().isLength({min:1,max:80}).escape()` <br> `body('cor').matches(/^#[0-9A-Fa-f]{6}$/)` <br> `body('icone').isIn(['FaBook','FaHome','FaBriefcase',...])` |
| **Controller → Service → Model** | `categoriaController.criar(req,res,next)` → `categoriaService.criar({nome,cor,icone})` (verifica unicidade `SELECT ... WHERE LOWER(nome)=LOWER(?)`) → `categoriaModel.create()` com Prepared Statement `INSERT INTO categorias (nome,cor,icone) VALUES (?,?,?)` |
| **Resposta Sucesso** | `201 Created` <br> `{"id":1,"nome":"Estudantil IFMT","cor":"#20F9AD","icone":"FaGraduationCap","data_criacao":"2026-09-03T10:00:00.000Z"}` <br> Header `Location: /api/categorias/1` |
| **Respostas de Erro** | `400 Bad Request` — nome duplicado (`{erro:"Categoria já existente", campo:"nome"}`) <br> `422 Unprocessable Entity` — falha de validação (`{erros:[{campo, mensagem}]}`) <br> `401 Unauthorized` — token inválido (se protegido) <br> `500 Internal Server Error` — falha de DB |
| **Trilha de Auditoria** | `INSERT INTO auditoria (usuario_id, acao, entidade, entidade_id) VALUES (?,?,?,?)` |

#### RSF-01-02 — Listar Categorias `GET /api/categorias`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.get('/api/categorias', categoriaController.listar)` |
| **Middlewares** | `cors` → (opcional `auth`) |
| **Query Params** | Nenhum (futuro: `?ordem=nome&direcao=asc`) |
| **Model Query** | `SELECT id, nome, cor, icone, data_criacao FROM categorias ORDER BY nome ASC` (Prepared Statement sem parâmetros) |
| **Resposta** | `200 OK` — `[{"id":1,"nome":"Estudantil",...}, ...]` <br> `Content-Type: application/json` |
| **Cache** | Header `Cache-Control: no-cache` (dados mutáveis) ou `max-age=60` se desejado |

#### RSF-01-03 — Buscar Categoria por ID `GET /api/categorias/:id`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.get('/api/categorias/:id', sanitizeMiddleware.idParam, categoriaController.buscarPorId)` |
| **Validação** | `param('id').isInt({min:1})` |
| **Model** | `SELECT * FROM categorias WHERE id = ?` |
| **Respostas** | `200 OK` com objeto <br> `404 Not Found` — `{erro:"Categoria não encontrada"}` <br> `400 Bad Request` — id não numérico |

#### RSF-01-04 — Atualizar Categoria `PUT /api/categorias/:id`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.put('/api/categorias/:id', sanitizeMiddleware.categoria, categoriaController.atualizar)` |
| **Payload** | Mesmo de criação (todos os campos) |
| **Model** | `UPDATE categorias SET nome=?, cor=?, icone=? WHERE id=?` |
| **Respostas** | `200 OK` com objeto atualizado <br> `404` se não existe <br> `400` se nome duplicado (outra categoria) <br> `422` validação |

#### RSF-01-05 — Remover Categoria Protegida `DELETE /api/categorias/:id`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.delete('/api/categorias/:id', authMiddleware, categoriaController.remover)` |
| **Regra de Negócio** | Verificar FK: `SELECT COUNT(*) as total FROM eventos WHERE categoria_id = ?` <br> Se `total > 0` → `409 Conflict` com `{erro:"Categoria em uso por N evento(s)", codigo:"FK_CONSTRAINT"}` <br> Caso contrário `DELETE FROM categorias WHERE id=?` |
| **Respostas** | `204 No Content` (sem body) em sucesso <br> `409 Conflict` se em uso <br> `401` se não autenticado <br> `404` se não existe |
| **Auditoria** | Log de exclusão |

---

### 2.2 RSF-02 — Gestão de Eventos e Agendamentos

#### RSF-02-01 — Criar Evento `POST /api/eventos`

| Aspecto | Especificação |
|---|---|
| **Rastreabilidade** | `RU-EVT-01` |
| **Rota** | `router.post('/api/eventos', sanitizeMiddleware.evento, eventoController.criar)` |
| **Middlewares** | `cors` → `sanitizeMiddleware.evento` (validação extensiva) → `authMiddleware` (se protegido) |
| **Payload Request** | ```json { "titulo":"Prova de Desenvolvimento Web", "descricao":"Avaliação sobre Node.js", "categoria_id":1, "data_inicio":"2026-09-05T08:00:00-03:00", "data_fim":"2026-09-05T10:00:00-03:00", "convidados":"aluno@ifmt.edu.br, orientador@ifmt.edu.br", "cor_personalizada":"#3b82f6", "lembrete_minutos":30, "alarme_sonoro":"bip_alerta.mp3", "recorrencia":"unico", "status":"pendente" } ``` |
| **Validação Middleware (express-validator)** | `body('titulo').trim().isLength({min:1,max:200}).escape()` <br> `body('descricao').optional().trim().escape()` <br> `body('categoria_id').isInt({min:1})` <br> `body('data_inicio').isISO8601().toDate()` <br> `body('data_fim').isISO8601().toDate().custom((v,{req})=> new Date(v) >= new Date(req.body.data_inicio) \|\| throw)` <br> `body('convidados').optional().custom(v=> v.split(',').every(e=> /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())) )` <br> `body('cor_personalizada').optional().matches(/^#[0-9A-Fa-f]{6}$/)` <br> `body('lembrete_minutos').isIn([0,5,10,30,60,1440])` <br> `body('recorrencia').isIn(['unico','diario','semanal','mensal'])` <br> `body('status').optional().isIn(['pendente','em_andamento','concluido','cancelado'])` |
| **Service Regras** | 1. Validar `data_fim >= data_inicio` (dupla checagem). 2. Verificar `categoria_id` existe (`SELECT 1 FROM categorias WHERE id=?`). 3. Normalizar `convidados` (trim, lower). 4. Definir `status` default `pendente` se não informado. |
| **Model (Prepared Statement)** | `INSERT INTO eventos (titulo, descricao, categoria_id, data_inicio, data_fim, convidados, cor_personalizada, lembrete_minutos, alarme_sonoro, recorrencia, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)` |
| **Resposta Sucesso** | `201 Created` <br> `Location: /api/eventos/{id}` <br> Body: objeto evento completo com `id` e `data_criacao` |
| **Erros** | `422` — datas inconsistentes ou validação <br> `404` — categoria não encontrada <br> `400` — payload malformado <br> `500` — DB |

#### RSF-02-02 — Listar Eventos com Filtros `GET /api/eventos`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.get('/api/eventos', eventoController.listar)` |
| **Query Params** | `inicio` (ISO date, opcional), `fim` (ISO date, opcional), `categoria_id` (int, opcional), `status` (enum, opcional), `page` (int, default 1), `limit` (int, default 50) |
| **Exemplo** | `GET /api/eventos?inicio=2026-09-01&fim=2026-09-30&categoria_id=1` |
| **Model Query** | `SELECT e.*, c.nome as categoria_nome, c.cor as categoria_cor FROM eventos e JOIN categorias c ON e.categoria_id=c.id WHERE (data_inicio BETWEEN ? AND ?) AND (categoria_id=? OR ? IS NULL) ORDER BY data_inicio ASC LIMIT ? OFFSET ?` — todos parâmetros via `?` placeholders |
| **Resposta** | `200 OK` — `{dados:[...], total:42, page:1, limit:50}` |
| **Headers** | `X-Total-Count: 42` |

#### RSF-02-03 — Buscar Evento por ID `GET /api/eventos/:id`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.get('/api/eventos/:id', sanitizeMiddleware.idParam, eventoController.buscarPorId)` |
| **Model** | `SELECT e.*, c.nome, c.cor FROM eventos e JOIN categorias c ON e.categoria_id=c.id WHERE e.id=?` |
| **Respostas** | `200` com objeto <br> `404` se não existe <br> `400` se id inválido |

#### RSF-02-04 — Eventos por Dia `GET /api/eventos/dia/:data`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.get('/api/eventos/dia/:data', sanitizeMiddleware.dataParam, eventoController.listarPorDia)` |
| **Param Validação** | `param('data').matches(/^\d{4}-\d{2}-\d{2}$/)` + `isISO8601` |
| **Processamento** | Converter `YYYY-MM-DD` para intervalo `[YYYY-MM-DD 00:00:00, YYYY-MM-DD 23:59:59]` em UTC-3; `SELECT ... WHERE DATE(data_inicio) = ?` ou `BETWEEN` |
| **Model** | `SELECT * FROM eventos WHERE DATE(data_inicio) = ? ORDER BY data_inicio ASC` |
| **Resposta** | `200` — array (pode ser vazio `[]`) |

#### RSF-02-05 — Atualizar Evento `PUT /api/eventos/:id`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.put('/api/eventos/:id', sanitizeMiddleware.evento, eventoController.atualizar)` |
| **Payload** | Mesmo de criação (PUT completo) ou `PATCH` parcial |
| **Model** | `UPDATE eventos SET titulo=?, descricao=?, categoria_id=?, data_inicio=?, data_fim=?, convidados=?, cor_personalizada=?, lembrete_minutos=?, alarme_sonoro=?, recorrencia=? WHERE id=?` |
| **Respostas** | `200` com objeto atualizado <br> `404` se não existe <br> `422` se datas inválidas |

#### RSF-02-06 — Atualizar Status `PATCH /api/eventos/:id/status`

| Aspecto | Especificação |
|---|---|
| **Rastreabilidade** | `RU-AUTH-02` |
| **Rota** | `router.patch('/api/eventos/:id/status', authMiddleware, sanitizeMiddleware.status, eventoController.atualizarStatus)` |
| **Payload** | `{"status":"em_andamento"}` — enum `['pendente','em_andamento','concluido','cancelado']` |
| **Middlewares** | `authMiddleware` (obrigatório) → `sanitizeMiddleware.status` → `controller` |
| **Service (Máquina de Estados + OCL)** | Ver invariantes OCL §5; `SELECT status FROM eventos WHERE id=?` → `validarTransicao(statusAtual, novoStatus)` → se inválida throw 422 |
| **Model** | `UPDATE eventos SET status=? WHERE id=?` + `INSERT INTO auditoria (...)` |
| **Respostas** | `200` com evento atualizado <br> `401` não autenticado <br> `404` não encontrado <br> `422` transição inválida (`{erro:"Transição não permitida", permitidas:["concluido","cancelado"]}`) |

#### RSF-02-07 — Excluir Evento `DELETE /api/eventos/:id`

| Aspecto | Especificação |
|---|---|
| **Rastreabilidade** | `RU-EVT-03` |
| **Rota** | `router.delete('/api/eventos/:id', authMiddleware, eventoController.remover)` |
| **Middlewares** | `authMiddleware` obrigatório |
| **Model** | `DELETE FROM eventos WHERE id=?` (hard delete) ou `UPDATE eventos SET deleted_at=NOW() WHERE id=?` (soft delete, se configurado) |
| **Auditoria** | `INSERT INTO auditoria (usuario_id, evento_id, acao, timestamp)` antes do DELETE |
| **Respostas** | `204 No Content` sucesso <br> `401` não autenticado <br> `404` não encontrado |

---

### 2.3 RSF-03 — Autenticação e Autorização

#### RSF-03-01 — Login `POST /api/auth/login`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.post('/api/auth/login', sanitizeMiddleware.login, authController.login)` |
| **Payload** | `{"email":"admin@ifmt.edu.br","senha":"S3nh@F0rt3"}` |
| **Validação** | `body('email').isEmail().normalizeEmail()` <br> `body('senha').isLength({min:6,max:100})` |
| **Service** | `SELECT id, email, senha_hash, role FROM usuarios WHERE email=?` → `bcrypt.compare(senha, hash)` → se OK `jwt.sign({sub:id, email, role}, CHAVE_SECRETA, {algorithm: ALGORITMO, expiresIn: MINUTOS_EXPIRACAO_TOKEN+'m'})` |
| **Resposta Sucesso** | `200 OK` <br> `{"token":"eyJhbG...","usuario":{"id":1,"email":"admin@ifmt.edu.br","role":"admin"}}` <br> Header `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/` |
| **Erros** | `401 Unauthorized` — `{erro:"Credenciais inválidas"}` (mensagem genérica, não revela se email existe) <br> `422` validação <br> `429 Too Many Requests` — rate limit excedido |
| **Rate Limit** | `rateLimit({windowMs:15*60*1000, max:5, message:"Muitas tentativas"})` aplicado nesta rota |

#### RSF-03-02 — Verificar Token `GET /api/auth/verificar`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.get('/api/auth/verificar', authMiddleware, authController.verificar)` |
| **Headers** | `Authorization: Bearer <token>` |
| **Resposta** | `200 {valido:true, usuario:{...}}` <br> `401 {valido:false}` |

#### RSF-03-03 — Logout `POST /api/auth/logout`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.post('/api/auth/logout', authController.logout)` |
| **Ação** | `Set-Cookie: token=; HttpOnly; Max-Age=0` + cliente remove `localStorage` |

---

### 2.4 RSF-04 — Saúde e Infraestrutura

#### RSF-04-01 — Health Check `GET /api/saude`

| Aspecto | Especificação |
|---|---|
| **Rota** | `router.get('/api/saude', (req,res)=>res.json({status:"ok", timestamp:new Date().toISOString(), uptime:process.uptime(), db:"conectado"}))` |
| **Resposta** | `200 {"status":"ok","timestamp":"2026-09-03T12:00:00Z","uptime":1234.5,"versao":"2.0.0"}` |
| **Uso** | Liveness probe; verificação de pool DB |

---

### 2.5 Fluxo de Middlewares Express (Ordem Global)

```
Requisição HTTP
    │
    ├─► helmet() — cabeçalhos de segurança (CSP, HSTS, X-Frame-Options)
    ├─► cors({origin: ORIGEM_PERMITIDA, credentials:true})
    ├─► express.json({limit:"10kb"}) — parser JSON com limite
    ├─► express.urlencoded({extended:true})
    ├─► logger (morgan/pino) — log de requisição
    ├─► rateLimit (global leve) + rateLimit estrito em /api/auth/login
    │
    ├─► Rota Específica
    │     ├─► sanitizeMiddleware (express-validator)
    │     ├─► authMiddleware (se rota protegida) — jwt.verify
    │     ├─► controller.<metodo>(req,res,next)
    │     │     ├─► service.<metodo>(dados)
    │     │     │     ├─► model.<query>(Prepared Statements)
    │     │     │     │     └─► Pool DB (pg Pool / sqlite3 Database)
    │     │     │     └─► auditoriaModel.log()
    │     │     └─► res.status().json()
    │     └─► errorMiddleware (captura next(err))
    │
    └─► 404 handler — {erro:"Rota não encontrada"}
```

---

## 3. Requisitos Não Funcionais (RSNF) — Taxonomia FURPS+ / ISO 25010

### 3.1 F — Funcionalidade (Functionality) / Segurança (Security) — ISO 25010: Security

#### RSNF-SEC-01 — Criptografia de Senhas com Salt Aleatório

| Atributo | Especificação |
|---|---|
| **Categoria** | FURPS+ Security / ISO 25010 Confidentiality + Integrity |
| **Algoritmo** | `bcrypt` (custo 12) **ou** `argon2id` (recomendado OWASP) **ou** `PBKDF2-HMAC-SHA256` com salt aleatório ≥16 bytes e iterações ≥600.000. **Padrão desta especificação: `bcrypt` com saltRounds=12** |
| **Biblioteca** | `npm: bcrypt` (ou `argon2`) |
| **Armazenamento** | Coluna `senha_hash VARCHAR(255) NOT NULL` armazena hash + salt embutido (`$2b$12$...`). Nunca armazenar senha em claro ou `CHAVE_CIFRAGEM_BANCO` para senhas |
| **Geração** | `const hash = await bcrypt.hash(senha, 12);` |
| **Verificação** | `await bcrypt.compare(senha, hash)` — timing-safe |
| **Política** | Senha mínima 8 chars, deve conter maiúscula, minúscula, número e símbolo (validado via `express-validator` e `isStrongPassword`) |
| **Métrica de Aceitação** | Tempo de hash ~250-400 ms em hardware padrão; verificação <500 ms; resistente a rainbow table e brute force |

#### RSNF-SEC-02 — Autenticação e Autorização Stateless via JWT

| Atributo | Especificação |
|---|---|
| **Padrão** | RFC 7519 (JWT) com `HS256` (HMAC-SHA256) ou `RS256` (assimétrico). **Padrão: `HS256`** conforme `.env ALGORITMO` |
| **Transporte** | Preferencial: `Authorization: Bearer <token>` header. Alternativo seguro: `Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict` |
| **Geração** | `jwt.sign({sub: usuario.id, email, role, iat, exp}, CHAVE_SECRETA, {algorithm:'HS256', expiresIn: MINUTOS_EXPIRACAO_TOKEN+'m'})` |
| **Validação Middleware** | ```js async function authMiddleware(req,res,next){ const token = req.headers.authorization?.split(' ')[1] \|\| req.cookies.token; if(!token) return res.status(401).json({erro:"Token ausente"}); try{ req.usuario = jwt.verify(token, process.env.CHAVE_SECRETA); next(); }catch(e){ return res.status(401).json({erro:"Token inválido ou expirado"});} }``` |
| **Expiração** | `MINUTOS_EXPIRACAO_TOKEN=60` (1h). Renovação via re-login ou refresh token (fora de escopo v1) |
| **Autorização** | RBAC simples: `role: 'admin'` pode `PATCH status` e `DELETE`; `role: 'usuario'` pode `CRUD` próprio. Checagem `if(req.usuario.role!=='admin') return 403` |
| **Revogação** | JWT stateless não revogável sem blacklist; mitigação: expiração curta + `Set-Cookie Max-Age=0` no logout |

#### RSNF-SEC-03 — Sanitização Ativa contra XSS e Prevenção de SQL Injection

| Vetor | Mitigação | Detalhe |
|---|---|---|
| **XSS Refletido/Armazenado** | `express-validator`: `escape()`, `trim()`, `stripLow()` + `DOMPurify` client-side | Todo `titulo`, `descricao` passa por `body('titulo').escape()` no middleware; no cliente `DOMPurify.sanitize()` antes de `fetch`; ao renderizar no DOM, usar `textContent` em vez de `innerHTML` ou `DOMPurify` |
| **SQL Injection** | **Prepared Statements / Queries Parametrizadas** — nunca concatenar strings | **Proibido:** `` `SELECT * FROM eventos WHERE id=${id}` `` <br> **Obrigatório:** `db.all('SELECT * FROM eventos WHERE id = ?', [id])` (sqlite3) ou `pool.query('SELECT * FROM eventos WHERE id = $1', [id])` (pg) via `pg` driver |
| **Exemplo Correto (pg)** | `await pool.query('INSERT INTO eventos (titulo, categoria_id) VALUES ($1,$2) RETURNING *', [titulo, categoria_id])` |  |
| **Exemplo Correto (sqlite3)** | `db.run('INSERT INTO eventos (titulo) VALUES (?)', [titulo], function(err){...})` |  |
| **CORS** | `cors({origin: process.env.ORIGEM_PERMITIDA, credentials:true})` — apenas `http://localhost:5173` (ou `http://localhost:3000`) |  |
| **Helmet** | `helmet()` — adiciona `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` |  |
| **Validação** | Testes de penetração com payloads `'; DROP TABLE eventos; --`, `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>` devem ser bloqueados/escapados |  |

### 3.2 U — Usabilidade (Usability) / ISO 25010: Usability

| ID | Requisito | Métrica |
|---|---|---|
| **RSNF-USA-01** | Interface HTML5 semântica com `header/main/section/form/dialog/time`, labels associados, `aria-live` em Toasts | Validar com W3C Validator: 0 erros |
| **RSNF-USA-02** | Tempo de feedback visual ≤300 ms após ação do usuário (Toast, spinner, borda) | Medido via Performance API |
| **RSNF-USA-03** | Responsividade: layout fluido 320px–1920px, mobile-first, sem scroll horizontal | Testado em Chrome DevTools breakpoints |
| **RSNF-USA-04** | Acessibilidade WCAG 2.1 AA: contraste ≥4.5:1, navegação por teclado, foco visível | Lighthouse Accessibility ≥90 |
| **RSNF-USA-05** | Padrão regional: `dd/mm/yyyy`, `HH:mm` 24h, `UTC-3`, locale `pt-BR` via `Intl.DateTimeFormat` ou `date-fns` |  |

### 3.3 R — Confiabilidade (Reliability) / ISO 25010: Reliability

| ID | Requisito | Especificação |
|---|---|---|
| **RSNF-REL-01** | Disponibilidade ≥99% em ambiente local; sem perda de dados em crash (ACID) | SQLite WAL + transações; PostgreSQL ACID nativo |
| **RSNF-REL-02** | Tratamento centralizado de erros: `errorMiddleware` captura exceções e retorna JSON padronizado `{erro, codigo, detalhes}` sem stacktrace em produção | |
| **RSNF-REL-03** | Validação de integridade referencial: FK `RESTRICT` impede órfãos; `CHECK` constraints garantem domínios válidos | |

### 3.4 P — Performance (Performance) / ISO 25010: Performance Efficiency

| ID | Requisito | Métrica de Aceitação |
|---|---|---|
| **RSNF-PER-01** | Tempo de resposta API: `GET` ≤100 ms p95, `POST/PUT/DELETE` ≤200 ms p95 em localhost sem carga | Medido via `autocannon` ou `k6` com 50 VUs |
| **RSNF-PER-02** | Throughput: ≥100 req/s em `GET /api/eventos` (Node.js single thread + cluster opcional) | |
| **RSNF-PER-03** | Uso de memória Node.js <200 MB em operação normal; sem vazamento de Event Loop | Monitorado via `process.memoryUsage()` |
| **RSNF-PER-04** | AlarmManager tick ≤5 ms de overhead; não bloquear UI thread | `setInterval(...,1000)` sem I/O síncrono dentro |

### 3.5 S — Suportabilidade (Supportability) + Concorrência de I/O e Pool de Conexões

#### RSNF-ARC-01 — Concorrência de I/O Não Bloqueante no Event Loop

| Aspecto | Especificação |
|---|---|
| **Modelo** | Node.js Event Loop (libuv) com thread pool para I/O; todas as operações de DB, FS e rede **assíncronas** (`async/await`, `Promise`, callbacks não-bloqueantes) |
| **Proibições** | Nunca usar `fs.readFileSync`, `db.exec` síncrono, `while(true)` ou `crypto.pbkdf2Sync` no request path; nunca bloquear Event Loop com computação CPU-bound >50 ms |
| **Padrão Correto** | ```js // Controller assíncrono export async function criar(req,res,next){ try{ const evento = await eventoService.criar(req.body); res.status(201).json(evento); }catch(err){ next(err); } } // Model pool query await pool.query('SELECT ...', [id]) // não-blocking ``` |
| **CPU-bound** | Se necessário (ex.: bcrypt hash), usar `await bcrypt.hash()` que delega ao thread pool libuv; para tarefas pesadas, considerar `worker_threads` (fora de escopo) |
| **Métrica** | Event Loop lag <10 ms (medido via `perf_hooks.monitorEventLoopDelay`) |

#### RSNF-ARC-02 — Gerenciamento de Pool de Conexões com o Banco de Dados

| Banco | Configuração | Detalhe |
|---|---|---|
| **SQLite 3 (dev)** | `new sqlite3.Database(CAMINHO_BANCO, sqlite3.OPEN_READWRITE \| sqlite3.OPEN_CREATE)` + `PRAGMA journal_mode=WAL` + `PRAGMA foreign_keys=ON` + `PRAGMA busy_timeout=5000` | WAL permite leituras concorrentes; `check_same_thread` equivalente não se aplica em Node.js (single thread); usar `serialize()` ou `Database` com queue interna; evitar múltiplas instâncias `Database` |
| **PostgreSQL (prod)** | `new Pool({host, port, database, user, password, max:10, idleTimeoutMillis:30000, connectionTimeoutMillis:2000})` via `pg` | Pool de 10 conexões; `max` ajustável via `DB_POOL_MAX`; `idleTimeout` libera conexões ociosas; `connectionTimeout` falha rápido se pool esgotado |
| **Uso** | Sempre `pool.query()` ou `client = await pool.connect(); try{...} finally{client.release()}`; nunca criar novo `Pool` por requisição | |
| **Transações** | `BEGIN; ... COMMIT;` via `client.query('BEGIN')` com `try/catch {ROLLBACK}`; garantir ACID para operações multi-tabela (evento + auditoria) | |
| **Health** | `GET /api/saude` executa `SELECT 1` para verificar pool; se falha retorna `503 Service Unavailable` | |

#### RSNF-ARC-03 — Configuração via Variáveis de Ambiente (`.env`)

| Variável | Descrição | Exemplo | Obrigatória |
|---|---|---|---|
| `PORTA` | Porta do servidor Express | `3000` | Sim |
| `ORIGEM_PERMITIDA` | Origem CORS permitida | `http://localhost:5173` | Sim |
| `CAMINHO_BANCO` | Caminho SQLite | `db/rotinas.db` | Sim (se SQLite) |
| `DATABASE_URL` | URL PostgreSQL | `postgres://user:pass@localhost:5432/rotinas` | Sim (se PG) |
| `ALGORITMO` | Algoritmo JWT | `HS256` | Sim |
| `CHAVE_SECRETA` | Segredo JWT (hex 256 bits) | `a1b2c3...64 chars` | Sim |
| `MINUTOS_EXPIRACAO_TOKEN` | Expiração JWT | `60` | Sim |
| `CHAVE_CIFRAGEM_BANCO` | Chave extra para cifragem (se necessário) | `...` | Não |
| `DB_POOL_MAX` | Tamanho do pool PG | `10` | Não |
| `NODE_ENV` | Ambiente | `development` / `production` | Sim |

Carregamento via `dotenv` + validação com `joi` no `config/env.js` na inicialização; falhar fast se variável obrigatória ausente.

### 3.6 + (Plus) — Restrições Adicionais FURPS+

| Categoria | Requisito |
|---|---|
| **Implementação** | Node.js 18+ LTS, Express 4.x, `pg` 8.x ou `sqlite3` 5.x, `bcrypt` 5.x, `jsonwebtoken` 9.x, `express-validator` 7.x, `cors`, `helmet`, `dotenv` |
| **Interface** | HTML5 semântico, CSS3 (Flex/Grid), JS Vanilla ES6+ (sem React/Vue), Fetch API, DOMPurify 3.x |
| **Operação** | Logs estruturados via `pino` ou `morgan`; rotação de logs; `pm2` ou `systemd` para produção |
| **Legal** | Dados pessoais (e-mails convidados) tratados conforme LGPD; consentimento para notificações |

---

## 4. Diagramas de Sequência Dinâmicos de Backend (PlantUML)

### 4.1 DS-BE-01 — Criação de Evento: Rota → Middlewares (Sanitização) → Controller → Service → Model → DB → Auditoria

```plantuml
@startuml DS_BE_CriacaoEvento
title DS-BE-01 — Fluxo Interno: Criação de Evento (POST /api/eventos)

actor "Cliente\n(HTML5/JS)" as Cliente
participant "Express Router\nPOST /api/eventos" as Router
participant "sanitizeMiddleware\n<<express-validator>>" as Sanitize
participant "authMiddleware\n<<JWT>>" as Auth
participant "eventoController\n<<Controller>>" as Controller
participant "eventoService\n<<Service>>" as Service
participant "categoriaModel\n<<Model>>" as CatModel
participant "eventoModel\n<<Model>>" as EventModel
participant "auditoriaModel\n<<Model>>" as AuditModel
database "SQLite / PostgreSQL\n<<Pool>>" as DB

Cliente -> Router : 1. POST /api/eventos\nJSON + Authorization?
Router -> Sanitize : 2. body('titulo').escape()...\nbody('data_fim').custom(...)
Sanitize -> Sanitize : 3. validationResult(req)\nse erros -> 422
alt validação falhou
  Sanitize --> Router : 4a. res 422 {erros}
  Router --> Cliente : 5a. 422 Unprocessable Entity
else validação OK
  Sanitize -> Auth : 4b. next() -> authMiddleware\n(se rota protegida)
  Auth -> Auth : 5b. jwt.verify(token)\nse ausente/inválido -> 401
  alt não autenticado
    Auth --> Router : 6c. res 401 {erro}
    Router --> Cliente : 7c. 401 Unauthorized
  else autenticado ou rota pública
    Auth -> Controller : 6d. req.usuario = payload\nnext()
    Controller -> Controller : 7d. extrai req.body sanitizado\nchama eventoService.criar(dados)
    Controller -> Service : 8d. eventoService.criar({titulo, categoria_id, ...})
    Service -> Service : 9d. regra: data_fim >= data_inicio\nse violado throw 422
    Service -> CatModel : 10d. categoriaModel.existe(categoria_id)
    CatModel -> DB : 11d. SELECT 1 FROM categorias WHERE id = ?\n[Prepared Statement]
    DB --> CatModel : 12d. row ou null
    CatModel --> Service : 13d. true/false
    alt categoria não existe
      Service --> Controller : 14e. throw NotFound 404
      Controller --> Router : 15e. next(err)
      Router --> Cliente : 16e. 404 {erro:"Categoria não encontrada"}
    else categoria existe
      Service -> EventModel : 14f. eventoModel.create(dados)
      EventModel -> DB : 15f. INSERT INTO eventos\n(titulo, descricao, categoria_id, data_inicio, data_fim, ...)\nVALUES ($1,$2,$3,$4,$5,...)\n[Prepared Statement]
      DB --> EventModel : 16f. RETURNING id, data_criacao
      EventModel --> Service : 17f. evento criado {id, ...}
      Service -> AuditModel : 18f. auditoriaModel.log({usuario_id, acao:"CREATE", entidade:"evento", entidade_id})
      AuditModel -> DB : 19f. INSERT INTO auditoria\n(usuario_id, acao, entidade, entidade_id, timestamp)\nVALUES (?,?,?,? ,NOW())
      DB --> AuditModel : 20f. log ok
      AuditModel --> Service : 21f. done
      Service --> Controller : 22f. evento completo
      Controller --> Router : 23f. res.status(201).json(evento)\nLocation: /api/eventos/{id}
      Router --> Cliente : 24f. 201 Created\n{evento}
    end
  end
end

@enduml
```

**Notas:** Este DS evidencia o pipeline completo Express com dois middlewares encadeados. A sanitização ocorre *antes* da autenticação para falhar rápido em payloads malformados. O Service orquestra regras de negócio e checagem de FK antes de delegar ao Model, que usa exclusivamente Prepared Statements. A auditoria é registrada em transação (não mostrada em detalhe aqui, mas `BEGIN/COMMIT` no Model).

### 4.2 DS-BE-02 — Autenticação JWT: Login com bcrypt e Geração de Token

```plantuml
@startuml DS_BE_Login
title DS-BE-02 — Fluxo Interno: Login (POST /api/auth/login) — bcrypt + JWT

actor "Cliente\nlogin.js" as Cliente
participant "Router\nPOST /api/auth/login" as Router
participant "sanitizeMiddleware\n<<login>>" as Sanitize
participant "rateLimit\n<<15min/5req>>" as RateLimit
participant "authController" as Controller
participant "authService" as Service
participant "usuarioModel" as UserModel
database "DB" as DB
participant "bcrypt\n<<libuv Thread Pool>>" as Bcrypt
participant "jsonwebtoken\n<<HS256>>" as JWT

Cliente -> Router : 1. POST /api/auth/login\n{email, senha}
Router -> RateLimit : 2. rateLimit check\nse excedido -> 429
RateLimit -> Sanitize : 3. body('email').isEmail()...
Sanitize -> Sanitize : 4. validationResult\nse erro -> 422
alt rate limit excedido
  RateLimit --> Cliente : 5a. 429 Too Many Requests
else validação falhou
  Sanitize --> Cliente : 5b. 422 {erros}
else validação OK
  Sanitize -> Controller : 5c. next()
  Controller -> Service : 6c. authService.autenticar(email, senha)
  Service -> UserModel : 7c. usuarioModel.buscarPorEmail(email)
  UserModel -> DB : 8c. SELECT id, email, senha_hash, role\nFROM usuarios WHERE email = $1
  DB --> UserModel : 9c. row {id, senha_hash} ou null
  UserModel --> Service : 10c. usuario ou null
  alt usuário não encontrado
    Service --> Controller : 11d. throw 401 (genérico)
    Controller --> Cliente : 12d. 401 {erro:"Credenciais inválidas"}
  else usuário encontrado
    Service -> Bcrypt : 11e. bcrypt.compare(senha, senha_hash)\n[async, thread pool, não bloqueia Event Loop]
    Bcrypt --> Service : 12e. true/false
    alt senha incorreta
      Service --> Controller : 13f. throw 401
      Controller --> Cliente : 14f. 401 {erro:"Credenciais inválidas"}
    else senha correta
      Service -> JWT : 13g. jwt.sign({sub:id, email, role},\nCHAVE_SECRETA, {algorithm:HS256, expiresIn:60m})
      JWT --> Service : 14g. token
      Service --> Controller : 15g. {token, usuario:{id,email,role}}
      Controller --> Router : 16g. res.cookie("token", token,\n{httpOnly:true, secure:true, sameSite:"strict"})\n.json({token, usuario})
      Router --> Cliente : 17g. 200 OK\n{token, usuario} + Set-Cookie
    end
  end
end

@enduml
```

**Notas:** Demonstra o uso do thread pool libuv para `bcrypt.compare` (não bloqueia Event Loop). O erro para usuário não encontrado e senha incorreta é idêntico (`401 Credenciais inválidas`) para não vazar enumeração de usuários (OWASP). Rate limit protege contra brute force.

### 4.3 DS-BE-03 — Fluxo Protegido com Auth Middleware e Transição de Status com Auditoria

```plantuml
@startuml DS_BE_Status
title DS-BE-03 — Fluxo Protegido: PATCH /api/eventos/:id/status — Auth → Validação → Transição OCL → Auditoria

actor "Admin\n(JS)" as Admin
participant "Router\nPATCH /status" as Router
participant "authMiddleware" as Auth
participant "sanitizeMiddleware\n<<status>>" as Sanitize
participant "eventoController" as Controller
participant "eventoService" as Service
database "DB Pool" as DB
participant "eventoModel" as EventModel
participant "auditoriaModel" as AuditModel

Admin -> Router : 1. PATCH /api/eventos/10/status\n{status:"em_andamento"}\nAuthorization: Bearer <token>
Router -> Auth : 2. authMiddleware
Auth -> Auth : 3. extrai token\njwt.verify(CHAVE_SECRETA)
alt token ausente
  Auth --> Router : 4a. 401 {erro:"Token ausente"}
  Router --> Admin : 5a. 401
else token inválido/expirado
  Auth --> Router : 4b. 401 {erro:"Token inválido ou expirado"}
  Router --> Admin : 5b. 401
else token válido
  Auth -> Auth : 4c. req.usuario = {sub, role}\nnext()
  Auth -> Sanitize : 5c. body('status').isIn([...])
  Sanitize -> Sanitize : 6c. validationResult\nse erro -> 422
  alt validação falhou
    Sanitize --> Router : 7d. 422
    Router --> Admin : 8d. 422 {erros}
  else validação OK
    Sanitize -> Controller : 7e. next()
    Controller -> Service : 8e. eventoService.atualizarStatus(id, novoStatus, req.usuario)
    Service -> EventModel : 9e. eventoModel.buscarPorId(id)
    EventModel -> DB : 10e. SELECT status FROM eventos WHERE id = $1
    DB --> EventModel : 11e. {status:"pendente"} ou null
    EventModel --> Service : 12e. eventoAtual
    alt evento não encontrado
      Service --> Controller : 13f. throw 404
      Controller --> Router : 14f. 404 {erro:"Evento não encontrado"}
      Router --> Admin : 15f. 404
    else evento encontrado
      Service -> Service : 13g. validarTransição(statusAtual, novoStatus)\nOCL: pendente->em_andamento OK\nem_andamento->concluido OK\nconcluido->* NEGADO
      alt transição inválida
        Service --> Controller : 14h. throw 422 {transição não permitida}
        Controller --> Router : 15h. 422 {erro, permitidas}
        Router --> Admin : 16h. 422
      else transição válida
        Service -> EventModel : 14i. eventoModel.atualizarStatus(id, novoStatus)
        EventModel -> DB : 15i. BEGIN\nUPDATE eventos SET status=$1 WHERE id=$2\nINSERT INTO auditoria (usuario_id, evento_id, status_anterior, status_novo, timestamp)\nVALUES ($1,$2,$3,$4,NOW())\nCOMMIT [transação]
        DB --> EventModel : 16i. commit ok (ou ROLLBACK se erro)
        EventModel --> Service : 17i. evento atualizado
        Service --> Controller : 18i. evento
        Controller --> Router : 19i. res.json(evento)
        Router --> Admin : 20i. 200 OK {evento}
      end
    end
  end
end

@enduml
```

---

## 5. Diagrama Estrutural de Classes de Domínio e Controladores com OCL

### 5.1 PlantUML — Classes de Domínio, Controladores, Services e Middlewares

```plantuml
@startuml Classes_Dominio
title Diagrama de Classes — Domínio + Controladores + Services (UML 2.5.1) com OCL

skinparam classAttributeIconSize 0
skinparam classBackgroundColor #FEFECE
skinparam packageBackgroundColor #f8f9fa

package "Domínio :: Entidades Persistentes" {
  class Categoria {
    - id: Integer {PK, AutoIncrement}
    - nome: String[1..80] {NotNull, Unique}
    - cor: String {NotNull, pattern=^#[0-9A-Fa-f]{6}$}
    - icone: String[1..50] {NotNull}
    - data_criacao: DateTime {readOnly, default=CURRENT_TIMESTAMP}
    --
    + validarCor(): Boolean
    + toJSON(): Object
  }

  class Evento {
    - id: Integer {PK, AutoIncrement}
    - titulo: String[1..200] {NotNull}
    - descricao: String {nullable}
    - categoria_id: Integer {FK -> Categoria.id}
    - data_inicio: DateTime {NotNull}
    - data_fim: DateTime {NotNull}
    - convidados: String {nullable, CSV e-mails}
    - cor_personalizada: String {nullable, pattern=^#[0-9A-Fa-f]{6}$}
    - lembrete_minutos: Integer {NotNull, enum=0,5,10,30,60,1440}
    - alarme_sonoro: String[1..100] {nullable}
    - recorrencia: String {NotNull, enum=unico,diario,semanal,mensal}
    - status: String {NotNull, enum=pendente,em_andamento,concluido,cancelado, default=pendente}
    - data_criacao: DateTime {readOnly}
    --
    + validarIntervalo(): Boolean
    + validarTransição(novoStatus: String): Boolean
    + expandirRecorrência(inicio: Date, fim: Date): Evento[]
  }

  class Usuario {
    - id: Integer {PK}
    - email: String {NotNull, Unique, isEmail}
    - senha_hash: String {NotNull, length=60}
    - role: String {enum=usuario,admin, default=usuario}
    - data_criacao: DateTime
    --
    + verificarSenha(senha: String): Boolean {bcrypt.compare}
  }

  class Auditoria {
    - id: Integer {PK}
    - usuario_id: Integer {FK -> Usuario.id, nullable}
    - entidade: String {ex: "evento","categoria"}
    - entidade_id: Integer
    - acao: String {CREATE,UPDATE,DELETE,STATUS_CHANGE}
    - status_anterior: String {nullable}
    - status_novo: String {nullable}
    - timestamp: DateTime {default=NOW()}
  }

  Categoria "1" -- "0..*" Evento : categoriza >\n{categoria_id FK, OnDelete=RESTRICT}
  Usuario "1" -- "0..*" Auditoria : registra >
  Evento "1" -- "0..*" Auditoria : auditado >
}

package "Camada de Acesso a Dados :: Models" {
  class CategoriaModel {
    + create(dados): Promise<Categoria>
    + findAll(): Promise<Categoria[]>
    + findById(id): Promise<Categoria>
    + update(id, dados): Promise<Categoria>
    + delete(id): Promise<void>
    + existe(id): Promise<Boolean>
    + contarEventos(categoriaId): Promise<Integer>
  }
  class EventoModel {
    + create(dados): Promise<Evento>
    + findAll(filtros): Promise<Evento[]>
    + findById(id): Promise<Evento>
    + findByDia(data): Promise<Evento[]>
    + update(id, dados): Promise<Evento>
    + updateStatus(id, status): Promise<Evento>
    + delete(id): Promise<void>
  }
  class UsuarioModel {
    + findByEmail(email): Promise<Usuario>
    + findById(id): Promise<Usuario>
    + create(dados): Promise<Usuario>
  }
  class AuditoriaModel {
    + log(entrada): Promise<void>
    + findByEntidade(entidade, id): Promise<Auditoria[]>
  }

  CategoriaModel ..> Categoria : <<manages>>
  EventoModel ..> Evento : <<manages>>
  UsuarioModel ..> Usuario : <<manages>>
  AuditoriaModel ..> Auditoria : <<manages>>
}

package "Camada de Negócio :: Services" {
  class CategoriaService {
    + criar(dados): Promise<Categoria>
    + listar(): Promise<Categoria[]>
    + atualizar(id, dados): Promise<Categoria>
    + remover(id): Promise<void>
    - verificarUnicidade(nome): Promise<void> {throw 400}
    - verificarUso(id): Promise<void> {throw 409}
  }
  class EventoService {
    + criar(dados): Promise<Evento>
    + listar(filtros): Promise<Evento[]>
    + buscarPorId(id): Promise<Evento>
    + atualizar(id, dados): Promise<Evento>
    + atualizarStatus(id, novoStatus, usuario): Promise<Evento>
    + remover(id, usuario): Promise<void>
    - validarIntervalo(data_inicio, data_fim): void {throw 422}
    - validarTransição(atual, novo): void {throw 422}
    - verificarCategoria(categoria_id): Promise<void>
  }
  class AuthService {
    + autenticar(email, senha): Promise<{token, usuario}>
    + verificarToken(token): Object {jwt.verify}
    + gerarToken(usuario): String {jwt.sign}
    - hashSenha(senha): Promise<String> {bcrypt.hash}
  }

  CategoriaService --> CategoriaModel : <<uses>>
  EventoService --> EventoModel : <<uses>>
  EventoService --> CategoriaModel : <<uses>>
  AuthService --> UsuarioModel : <<uses>>
}

package "Camada de Apresentação :: Controllers & Middlewares" {
  class CategoriaController {
    + criar(req, res, next): Promise<void> {201}
    + listar(req, res, next): Promise<void> {200}
    + buscarPorId(req, res, next): Promise<void>
    + atualizar(req, res, next): Promise<void>
    + remover(req, res, next): Promise<void> {204/409}
  }
  class EventoController {
    + criar(req, res, next): Promise<void>
    + listar(req, res, next): Promise<void>
    + listarPorDia(req, res, next): Promise<void>
    + buscarPorId(req, res, next): Promise<void>
    + atualizar(req, res, next): Promise<void>
    + atualizarStatus(req, res, next): Promise<void>
    + remover(req, res, next): Promise<void>
  }
  class AuthController {
    + login(req, res, next): Promise<void> {200 + Set-Cookie}
    + verificar(req, res, next): Promise<void>
    + logout(req, res, next): Promise<void>
  }

  class AuthMiddleware {
    + handle(req, res, next): void {jwt.verify}
  }
  class SanitizeMiddleware {
    + categoria: ValidationChain[]
    + evento: ValidationChain[]
    + login: ValidationChain[]
    + status: ValidationChain[]
    + idParam: ValidationChain
  }
  class ErrorMiddleware {
    + handle(err, req, res, next): void
  }

  CategoriaController --> CategoriaService : <<uses>>
  EventoController --> EventoService : <<uses>>
  AuthController --> AuthService : <<uses>>
  AuthMiddleware ..> AuthService : <<uses>>
  SanitizeMiddleware ..> "express-validator" : <<uses>>
}

' Dependências entre camadas
CategoriaController ..> CategoriaService
EventoController ..> EventoService

note right of Evento
  Invariantes OCL:
  inv IntervaloVálido:
    self.data_fim >= self.data_inicio
  inv StatusVálido:
    Set{'pendente','em_andamento',
        'concluido','cancelado'}->includes(self.status)
  inv TransiçãoPermitida:
    (self.status='pendente' implies
      novoStatus in Set{'em_andamento','cancelado'}) and
    (self.status='em_andamento' implies
      novoStatus in Set{'concluido','cancelado'}) and
    (self.status='concluido' implies false) and
    (self.status='cancelado' implies false)
end note

note right of Categoria
  inv CorHEX:
    self.cor.matches('^#[0-9A-Fa-f]{6}$')
  inv NomeNãoVazio:
    self.nome.size() > 0 and self.nome.size() <= 80
end note

note bottom of AuthMiddleware
  Pré-condição OCL:
  context AuthMiddleware::handle(req)
  pre: req.headers.authorization->notEmpty()
       or req.cookies.token->notEmpty()
  pós: req.usuario->notEmpty() implies
       req.usuario.sub->notEmpty()
end note

@enduml
```

### 5.2 Invariantes OCL Detalhados (Object Constraint Language)

```ocl
-- Evento: invariantes de instância
context Evento
inv IntervaloValido: self.data_fim >= self.data_inicio

inv TituloValido: self.titulo.size() >= 1 and self.titulo.size() <= 200

inv CategoriaObrigatoria: self.categoria_id->notEmpty() and self.categoria_id > 0

inv CorPersonalizadaValida:
  self.cor_personalizada->notEmpty() implies
  self.cor_personalizada.matches('^#[0-9A-Fa-f]{6}$')

inv LembreteValido:
  Set{0,5,10,30,60,1440}->includes(self.lembrete_minutos)

inv RecorrenciaValida:
  Set{'unico','diario','semanal','mensal'}->includes(self.recorrencia)

inv StatusDominioValido:
  Set{'pendente','em_andamento','concluido','cancelado'}->includes(self.status)

-- Máquina de estados de status (pré/pós-condição de operação)
context Evento::atualizarStatus(novoStatus : String) : Boolean
pre TransicaoPermitida:
  (self.status = 'pendente' implies Set{'em_andamento','cancelado'}->includes(novoStatus)) and
  (self.status = 'em_andamento' implies Set{'concluido','cancelado'}->includes(novoStatus)) and
  (self.status = 'concluido' implies false) and  -- estado final
  (self.status = 'cancelado' implies false)      -- estado final
post StatusAtualizado:
  self.status = novoStatus

-- Categoria
context Categoria
inv NomeUnico: Categoria.allInstances()->isUnique(nome.toLower())

inv CorHEX: self.cor.matches('^#[0-9A-Fa-f]{6}$')

-- Auditoria
context Auditoria
inv TimestampImutavel: self.timestamp <= now()

-- AuthMiddleware
context AuthMiddleware::handle(req : Request)
pre TokenPresente: req.headers->exists(h | h.key = 'Authorization') or req.cookies->exists(c | c.key = 'token')
post UsuarioAutenticado: result = 401 implies req.usuario->isEmpty()
```

---

## 6. Dicionário Técnico de Dados — Esquema Físico DDL

### 6.1 DDL Completo — PostgreSQL 15+ (Portável para SQLite 3 com adaptações)

```sql
-- =============================================================================
-- DDL Sistema Rotinas Pessoais — PostgreSQL 15+
-- Compatível com SQLite 3 (ver notas de portabilidade)
-- =============================================================================

-- Extensão para UUID (opcional, se usar UUID em vez de SERIAL)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabela: categorias
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
    id              SERIAL PRIMARY KEY,  -- SQLite: INTEGER PRIMARY KEY AUTOINCREMENT
    nome            VARCHAR(80) NOT NULL,
    cor             VARCHAR(7) NOT NULL,
    icone           VARCHAR(50) NOT NULL,
    data_criacao    TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- SQLite: DATETIME DEFAULT CURRENT_TIMESTAMP
    -- Constraints
    CONSTRAINT chk_categorias_cor_hex CHECK (cor ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_categorias_nome_tamanho CHECK (char_length(nome) BETWEEN 1 AND 80),
    CONSTRAINT chk_categorias_icone_tamanho CHECK (char_length(icone) BETWEEN 1 AND 50)
);

-- Unicidade case-insensitive (PostgreSQL)
CREATE UNIQUE INDEX IF NOT EXISTS uq_categorias_nome_lower ON categorias (LOWER(nome));
-- SQLite equivalente: CREATE UNIQUE INDEX uq_categorias_nome_lower ON categorias (LOWER(nome));

-- Índice de performance para listagem ordenada
CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias (nome ASC);

-- Comentários
COMMENT ON TABLE categorias IS 'Categorias de rotinas (Estudantil, Doméstico, Trabalho)';
COMMENT ON COLUMN categorias.cor IS 'Cor HEX #RRGGBB validada por CHECK ^#[0-9A-Fa-f]{6}$';

-- ---------------------------------------------------------------------------
-- Tabela: usuarios (autenticação)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    senha_hash      VARCHAR(255) NOT NULL, -- bcrypt hash $2b$12$...
    role            VARCHAR(20) NOT NULL DEFAULT 'usuario',
    data_criacao    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_usuarios_role CHECK (role IN ('usuario','admin')),
    CONSTRAINT chk_usuarios_email CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email_lower ON usuarios (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios (role);

-- Seed admin (senha: Admin@123 — hash bcrypt com salt 12)
-- INSERT INTO usuarios (email, senha_hash, role) VALUES
-- ('admin@ifmt.edu.br', '$2b$12$...hash...', 'admin');

-- ---------------------------------------------------------------------------
-- Tabela: eventos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
    id                  SERIAL PRIMARY KEY,
    titulo              VARCHAR(200) NOT NULL,
    descricao           TEXT,
    categoria_id        INTEGER NOT NULL,
    data_inicio         TIMESTAMPTZ NOT NULL,
    data_fim            TIMESTAMPTZ NOT NULL,
    convidados          TEXT, -- CSV de e-mails
    cor_personalizada   VARCHAR(7),
    lembrete_minutos    INTEGER NOT NULL DEFAULT 10,
    alarme_sonoro       VARCHAR(100),
    recorrencia         VARCHAR(20) NOT NULL DEFAULT 'unico',
    status              VARCHAR(20) NOT NULL DEFAULT 'pendente',
    data_criacao        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- FK
    CONSTRAINT fk_eventos_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    -- CHECKs
    CONSTRAINT chk_eventos_titulo CHECK (char_length(titulo) BETWEEN 1 AND 200),
    CONSTRAINT chk_eventos_intervalo CHECK (data_fim >= data_inicio),
    CONSTRAINT chk_eventos_cor_personalizada CHECK (
        cor_personalizada IS NULL OR cor_personalizada ~ '^#[0-9A-Fa-f]{6}$'
    ),
    CONSTRAINT chk_eventos_lembrete CHECK (lembrete_minutos IN (0,5,10,30,60,1440)),
    CONSTRAINT chk_eventos_recorrencia CHECK (recorrencia IN ('unico','diario','semanal','mensal')),
    CONSTRAINT chk_eventos_status CHECK (status IN ('pendente','em_andamento','concluido','cancelado')),
    CONSTRAINT chk_eventos_alarme_tamanho CHECK (
        alarme_sonoro IS NULL OR char_length(alarme_sonoro) BETWEEN 1 AND 100
    )
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_eventos_categoria_id ON eventos (categoria_id);
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos (data_inicio ASC);
CREATE INDEX IF NOT EXISTS idx_eventos_data_fim ON eventos (data_fim ASC);
CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos (status);
CREATE INDEX IF NOT EXISTS idx_eventos_recorrencia ON eventos (recorrencia);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria_data ON eventos (categoria_id, data_inicio);
-- Índice para filtro por dia (DATE)
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio_date ON eventos (DATE(data_inicio));

-- Comentários
COMMENT ON TABLE eventos IS 'Eventos/compromissos agendados com recorrência e alarmes';
COMMENT ON COLUMN eventos.convidados IS 'Lista CSV de e-mails, validada por regex no app';
COMMENT ON COLUMN eventos.lembrete_minutos IS 'Minutos de antecedência para notificação: 0,5,10,30,60,1440';

-- ---------------------------------------------------------------------------
-- Tabela: auditoria
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditoria (
    id                  SERIAL PRIMARY KEY,
    usuario_id          INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    entidade            VARCHAR(50) NOT NULL, -- 'evento' | 'categoria'
    entidade_id         INTEGER NOT NULL,
    acao                VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE, STATUS_CHANGE
    status_anterior     VARCHAR(20),
    status_novo         VARCHAR(20),
    detalhes            JSONB, -- SQLite: TEXT (JSON)
    timestamp           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_auditoria_acao CHECK (acao IN ('CREATE','UPDATE','DELETE','STATUS_CHANGE')),
    CONSTRAINT chk_auditoria_entidade CHECK (entidade IN ('evento','categoria','usuario'))
);

CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria (entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria (usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON auditoria (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_acao ON auditoria (acao);

-- ---------------------------------------------------------------------------
-- Seed de categorias padrão
-- ---------------------------------------------------------------------------
INSERT INTO categorias (nome, cor, icone) VALUES
('Estudantil', '#20F9AD', 'FaGraduationCap'),
('Serviços Domésticos', '#3b82f6', 'FaHome'),
('Trabalho', '#f59e0b', 'FaBriefcase')
ON CONFLICT DO NOTHING; -- SQLite: INSERT OR IGNORE

-- ---------------------------------------------------------------------------
-- Notas de Portabilidade SQLite 3
-- ---------------------------------------------------------------------------
-- 1. SERIAL -> INTEGER PRIMARY KEY AUTOINCREMENT
-- 2. TIMESTAMPTZ -> DATETIME
-- 3. VARCHAR(n) -> TEXT com CHECK(char_length(col) <= n)
-- 4. ~ (regex) -> GLOB ou validação via app (SQLite CHECK com LIKE/GLOB limitado)
--    Alternativa: manter CHECK com app-level validation + trigger
-- 5. JSONB -> TEXT
-- 6. LOWER() index funciona em ambos
-- 7. PRAGMAs SQLite recomendados na conexão:
--    PRAGMA journal_mode=WAL;
--    PRAGMA foreign_keys=ON;
--    PRAGMA busy_timeout=5000;
--    PRAGMA synchronous=NORMAL;
```

### 6.2 Dicionário Técnico de Dados (Tabelas)

#### Tabela `categorias`

| Coluna | Tipo (PG) | Tipo (SQLite) | Nulidade | Default | PK | FK | Índices | Constraint CHECK | Descrição |
|---|---|---|---|---|---|---|---|---|---|
| `id` | `SERIAL` | `INTEGER PK AI` | NOT NULL | auto | PK | — | PK | — | Identificador único |
| `nome` | `VARCHAR(80)` | `TEXT` | NOT NULL | — | — | — | `UNIQUE LOWER(nome)` + `idx_nome` | `char_length 1..80` | Nome da categoria; único case-insensitive |
| `cor` | `VARCHAR(7)` | `TEXT` | NOT NULL | — | — | — | — | `~ ^#[0-9A-Fa-f]{6}$` | Cor HEX #RRGGBB |
| `icone` | `VARCHAR(50)` | `TEXT` | NOT NULL | — | — | — | — | `1..50` | Identificador do ícone (ex: FaBook) |
| `data_criacao` | `TIMESTAMPTZ` | `DATETIME` | NOT NULL | `NOW()` | — | — | — | — | Timestamp de criação |

#### Tabela `eventos`

| Coluna | Tipo (PG) | Nulidade | Default | PK | FK | Índices | Constraint CHECK | Descrição |
|---|---|---|---|---|---|---|---|---|
| `id` | `SERIAL` | NOT NULL | auto | PK | — | PK | — | PK |
| `titulo` | `VARCHAR(200)` | NOT NULL | — | — | — | — | `1..200` | Título do evento |
| `descricao` | `TEXT` | NULL | NULL | — | — | — | — | Descrição detalhada |
| `categoria_id` | `INTEGER` | NOT NULL | — | — | FK → categorias.id RESTRICT | `idx_categoria` | `>0` | FK categoria |
| `data_inicio` | `TIMESTAMPTZ` | NOT NULL | — | — | — | `idx_data_inicio` | — | Início em UTC-3 |
| `data_fim` | `TIMESTAMPTZ` | NOT NULL | — | — | — | `idx_data_fim` | `data_fim >= data_inicio` | Fim; OCL invariante |
| `convidados` | `TEXT` | NULL | NULL | — | — | — | regex e-mail (app) | CSV e-mails |
| `cor_personalizada` | `VARCHAR(7)` | NULL | NULL | — | — | — | `NULL OR ^#[0-9A-Fa-f]{6}$` | Override cor categoria |
| `lembrete_minutos` | `INTEGER` | NOT NULL | `10` | — | — | — | `IN (0,5,10,30,60,1440)` | Antecedência notificação |
| `alarme_sonoro` | `VARCHAR(100)` | NULL | NULL | — | — | — | `1..100` | Arquivo de áudio |
| `recorrencia` | `VARCHAR(20)` | NOT NULL | `'unico'` | — | — | `idx_recorrencia` | `IN (unico,diario,semanal,mensal)` | Regra recorrência |
| `status` | `VARCHAR(20)` | NOT NULL | `'pendente'` | — | — | `idx_status` | `IN (pendente,em_andamento,concluido,cancelado)` | Máquina de estados |
| `data_criacao` | `TIMESTAMPTZ` | NOT NULL | `NOW()` | — | — | — | — | Criação |

#### Tabela `usuarios`

| Coluna | Tipo | Nulidade | Default | PK | FK | Índice | CHECK | Descrição |
|---|---|---|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL | auto | PK | — | PK | — | PK |
| `email` | VARCHAR(255) | NOT NULL | — | — | — | UNIQUE LOWER(email) | regex e-mail | Login |
| `senha_hash` | VARCHAR(255) | NOT NULL | — | — | — | — | length 60 (bcrypt) | Hash bcrypt |
| `role` | VARCHAR(20) | NOT NULL | 'usuario' | — | — | idx_role | IN (usuario,admin) | Papel RBAC |
| `data_criacao` | TIMESTAMPTZ | NOT NULL | NOW() | — | — | — | — | Criação |

#### Tabela `auditoria`

| Coluna | Tipo | Nulidade | Default | PK | FK | Índice | CHECK | Descrição |
|---|---|---|---|---|---|---|---|---|
| `id` | SERIAL | NOT NULL | auto | PK | — | PK | — | PK |
| `usuario_id` | INTEGER | NULL | NULL | — | FK usuarios.id SET NULL | idx_usuario | — | Quem executou |
| `entidade` | VARCHAR(50) | NOT NULL | — | — | — | idx_entidade | IN (evento,categoria,usuario) | Entidade afetada |
| `entidade_id` | INTEGER | NOT NULL | — | — | — | idx_entidade | — | ID da entidade |
| `acao` | VARCHAR(20) | NOT NULL | — | — | — | idx_acao | IN (CREATE,UPDATE,DELETE,STATUS_CHANGE) | Ação |
| `status_anterior` | VARCHAR(20) | NULL | NULL | — | — | — | — | Status antes |
| `status_novo` | VARCHAR(20) | NULL | NULL | — | — | — | — | Status depois |
| `detalhes` | JSONB/TEXT | NULL | NULL | — | — | — | — | Payload extra |
| `timestamp` | TIMESTAMPTZ | NOT NULL | NOW() | — | — | idx_timestamp | — | Quando |

---

## 7. Contratos de API RESTful

### 7.1 Convenções Globais

| Aspecto | Convenção |
|---|---|
| **Base URL** | `http://localhost:3000` (dev) — prefixo `/api` |
| **Protocolo** | HTTP/1.1 + JSON (`Content-Type: application/json; charset=utf-8`) |
| **Autenticação** | `Authorization: Bearer <jwt>` ou `Cookie: token=<jwt>` |
| **Códigos de Status** | `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request` (duplicidade), `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict` (FK), `422 Unprocessable Entity` (validação), `429 Too Many Requests`, `500 Internal Server Error`, `503 Service Unavailable` (DB down) |
| **Formato de Erro** | `{"erro":"Mensagem humana","codigo":"CODIGO_MAQUINA","detalhes":[...],"timestamp":"2026-09-03T...Z"}` |
| **Formato de Data** | ISO-8601 `YYYY-MM-DDTHH:mm:ss.sssZ` ou com offset `-03:00` — `TIMESTAMPTZ` |
| **Paginação** | `?page=1&limit=50` — resposta `{dados:[], total, page, limit}` + header `X-Total-Count` |
| **CORS** | `Access-Control-Allow-Origin: ORIGEM_PERMITIDA` + `Allow-Credentials: true` |
| **Segurança Headers** | `Helmet` adiciona `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy` |

### 7.2 Tabela Completa de Rotas Públicas (Sem Autenticação)

| # | Método | Rota | Descrição | Auth | Request Body / Params | Resposta Sucesso | Erros |
|---|---|---|---|---|---|---|---|
| **P-01** | `GET` | `/api/saude` | Health check; verifica pool DB | Não | — | `200 {status:"ok", timestamp, uptime, versao}` | `503` se DB down |
| **P-02** | `POST` | `/api/auth/login` | Autenticar e obter JWT | Não | `{"email","senha"}` | `200 {token, usuario}` + `Set-Cookie` | `401`, `422`, `429` |
| **P-03** | `POST` | `/api/categorias` | Criar categoria (público ou autenticado conforme config) | Opcional* | `{"nome","cor","icone"}` | `201 {categoria}` + `Location` | `400` dup, `422`, `401` |
| **P-04** | `GET` | `/api/categorias` | Listar todas categorias | Não | — | `200 [categorias]` | `500` |
| **P-05** | `GET` | `/api/categorias/:id` | Buscar categoria por ID | Não | `param id` | `200 {categoria}` | `404`, `400` |
| **P-06** | `POST` | `/api/eventos` | Criar evento (form público) | Opcional* | `Evento JSON` (ver RSF-02-01) | `201 {evento}` + `Location` | `422`, `404` cat, `400` |
| **P-07** | `GET` | `/api/eventos` | Listar eventos com filtros | Não | `?inicio&fim&categoria_id&status&page&limit` | `200 {dados,total,page,limit}` | `422` query inválida |
| **P-08** | `GET` | `/api/eventos/:id` | Buscar evento por ID | Não | `param id` | `200 {evento+join categoria}` | `404`, `400` |
| **P-09** | `GET` | `/api/eventos/dia/:data` | Eventos de um dia | Não | `param data YYYY-MM-DD` | `200 [eventos]` (vazio se nenhum) | `422` data inválida |

> * `P-03` e `P-06` podem ser configuradas como públicas (formulário público) ou protegidas; esta especificação as documenta como públicas para `RU-PUB-01`, mas o `authMiddleware` pode ser habilitado via flag `PROTEGER_CRUD=true`.

### 7.3 Tabela Completa de Rotas Administrativas Protegidas (Requer JWT)

| # | Método | Rota | Descrição | Auth | Role | Request | Resposta Sucesso | Erros |
|---|---|---|---|---|---|---|---|---|
| **A-01** | `GET` | `/api/auth/verificar` | Verificar validade do token | Bearer | qualquer | Header `Authorization` | `200 {valido:true, usuario}` | `401` |
| **A-02** | `POST` | `/api/auth/logout` | Invalidar cookie/sessão | Bearer/Cookie | qualquer | — | `200 {message:"Logout"}` + clear cookie | — |
| **A-03** | `PUT` | `/api/categorias/:id` | Atualizar categoria | Bearer | admin/usuario | `{"nome","cor","icone"}` | `200 {categoria}` | `401`, `404`, `400` dup, `422` |
| **A-04** | `DELETE` | `/api/categorias/:id` | Remover categoria (protegido, verifica FK) | Bearer | admin | `param id` | `204 No Content` | `401`, `403`, `404`, `409` em uso |
| **A-05** | `PUT` | `/api/eventos/:id` | Atualizar evento completo | Bearer | admin/usuario | `Evento JSON` | `200 {evento}` | `401`, `404`, `422` |
| **A-06** | `PATCH` | `/api/eventos/:id/status` | Alterar status (máquina de estados) | Bearer | **admin** | `{"status":"em_andamento"}` | `200 {evento}` | `401`, `403`, `404`, `422` transição inválida |
| **A-07** | `DELETE` | `/api/eventos/:id` | Excluir evento (duas etapas UX, auditoria) | Bearer | **admin** | `param id` | `204 No Content` | `401`, `403`, `404` |
| **A-08** | `GET` | `/api/auditoria` | Listar logs de auditoria | Bearer | admin | `?entidade&entidade_id&page&limit` | `200 [auditoria]` | `401`, `403` |

### 7.4 Exemplos de Payloads

#### Exemplo 1: Criar Evento — Request/Response

```http
POST /api/eventos HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "titulo": "Prova de Desenvolvimento Web",
  "descricao": "Avaliação sobre Node.js e Express",
  "categoria_id": 1,
  "data_inicio": "2026-09-05T08:00:00-03:00",
  "data_fim": "2026-09-05T10:00:00-03:00",
  "convidados": "joao@ifmt.edu.br, lara@ifmt.edu.br",
  "cor_personalizada": "#3b82f6",
  "lembrete_minutos": 30,
  "alarme_sonoro": "bip_alerta.mp3",
  "recorrencia": "unico"
}
```

```http
HTTP/1.1 201 Created
Location: /api/eventos/42
Content-Type: application/json

{
  "id": 42,
  "titulo": "Prova de Desenvolvimento Web",
  "descricao": "Avaliação sobre Node.js e Express",
  "categoria_id": 1,
  "data_inicio": "2026-09-05T11:00:00.000Z",
  "data_fim": "2026-09-05T13:00:00.000Z",
  "convidados": "joao@ifmt.edu.br, lara@ifmt.edu.br",
  "cor_personalizada": "#3b82f6",
  "lembrete_minutos": 30,
  "alarme_sonoro": "bip_alerta.mp3",
  "recorrencia": "unico",
  "status": "pendente",
  "data_criacao": "2026-09-03T12:00:00.000Z"
}
```

#### Exemplo 2: Erro de Validação — 422

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "erro": "Validação falhou",
  "codigo": "VALIDATION_ERROR",
  "detalhes": [
    {"campo": "data_fim", "mensagem": "data_fim deve ser posterior a data_inicio", "valor": "2026-09-05T07:00:00-03:00"},
    {"campo": "cor", "mensagem": "cor deve casar com ^#[0-9A-Fa-f]{6}$", "valor": "azul"}
  ],
  "timestamp": "2026-09-03T12:00:00Z"
}
```

#### Exemplo 3: Login — Request/Response

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{"email":"admin@ifmt.edu.br","senha":"Admin@123"}
```
```http
HTTP/1.1 200 OK
Set-Cookie: token=eyJhbG...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
Content-Type: application/json

{"token":"eyJhbG...","usuario":{"id":1,"email":"admin@ifmt.edu.br","role":"admin"}}
```

### 7.5 Códigos de Status — Mapa Semântico

| Código | Nome | Quando Usar | Corpo |
|---|---|---|---|
| `200` | OK | GET, PUT, PATCH bem-sucedidos | JSON do recurso |
| `201` | Created | POST bem-sucedido | JSON + `Location` |
| `204` | No Content | DELETE bem-sucedido | vazio |
| `400` | Bad Request | Duplicidade de nome, JSON malformado | `{erro, codigo}` |
| `401` | Unauthorized | Token ausente/inválido/expirado | `{erro:"Não autenticado"}` |
| `403` | Forbidden | Autenticado mas sem permissão (role) | `{erro:"Acesso negado"}` |
| `404` | Not Found | ID não existe | `{erro:"Recurso não encontrado"}` |
| `409` | Conflict | FK em uso (categoria com eventos) | `{erro, codigo:"FK_CONSTRAINT"}` |
| `422` | Unprocessable | Validação semântica (datas, enum, regex) | `{erro, detalhes:[...]}` |
| `429` | Too Many Requests | Rate limit excedido | `{erro, retryAfter}` |
| `500` | Internal Error | Exceção não tratada, falha de DB | `{erro:"Erro interno"}` (sem stack em prod) |
| `503` | Service Unavailable | Pool DB indisponível | `{erro:"Serviço temporariamente indisponível"}` |

---

## 8. Matriz Bidirecional de Rastreabilidade Técnica

### 8.1 Rastreabilidade RU → RSF/RSNF → UC → Componente → Rota → Tabela → Teste

| RU (Usuário) | RSF (Sistema) | RSNF | Caso de Uso | Componente Frontend (HTML5/JS) | Rota Backend (Express) | Controller/Service/Model | Tabela(s) | Critério de Teste |
|---|---|---|---|---|---|---|---|---|
| `RU-CAT-01` | `RSF-01-01` | `SEC-03, PER-01, ARC-02` | `UC-01` | `categoria-manager.html` + `categoria-manager.js` | `POST /api/categorias` | `categoriaController.criar` → `categoriaService` → `categoriaModel` | `categorias` | POST válido retorna 201; nome duplicado 400; cor inválida 422 |
| `RU-CAT-02` | `RSF-01-02, 01-03, 01-04, 01-05` | `REL-03` | `UC-01` | `categoria-manager.html` | `GET/PUT/DELETE /api/categorias` | `categoriaController.*` | `categorias`, `eventos` (FK check) | GET lista ordenada; DELETE em uso 409; DELETE livre 204 |
| `RU-EVT-01` | `RSF-02-01` | `SEC-03, PER-01, ARC-01/02` | `UC-02` | `evento-form.html` + `evento-form.js` | `POST /api/eventos` | `eventoController.criar` → `eventoService` → `eventoModel` + `categoriaModel` | `eventos`, `categorias`, `auditoria` | POST válido 201; data_fim<data_inicio 422; categoria 404; XSS escapado |
| `RU-EVT-02` | `RSF-02-05` | `SEC-03` | `UC-03` | `evento-form.html` | `PUT /api/eventos/:id` | `eventoController.atualizar` | `eventos` | PUT atualiza e retorna 200; 404 se inexistente |
| `RU-EVT-03` | `RSF-02-07` | `SEC-02, REL-02` | `UC-04` | `admin/eventos.html` + `modal.js` | `DELETE /api/eventos/:id` | `eventoController.remover` → `auditoriaModel` | `eventos`, `auditoria` | DELETE sem token 401; com token 204 + log auditoria |
| `RU-EVT-04` | `RSF-02-02, 02-03, 02-04` | `PER-01` | `UC-05` | `calendario.html` + `calendario.js` | `GET /api/eventos`, `GET /api/eventos/dia/:data` | `eventoController.listar/listarPorDia` | `eventos` | GET com filtro retorna subset; data inválida 422; vazio retorna [] |
| `RU-DSH-01` | `RSF-02-02` | `USA-01` | `UC-08` | `calendario.html` + `calendario.js` | `GET /api/eventos?inicio&fim` | `eventoController.listar` | `eventos`, `categorias` | Renderização dia/semana/mês correta |
| `RU-DSH-02` | `RSF-02-02, 02-04` | `PER-01` | `UC-09` | `dashboard.html` + `dashboard.js` | `GET /api/eventos/dia/:data` | `eventoController.listarPorDia` | `eventos` | Métricas calculadas corretamente |
| `RU-ALM-01` | `RSF-02-02, 02-04` (leitura) | `PER-04, REL-01` | `UC-10` | `alarm-manager.js` (Web Audio) | — (client-side, consome GET) | — | `eventos` (leitura) | Tick 1s dispara Audio em HH:mm ±1s |
| `RU-ALM-02` | `RSF-02-02` | `PER-04` | `UC-11` | `alarm-manager.js` | — | — | `eventos` | Lembrete em lembrete_minutos antes |
| `RU-AUTH-01` | `RSF-03-01, 03-02, 03-03` | `SEC-01, SEC-02` | `UC-12` | `login.html` + `login.js` | `POST /api/auth/login` | `authController.login` → `authService` → `usuarioModel` + `bcrypt` + `jwt` | `usuarios` | Login válido 200+token; inválido 401; rate limit 429 |
| `RU-AUTH-02` | `RSF-02-06` | `SEC-02, REL-02` | `UC-13` | `admin/eventos.html` | `PATCH /api/eventos/:id/status` | `eventoController.atualizarStatus` → `eventoService.validarTransição` → OCL | `eventos`, `auditoria` | Transição válida 200; inválida 422; sem token 401 |
| `RU-PUB-01` | `RSF-02-01` | `SEC-03, USA-02` | `UC-16` | `solicitar.html` + `form-publico.js` + `toast.js` | `POST /api/eventos` | `sanitizeMiddleware` → `eventoController` | `eventos` | Validação client <100ms; sanitização XSS; Toast 300ms |

### 8.2 Rastreabilidade Inversa (Tabela → Requisitos)

| Tabela/Artefato | Requisitos que a Afetam | Risco se Falhar |
|---|---|---|
| `categorias` | `RU-CAT-01/02`, `RSF-01-*` | Sem categorias, eventos não podem ser criados (FK) |
| `eventos` | `RU-EVT-*`, `RU-DSH-*`, `RU-ALM-*`, `RSF-02-*` | Core do sistema; falha afeta calendário, dashboard e alarmes |
| `usuarios` | `RU-AUTH-*`, `RSF-03-*` | Sem usuários, login e controle de acesso falham |
| `auditoria` | `RU-EVT-03`, `RU-AUTH-02`, `RSF-02-06/07` | Sem auditoria, perde rastreabilidade de alterações críticas |
| `Pool DB` | `RSNF-ARC-02`, `RSNF-PER-01` | Pool esgotado → 503; WAL desabilitado → concorrência degradada |
| `JWT / bcrypt` | `RSNF-SEC-01/02` | Segredo vazado ou hash fraco → comprometimento de contas |

---

## 9. Aprovação

| Papel | Nome | Assinatura | Data |
|---|---|---|---|
| **Arquiteto de Software** | Especialista UML 2.5.1 | _________________________ | 03/09/2026 |
| **Gerente de Projeto** | João Eduardo Sousa Ferreira | _________________________ | 03/09/2026 |
| **Desenvolvedora** | Lara Ohana Rodrigues Galvão | _________________________ | 03/09/2026 |
| **Orientador** | Prof. Carlos David Rocha de Souza | _________________________ | 03/09/2026 |

> **Status:** APROVADO PARA IMPLEMENTAÇÃO — Este documento é a referência técnica para implementação das rotas Express, middlewares, Services e DDL.

---

*Fim do documento `requisitos_de_sistema.md` — v2.0.0 — 03/09/2026*
