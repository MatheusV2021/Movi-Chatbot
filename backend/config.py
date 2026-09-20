import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

PASTA_BACKEND = Path(__file__).resolve().parent

BASE_CONHECIMENTO = PASTA_BACKEND / "base_de_conhecimento"
BASE_VETORIAL = PASTA_BACKEND / "base_vetorial"

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

MODELO_LLM = "openai/gpt-oss-120b"
MODELO_EMBEDDING = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

TAMANHO_CHUNK = 800
SOBREPOSICAO_CHUNK = 150

QUANTIDADE_RESULTADOS = 4
