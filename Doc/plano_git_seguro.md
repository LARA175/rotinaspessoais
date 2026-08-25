Atue como um Engenheiro de DevSecOps Sênior especialista em segurança de repositórios e Git.

Preciso preparar e realizar o envio seguro do nosso projeto acadêmico do IFMT para um repositório no GitHub. É CRÍTICO que nenhuma chave de API, segredo JWT, senha de banco de dados ou dado sensível seja exposto no histórico do Git.

### Contexto do Projeto
- **Projeto:** Sistema Dinâmico de Gerenciamento de Rotinas (Estudantil IFMT, Doméstica e Trabalho)
- **Autores:** João Eduardo Sousa Ferreira e Lara Ohana Rodrigues Galvão (3º Ano B)
- **Orientador:** Prof. Carlos David Rocha de Souza
- **Instituição:** IFMT Campus Barra do Garças | **Disciplina:** Desenvolvimento Web
- **Tecnologias:** Python (MVC), React, SQLite e `.env` para configurações.

---

### Executar os Seguintes Passos de Segurança:

#### 1. Varredura do Código Fonte (Secret Detection)
- Varra todo o diretório do Backend e Frontend em busca de strings que pareçam credenciais hardcoded (chaves como `SECRET_KEY`, senhas de banco, tokens, URIs com usuário/senha).
- Se encontrar alguma chave em código-fonte, remova-a imediatamente e coloque a leitura via variável de ambiente (`os.getenv` em Python ou `import.meta.env` em React).

#### 2. Criação/Validação do Arquivo `.gitignore`
Gere ou atualize o arquivo `.gitignore` na raiz do repositório para garantir a exclusão de:
- Arquivos de configuração e ambiente (`.env`, `.env.local`, `.env.production`).
- Banco de dados SQLite local (`*.sqlite`, `*.sqlite3`, `*.db`).
- Pastas de dependências e builds (`node_modules/`, `__pycache__/`, `venv/`, `.venv/`, `dist/`, `build/`).
- Arquivos do sistema e IDEs (`.vscode/`, `.idea/`, `.DS_Store`).

#### 3. Criação do `.env.example` Seguro
- Crie um arquivo `.env.example` com os nomes de todas as variáveis usadas no sistema, preenchidas apenas com valores fictícios/exemplo (ex: `DATABASE_URL=sqlite:///app.db`, `JWT_SECRET=seu_segredo_aqui_123`).

#### 4. Verificação do Histórico do Git
- Verifique se os arquivos `.env` ou o arquivo de banco de dados SQLite foram commitados anteriormente no histórico do Git.
- Se já estiverem rastreados pelo Git, forneça os comandos para removê-los do cache do Git (`git rm --cached`) sem apagar o arquivo local.

#### 5. Script/Comandos para Upload Seguro
Após validar todos os passos acima, forneça a sequência exata de comandos Git para inicializar, realizar o commit com uma mensagem profissional e fazer o push para o repositório remoto no GitHub.

Execute a varredura e apresente o relatório de segurança junto com o arquivo `.gitignore` e os comandos necessários.