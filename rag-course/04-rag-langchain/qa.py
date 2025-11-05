
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA

emb = OpenAIEmbeddings()
vs = FAISS.load_local("faiss_store", emb, allow_dangerous_deserialization=True)

retriever = vs.as_retriever(search_kwargs={"k": 4})
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)

qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

query = "Quais atividades relaxantes posso fazer cedo no sábado?"
print(qa.invoke({"query": query})["result"])
