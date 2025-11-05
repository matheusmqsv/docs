
import sqlite3, numpy as np, faiss
from sentence_transformers import SentenceTransformer

DB      = "rag_min.db"
INDEX   = "faiss.index"
IDS_NPY = "ids.npy"
MODEL   = "all-MiniLM-L6-v2"

class MiniSearch:
    def __init__(self):
        self.conn  = sqlite3.connect(DB)
        self.index = faiss.read_index(INDEX)
        self.ids   = np.load(IDS_NPY)
        self.model = SentenceTransformer(MODEL)

    def search(self, query: str, k: int = 4):
        q = self.model.encode([query], normalize_embeddings=True).astype("float32")
        D, I = self.index.search(q, k)
        sqlite_ids = self.ids[I[0]]
        out = []
        cur = self.conn.cursor()
        for score, rid in zip(D[0], sqlite_ids):
            cur.execute("SELECT text FROM docs WHERE id=?", (int(rid),))
            row = cur.fetchone()
            if row:
                out.append({"id": int(rid), "score": float(score), "text": row[0]})
        return out

if __name__ == "__main__":
    ms = MiniSearch()
    for r in ms.search("Atividades relaxantes pela manhã", k=3):
        print(f"score={r['score']:.3f} | {r['text']}")
