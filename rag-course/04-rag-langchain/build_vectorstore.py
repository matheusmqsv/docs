
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.schema import Document

emb = OpenAIEmbeddings()

docs = [
    Document(page_content="Gosta de caminhar ao ar livre às 7h nos dias úteis."),
    Document(page_content="Prefere refeições leves durante a semana."),
    Document(page_content="Curte viagens para destinos com natureza, trilhas e cachoeiras."),
    Document(page_content="Costuma ouvir música clássica à noite para relaxar.")
]

vs = FAISS.from_documents(docs, emb)
vs.save_local("faiss_store")
print("[OK] VectorStore salvo em ./faiss_store")
