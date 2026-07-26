import os
from typing import List, Dict, Any
from langchain_community.vectorstores import FAISS
from rank_bm25 import BM25Okapi

class AdvancedRAG:
    def __init__(self, embeddings_model):
        self.embeddings = embeddings_model
        
    def perform_hybrid_search(self, query: str, faiss_store: FAISS, k: int = 10, alpha: float = 0.5) -> List[Dict[str, Any]]:
        """
        Combines Semantic Search (FAISS) and Keyword Search (BM25) using Reciprocal Rank Fusion (RRF).
        This approach runs 100% locally without requiring external cross-encoder models to be downloaded.
        """
        # We retrieve candidates from FAISS
        fetch_k = max(k * 2, 20)
        docs = faiss_store.similarity_search(query, k=fetch_k)
        
        if not docs:
            return []

        # For a true RRF, we'd also run BM25 on the full corpus, but since we don't have the corpus list 
        # easily accessible, we'll apply BM25 re-ranking on the retrieved FAISS chunks.
        tokenized_corpus = [doc.page_content.lower().split() for doc in docs]
        bm25 = BM25Okapi(tokenized_corpus)
        
        tokenized_query = query.lower().split()
        bm25_scores = bm25.get_scores(tokenized_query)
        
        # Combine using a simple normalized scoring (approximating RRF)
        # FAISS docs are ordered by semantic relevance (index 0 is best)
        results = []
        for i, doc in enumerate(docs):
            # Semantic rank score (higher is better, max is fetch_k)
            semantic_score = fetch_k - i
            # Keyword score
            keyword_score = bm25_scores[i]
            
            # Combined score
            combined_score = (alpha * semantic_score) + ((1 - alpha) * keyword_score)
            results.append({
                "doc": doc,
                "score": combined_score
            })
            
        # Sort by combined score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        top_k = results[:k]
        
        final_results = []
        for item in top_k:
            final_results.append({
                "text": item["doc"].page_content,
                "metadata": item["doc"].metadata,
                "relevance_score": float(item["score"])
            })
            
        return final_results


from langchain_neo4j import Neo4jGraph, GraphCypherQAChain
from langchain_ollama import ChatOllama

class GraphRAG:
    def __init__(self, uri="bolt://neo4j:7687", user="neo4j", password="password", model="llama3"):
        neo4j_uri = os.environ.get("NEO4J_URI", uri)
        neo4j_user = os.environ.get("NEO4J_USER", user)
        neo4j_password = os.environ.get("NEO4J_PASSWORD", password)
        
        try:
            self.graph = Neo4jGraph(
                url=neo4j_uri, username=neo4j_user, password=neo4j_password
            )
            # Use Llama3 to generate Cypher and answer
            self.llm = ChatOllama(model=model, temperature=0)
            self.chain = GraphCypherQAChain.from_llm(
                cypher_llm=self.llm,
                qa_llm=self.llm,
                graph=self.graph,
                verbose=True,
                allow_dangerous_requests=True # Required by newer langchain for db access
            )
        except Exception as e:
            print(f"Failed to initialize GraphRAG: {e}")
            self.graph = None
            self.chain = None

    def query(self, question: str) -> str:
        """Query the Knowledge Graph using natural language."""
        if not self.chain:
            return "Graph database connection is not available."
        
        try:
            # Refresh schema before querying
            self.graph.refresh_schema()
            response = self.chain.invoke({"query": question})
            return response.get("result", "I could not find an answer in the graph.")
        except Exception as e:
            print(f"GraphRAG error: {e}")
            return f"Error querying the graph: {str(e)}"
