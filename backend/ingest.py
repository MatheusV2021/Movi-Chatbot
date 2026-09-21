from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from config import (
    BASE_CONHECIMENTO,
    BASE_VETORIAL,
    MODELO_EMBEDDING,
    TAMANHO_CHUNK,
    SOBREPOSICAO_CHUNK
)


def carregar_documentos():
    documentos = []

    arquivos_pdf = list(BASE_CONHECIMENTO.rglob("*.pdf"))

    if not arquivos_pdf:
        print("Nenhum PDF encontrado na base de conhecimento.")
        return []

    print(f"{len(arquivos_pdf)} PDFs encontrados.")

    for arquivo in arquivos_pdf:
        try:
            loader = PyPDFLoader(str(arquivo))
            paginas = loader.load()

            categoria = arquivo.parent.name

            for pagina in paginas:
                pagina.metadata["categoria"] = categoria
                pagina.metadata["arquivo"] = arquivo.name

            documentos.extend(paginas)

            print(f"Carregado: {arquivo.name}")

        except Exception as erro:
            print(f"Erro ao carregar {arquivo.name}: {erro}")

    return documentos


def criar_chunks(documentos):
    divisor = RecursiveCharacterTextSplitter(
        chunk_size=TAMANHO_CHUNK,
        chunk_overlap=SOBREPOSICAO_CHUNK,
        separators=["\n\n", "\n", ". ", " ", ""]
    )

    chunks = divisor.split_documents(documentos)

    print(f"{len(chunks)} chunks criados.")

    return chunks


def criar_base_vetorial(chunks):
    embeddings = HuggingFaceEmbeddings(
        model_name=MODELO_EMBEDDING,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )

    print("Gerando embeddings...")

    base = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings
    )

    BASE_VETORIAL.mkdir(parents=True, exist_ok=True)

    base.save_local(str(BASE_VETORIAL))

    print("Base vetorial criada com sucesso.")


def executar_ingestao():
    print("\nIniciando processamento da base...\n")

    documentos = carregar_documentos()

    if not documentos:
        return

    chunks = criar_chunks(documentos)

    criar_base_vetorial(chunks)

    print("\nProcessamento finalizado.")


if __name__ == "__main__":
    executar_ingestao()