
from sentence_transformers import SentenceTransformer
import faiss, numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

texts = [
    "Gosta de caminhar ao ar livre às 7h nos dias úteis.",
    "Prefere refeições leves durante a semana.",
    "Curte viagens para destinos com natureza, trilhas e cachoeiras.",
    "Costuma ouvir música clássica à noite para relaxar."
]

# 1) Gera embeddings normalizados (cosine-friendly)
embs = model.encode(texts, normalize_embeddings=True).astype("float32")

# 2) Cria índice FAISS (Inner Product = cosine com vetores normalizados)
index = faiss.IndexFlatIP(embs.shape[1])
index.add(embs)

# 3) Consulta
query = "Atividades relaxantes pela manhã"
q = model.encode([query], normalize_embeddings=True).astype("float32")
D, I = index.search(q, k=3)  # top-3

print("Consulta:", query)
print("Resultados (score desc):")
for score, idx in sorted(zip(D[0], I[0]), reverse=True):
    print(f"- score={score:.3f} | {texts[idx]}")
