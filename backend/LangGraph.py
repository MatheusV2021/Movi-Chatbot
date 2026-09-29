import re
from typing import Dict, List, TypedDict

from langchain_groq import ChatGroq
from langgraph.graph import END, START, StateGraph

from config import GROQ_API_KEY, MODELO_LLM
from prompts import RESPOSTA_SEM_EVIDENCIA, montar_mensagens
from rag import buscar_contexto


class EstadoMovi(TypedDict):
    pergunta: str
    historico: List[Dict[str, str]]
    documentos: List[Dict]
    versao_prompt: str
    mensagens: list
    resposta: str


def eh_interacao_casual(pergunta):
    return bool(re.fullmatch(
        r"\s*(oi|olá|ola|bom dia|boa tarde|boa noite|obrigad[oa]|valeu|tchau|até mais)[!.?\s]*",
        pergunta, re.IGNORECASE,
    ))


def recuperar_contexto(state: EstadoMovi):
    if eh_interacao_casual(state["pergunta"]):
        return {"documentos": []}
    return {"documentos": buscar_contexto(state["pergunta"])}


def decidir_caminho(state: EstadoMovi):
    if eh_interacao_casual(state["pergunta"]):
        return "casual"
    return "montar_prompt" if state["documentos"] else "sem_evidencia"


def responder_casual(state: EstadoMovi):
    if re.match(r"\s*(obrigad|valeu)", state["pergunta"], re.IGNORECASE):
        return {"resposta": "Por nada! Se tiver dúvidas sobre fisioterapia, pode perguntar."}
    if re.match(r"\s*(tchau|até mais)", state["pergunta"], re.IGNORECASE):
        return {"resposta": "Até mais!"}
    return {"resposta": "Olá! Sou o Movi. Como posso ajudar com suas dúvidas sobre fisioterapia?"}


def responder_sem_evidencia(state: EstadoMovi):
    return {"resposta": RESPOSTA_SEM_EVIDENCIA}


def montar_prompt(state: EstadoMovi):
    return {"mensagens": montar_mensagens(
        state["pergunta"], state.get("historico", []), state["documentos"],
        state.get("versao_prompt", "zero_shot"),
    )}


def gerar_resposta(state: EstadoMovi):
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY não encontrada. Configure a chave no arquivo .env.")
    llm = ChatGroq(api_key=GROQ_API_KEY, model=MODELO_LLM, temperature=0.2)
    resposta = llm.invoke(state["mensagens"])
    return {"resposta": resposta.content}


def criar_grafo():
    grafo = StateGraph(EstadoMovi)
    grafo.add_node("recuperar_contexto", recuperar_contexto)
    grafo.add_node("responder_casual", responder_casual)
    grafo.add_node("responder_sem_evidencia", responder_sem_evidencia)
    grafo.add_node("montar_prompt", montar_prompt)
    grafo.add_node("gerar_resposta", gerar_resposta)
    grafo.add_edge(START, "recuperar_contexto")
    grafo.add_conditional_edges("recuperar_contexto", decidir_caminho, {
        "casual": "responder_casual",
        "sem_evidencia": "responder_sem_evidencia",
        "montar_prompt": "montar_prompt",
    })
    grafo.add_edge("responder_casual", END)
    grafo.add_edge("responder_sem_evidencia", END)
    grafo.add_edge("montar_prompt", "gerar_resposta")
    grafo.add_edge("gerar_resposta", END)
    return grafo.compile()


grafo_movi = criar_grafo()


def perguntar_movi(pergunta, historico=None, versao_prompt="zero_shot"):
    resultado = grafo_movi.invoke({
        "pergunta": pergunta, "historico": historico or [], "documentos": [],
        "versao_prompt": versao_prompt, "mensagens": [], "resposta": "",
    })
    return {"resposta": resultado["resposta"], "fontes": resultado["documentos"]}
