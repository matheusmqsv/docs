
import sqlite3, numpy as np
from sentence_transformers import SentenceTransformer
import faiss

DB      = "rag_min.db"
INDEX   = "faiss.index"
IDS_NPY = "ids.npy"
MODEL   = "all-MiniLM-L6-v2"

def ensure_schema():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS docs (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL
    )""")
    conn.commit(); conn.close()

def ingest_texts(text_list):
    ensure_schema()
    conn = sqlite3.connect(DB); cur = conn.cursor()
    for t in text_list:
        cur.execute("INSERT INTO docs(text) VALUES (?)", (t,))
    conn.commit()

    cur.execute("SELECT id, text FROM docs")
    rows = cur.fetchall()
    conn.close()

    ids   = np.array([r[0] for r in rows], dtype=np.int64)
    texts = [r[1] for r in rows]

    model = SentenceTransformer(MODEL)
    embs  = model.encode(texts, normalize_embeddings=True).astype("float32")

    index = faiss.IndexFlatIP(embs.shape[1])
    index.add(embs)

    faiss.write_index(index, INDEX)
    np.save(IDS_NPY, ids)
    print(f"[OK] ingestão: {len(texts)} textos, índice salvo ({INDEX}), ids salvos ({IDS_NPY})")

if __name__ == "__main__":
    ingest_texts([
        "Gosta de caminhar ao ar livre às 7h nos dias úteis.",
        "Prefere refeições leves durante a semana.",
        "Curte viagens para destinos com natureza, trilhas e cachoeiras.",
        "Costuma ouvir música clássica à noite para relaxar."
    ])
