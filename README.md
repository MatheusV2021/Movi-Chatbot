# Movi — Chatbot Educativo de Fisioterapia

O **Movi** é um assistente virtual educativo especializado em fisioterapia. O projeto utiliza **RAG (Retrieval-Augmented Generation)** para recuperar informações de uma base de conhecimento própria antes de gerar respostas, reduzindo respostas sem fundamento e mantendo o conteúdo relacionado aos documentos cadastrados.

> O Movi possui finalidade exclusivamente educativa. Ele não realiza diagnósticos, não prescreve tratamentos e não substitui a avaliação de um fisioterapeuta ou de outro profissional de saúde.

## Equipe desenvolvedora (Nome completo | RA):

- Matheus Vinnycius Vasconcelos de Santana | 00000855216
- Pedro Henrique Jerônimo da Silva | 00000855155
- Ludmylla Dias de Souza Santos | 00000855172


## Acesso ao projeto

- Frontend: [movi-chatbot.vercel.app](https://movi-chatbot.vercel.app)
- Documentação local da API: `http://127.0.0.1:8000/docs`

## Funcionalidades

- Autenticação com e-mail/senha e Google pelo Supabase Auth;
- Histórico de conversas vinculado ao usuário autenticado;
- Armazenamento de conversas e mensagens no Supabase;
- Recuperação semântica de conteúdo com FAISS;
- Respostas geradas pela Groq com contexto recuperado dos documentos;
- Fluxo conversacional organizado com LangGraph;
- Exibição das fontes utilizadas na resposta;
- Interface responsiva, tema claro/escuro e busca de conversas;
- Restrições contra diagnósticos, prescrições e tentativas de alteração das regras internas.

## Tecnologias

### Frontend

- HTML5;
- CSS3;
- JavaScript;
- Supabase Auth e Supabase Database;
- Vercel.

### Backend

- Python;
- FastAPI;
- LangGraph;
- LangChain;
- Groq;
- Hugging Face Embeddings;
- FAISS;
- PyPDF.

## Como o RAG funciona

1. Os PDFs são lidos e divididos em trechos menores.
2. Os trechos são convertidos em embeddings.
3. Os vetores são armazenados em uma base FAISS.
4. Quando uma pergunta é enviada, o sistema busca os trechos mais relacionados.
5. O contexto encontrado é encaminhado ao modelo de linguagem.
6. O Movi gera uma resposta curta e fundamentada nas fontes recuperadas.

## Base de conhecimento

A base está organizada por áreas da fisioterapia:

- Fisioterapia aquática;
- Geriatria;
- Neurologia;
- Ortopedia e traumatologia;
- Avaliação e correção postural;
- Prevenção de lesões;
- Fisioterapia respiratória;
- Informações institucionais sobre o Movi.

## Estrutura do projeto

```text
Movi-Chatbot/
├── backend/
│   ├── base_de_conhecimento/  # PDFs separados por categoria
│   ├── base_vetorial/         # Índices FAISS processados
│   ├── .env.example           # Exemplo de variável de ambiente
│   ├── app.py                 # API FastAPI
│   ├── config.py              # Configurações do backend
│   ├── ingest.py              # Processamento dos documentos
│   ├── LangGraph.py           # Fluxo conversacional e geração
│   ├── rag.py                 # Recuperação de contexto
│   └── requirements.txt       # Dependências Python
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   ├── img/
│   │   └── js/
│   └── index.html
├── LICENSE
└── README.md
```

## Requisitos

- Python 3.11 ou 3.12;
- Git;
- Uma chave de API da Groq;
- Um navegador moderno.

## Execução local do backend

Clone o repositório e entre na pasta do backend:

```bash
git clone https://github.com/MatheusV2021/Movi-Chatbot.git
cd Movi-Chatbot/backend
```

Crie o ambiente virtual:

```bash
python -m venv venv
```

Ative o ambiente no Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

No Linux ou macOS:

```bash
source venv/bin/activate
```

Instale as dependências:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Crie um arquivo `.env` dentro de `backend/`:

```env
GROQ_API_KEY=sua_chave_da_groq
```

> Nunca envie o arquivo `.env` ou uma chave real para o GitHub.

### Processar a base de conhecimento

O repositório já contém uma base vetorial processada. Execute a ingestão novamente apenas quando adicionar, remover ou alterar documentos:

```bash
python ingest.py
```

### Iniciar a API

```bash
python -m uvicorn app:app --reload
```

A API será disponibilizada em:

```text
http://127.0.0.1:8000
```

Rotas de teste:

- `GET /` — situação da API;
- `GET /health` — verificação de saúde;
- `POST /chat` — envio de perguntas;
- `GET /docs` — documentação interativa do FastAPI.

Exemplo de requisição para `POST /chat`:

```json
{
  "pergunta": "O que é fisioterapia aquática?",
  "historico": []
}
```

## Execução local do frontend

Com o backend rodando na porta `8000`, abra outro terminal na raiz do projeto e execute:

```bash
python -m http.server 5500 --directory frontend
```

Depois, acesse:

```text
http://127.0.0.1:5500
```

O endereço do backend usado pelo frontend está definido em `frontend/assets/js/app.js`:

```javascript
const API_URL = 'http://127.0.0.1:8000';
```

Para utilizar o frontend publicado, altere esse valor para a URL HTTPS do backend hospedado e faça um novo deploy.

## Deploy

Para publicar o backend como um serviço web:

```text
Build Command: pip install -r requirements.txt
Start Command: uvicorn app:app --host 0.0.0.0 --port $PORT
```

Cadastre `GROQ_API_KEY` como variável secreta na plataforma de hospedagem. A URL do frontend também deve estar presente em `allow_origins`, dentro de `backend/app.py`.

O backend utiliza embeddings locais e pode ultrapassar os limites de memória de planos gratuitos. Para ambientes com pouca RAM, considere gerar a base vetorial localmente e utilizar um serviço externo de embeddings.


