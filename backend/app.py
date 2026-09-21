from typing import List, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from LangGraph import perguntar_movi


app = FastAPI(
    title="Movi API",
    description="API do chatbot educativo de fisioterapia Movi",
    version="1.0.0"
)


# Permite o frontend acessar a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MensagemHistorico(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class PerguntaRequest(BaseModel):
    pergunta: str
    historico: List[MensagemHistorico] = Field(default_factory=list)


@app.get("/")
def inicio():
    return {
        "status": "online",
        "mensagem": "API do Movi funcionando."
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.post("/chat")
def chat(dados: PerguntaRequest):
    pergunta = dados.pergunta.strip()

    if not pergunta:
        raise HTTPException(
            status_code=400,
            detail="A pergunta não pode estar vazia."
        )

    try:
        historico = [
            mensagem.model_dump()
            for mensagem in dados.historico
        ]

        resultado = perguntar_movi(
            pergunta=pergunta,
            historico=historico
        )

        return resultado

    except FileNotFoundError as erro:
        raise HTTPException(
            status_code=503,
            detail=str(erro)
        )

    except Exception as erro:
        print(f"Erro no chat: {erro}")

        raise HTTPException(
            status_code=500,
            detail="Não foi possível gerar a resposta do Movi."
        )
