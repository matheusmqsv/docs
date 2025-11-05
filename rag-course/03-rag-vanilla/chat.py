
import os
from engine import RAGEngine
from openai import OpenAI  # pip install openai

def ask_llm(prompt: str) -> str:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role":"system","content":"Você é um assistente útil e objetivo."},
            {"role":"user","content": prompt}
        ],
        temperature=0.2,
    )
    return resp.choices[0].message.content

if __name__ == "__main__":
    rag = RAGEngine()
    query = "Quais atividades relaxantes posso fazer cedo no sábado?"
    retrieved = rag.retrieve(query, k=4)
    prompt = rag.assemble_prompt(query, retrieved)
    print("\n--- PROMPT ENRIQUECIDO ---\n", prompt[:800], "...\n")
    answer = ask_llm(prompt)
    print("\n=== RESPOSTA ===\n", answer)
