import os
import json
import numpy as np
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings
from langchain_community.llms import Ollama
from pydantic import BaseModel

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

def get_faiss_store(disease_name: str):
    store_path = f"vector_stores/{disease_name.lower()}"
    if not os.path.exists(store_path):
        raise HTTPException(status_code=404, detail=f"FAISS index for {disease_name} not found.")
    
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    faiss_store = FAISS.load_local(store_path, embeddings, allow_dangerous_deserialization=True)
    return faiss_store

class ClusterRequest(BaseModel):
    n_clusters: int = 3

@router.post("/{disease_name}/cluster")
async def cluster_pathways(disease_name: str, req: ClusterRequest):
    """
    Unsupervised Semantic Clustering (K-Means)
    Clusters the dense embeddings of pain points and solutions to find hidden clinical relationships.
    """
    faiss_store = get_faiss_store(disease_name)
    
    # Extract all embeddings and texts from FAISS
    vectors = []
    docs = []
    docstore = faiss_store.docstore._dict
    
    try:
        index_to_docstore_id = faiss_store.index_to_docstore_id
        for i, doc_id in index_to_docstore_id.items():
            vec = faiss_store.index.reconstruct(i)
            vectors.append(vec)
            docs.append(docstore[doc_id])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract embeddings: {str(e)}")
    
    if not vectors:
        raise HTTPException(status_code=400, detail="No data available for clustering.")
        
    X = np.array(vectors)
    
    # Run K-Means
    n_clusters = min(req.n_clusters, len(X))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
    labels = kmeans.fit_predict(X)
    
    clusters = {i: [] for i in range(n_clusters)}
    for i, label in enumerate(labels):
        doc = docs[i]
        clusters[label.item()].append({
            "content": doc.page_content[:150] + "...",
            "metadata": doc.metadata
        })
        
    return {
        "disease": disease_name,
        "n_clusters": n_clusters,
        "clusters": clusters
    }

class ClassifyRequest(BaseModel):
    text: str

@router.post("/classify")
async def classify_risk(req: ClassifyRequest):
    """
    Zero-Shot Clinical Risk Classification using LLaMA 3.
    """
    llm = Ollama(model="llama3")
    
    prompt = f"""
    You are an expert clinical AI. Classify the clinical risk/severity of the following healthcare pain point.
    Output ONLY one of the following labels: CRITICAL, HIGH, MODERATE, LOW. No other text.
    
    Pain Point: {req.text}
    Label:"""
    
    response = llm.invoke(prompt)
    label = response.strip().upper()
    
    # Cleanup possible extra text from the LLM
    valid_labels = ["CRITICAL", "HIGH", "MODERATE", "LOW"]
    final_label = "UNKNOWN"
    for valid in valid_labels:
        if valid in label:
            final_label = valid
            break
            
    return {
        "text": req.text,
        "risk_classification": final_label
    }

class RecommendRequest(BaseModel):
    query: str
    top_k: int = 3

@router.post("/{disease_name}/recommend")
async def recommend_solutions(disease_name: str, req: RecommendRequest):
    """
    Predictive Recommendation Engine.
    Uses cosine similarity on embeddings to recommend the most contextually relevant solutions.
    """
    faiss_store = get_faiss_store(disease_name)
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    
    # Perform similarity search with score
    results = faiss_store.similarity_search_with_score(req.query, k=req.top_k)
    
    recommendations = []
    for doc, score in results:
        # score in FAISS L2 distance; we convert to a pseudo-similarity percentage
        similarity_pct = max(0, 100 - (float(score) * 10)) 
        recommendations.append({
            "content": doc.page_content,
            "metadata": doc.metadata,
            "similarity_score": round(similarity_pct, 2)
        })
        
    return {
        "query": req.query,
        "recommendations": recommendations
    }
