Atue como um Engenheiro de Software Sênior e Especialista em Documentação Técnica.

Preciso que você faça uma varredura completa em todo o diretório do projeto (Backend em Python e Frontend em React) para mapear o estado atual do código e gerar um arquivo `README.md` completo, fiel às funcionalidades existentes e altamente profissional.

### ⚠️ DIRETRIZ RIGOROSA DE SEGURANÇA (LEAK PREVENTION)
- NÃO exiba, em hipótese alguma, chaves de API, segredos JWT, senhas de banco de dados, URIs de conexão com credenciais ou tokens reais.
- Se você identificar qualquer credencial hardcoded nos arquivos de código durante a varredura, avise no início da resposta para que possamos movê-la para o arquivo `.env`.
- No `README.md`, documente apenas as variáveis de ambiente necessárias utilizando exemplos genéricos (ex: `CHAVE_SECRETA=sua_chave_secreta_aqui`).

### 1. Etapa de Análise (Varredura do Sistema)
Antes de escrever a documentação, analise a estrutura do projeto e verifique:
- **Backend (Python/MVC):** Rotas ativas, controladores, modelos de dados SQLite e middlewares configurados.
- **Frontend (React):** Componentes do Dashboard, integração com o Calendário, lógica do Alarme Sonoro, fuso horário (`UTC-3`) e formatação de datas (`dd/mm/yyyy` / `HH:mm`).
- **Contexto do Domínio:** Recursos implementados para gerenciar as rotinas Estudantis (IFMT), Domésticas e de Trabalho (Estágio/Freelance).

### 2. Informações Acadêmicas Fixas para o README.md
Adicione o bloco de identificação acadêmica no topo da documentação:
- **Projeto:** Sistema Dinâmico de Gerenciamento de Rotinas (IFMT)
- **Autores:** João Eduardo Sousa Ferreira e Lara Ohana Rodrigues Galvão
- **Turma:** 3º Ano B - Ensino Médio Técnico em Informática
- **Orientador:** Prof. Carlos David Rocha de Souza
- **Instituição:** Instituto Federal de Mato Grosso (IFMT) - Campus Barra do Garças
- **Disciplina:** Desenvolvimento Web

### 3. Estrutura do README.md a ser Gerado
1. **Cabeçalho Identificador:** Título, badge/status do projeto e identificação dos autores/IFMT.
2. **Visão Geral:** Objetivo do software e resumo da solução.
3. **Funcionalidades Mapeadas:** Lista detalhada de todos os recursos identificados na varredura (Dashboard, Calendário, Notificações/Alarmes, Categorias de Rotinas).
4. **Arquitetura & Tecnologias:** Explicação da estrutura MVC, tecnologias usadas (Python, React, SQLite) e padrões de regionalização (padrão brasileiro e UTC-3).
5. **Estrutura de Pastas:** Diagrama em árvore do projeto.
6. **Instalação e Execução:**
   - Requisitos prévios (Python 3.x, Node.js).
   - Comandos para subir o Backend e Frontend.
   - Instruções de cópia do arquivo `.env.example`.
7. **Boas Práticas de Segurança:** Explicação sobre o uso do `.env` e inclusão no `.gitignore`.

Faça a varredura e apresente o código Markdown completo para o arquivo `README.md`.