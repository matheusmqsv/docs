
# RAG Course (Vanilla + LangChain)

Este projeto acompanha a evolução didática:
1) **FAISS Only** – busca semântica (sem SQLite/LLM)
2) **FAISS + SQLite** – persistência mínima (apenas `text`), FAISS retorna IDs, SQLite devolve os textos
3) **RAG Vanilla** – FAISS + SQLite + LLM (prompt enriquecido)
4) **RAG com LangChain** – mesmo conceito com menos "cola" de código

## Requisitos gerais
- Python 3.10+
- `pip install -r requirements.txt` em cada pasta (ou copie as libs de forma global)

## Etapas

### 01 — FAISS Only
```
cd 01-faiss-only
pip install -r requirements.txt
python faiss_only.py
```

### 02 — FAISS + SQLite
```
cd 02-faiss-sqlite
pip install -r requirements.txt
python ingest.py
python engine.py
```

### 03 — RAG Vanilla (FAISS + SQLite + LLM)
```
cd 03-rag-vanilla
pip install -r requirements.txt
export OPENAI_API_KEY=...   # ou setx no Windows
python ingest.py            # (se ainda não rodou)
python chat.py
```

### 04 — RAG com LangChain
```
cd 04-rag-langchain
pip install -r requirements.txt
export OPENAI_API_KEY=...
python build_vectorstore.py
python qa.py
```

## Observações
- Usamos `IndexFlatIP` + `normalize_embeddings=True` → `D` é **score de similaridade** (cosine): **maior = melhor**.
- O SQLite guarda **apenas `text`** (simples e didático). Metadados/embeddings podem ser adicionados depois se quiser filtros.
- Para contextos maiores, ajuste `ctx_budget_tokens` na montagem do prompt (janela de contexto limita o total de tokens).
