
import sqlite3, numpy as np, faiss
from sentence_transformers import SentenceTransformer

DB      = "rag_min.db"
INDEX   = "faiss.index"
IDS_NPY = "ids.npy"
MODEL   = "all-MiniLM-L6-v2"

class RAGEngine:
    def __init__(self):
        self.conn  = sqlite3.connect(DB)
        self.index = faiss.read_index(INDEX)
        self.ids   = np.load(IDS_NPY)
        self.model = SentenceTransformer(MODEL)

    def retrieve(self, query: str, k: int = 4):
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
        return sorted(out, key=lambda x: x["score"], reverse=True)

    def assemble_prompt(self, query: str, retrieved, ctx_budget_tokens=1500):
        def approx_tokens(s: str) -> int:
            return max(1, len(s)//4)

        sys = "Use APENAS os contextos para responder com precisão e objetividade. Se não souber, diga que não está no contexto."
        ctx_lines, used = [], 0
        for r in retrieved:
            line = f"- {r['text']}"
            t = approx_tokens(line)
            if used + t <= ctx_budget_tokens:
                ctx_lines.append(line); used += t
            else:
                break
        ctx = "CONTEXTOS:\n" + "\n".join(ctx_lines) if ctx_lines else "CONTEXTOS: (vazio)"
        usr = f"PERGUNTA:\n{query}"
        return "\n\n".join([sys, ctx, usr])
