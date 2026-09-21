from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

from config import (
    BASE_VETORIAL,
    MODELO_EMBEDDING,
    QUANTIDADE_RESULTADOS
)


_base = None


def carregar_base():
    global _base

    if _base is not None:
        return _base

    if not BASE_VETORIAL.exists():
        raise FileNotFoundError(
            "A base vetorial ainda não existe. Execute primeiro: python ingest.py"
        )

    embeddings = HuggingFaceEmbeddings(
        model_name=MODELO_EMBEDDING,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    _base = FAISS.load_local(
        str(BASE_VETORIAL),
        embeddings,
        allow_dangerous_deserialization=True
    )

    return _base


def buscar_contexto(pergunta):
    base = carregar_base()

    documentos = base.similarity_search(
        pergunta,
        k=QUANTIDADE_RESULTADOS
    )

    resultados = []

    for documento in documentos:
        resultados.append({
            "texto": documento.page_content,
            "arquivo": documento.metadata.get("arquivo", "Desconhecido"),
            "categoria": documento.metadata.get("categoria", "Desconhecida"),
            "pagina": documento.metadata.get("page")
        })

    return resultados
