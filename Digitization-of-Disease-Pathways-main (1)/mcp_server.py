import os
from typing import Optional
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

# We import the required modules from the existing codebase
from rag_tools import AdvancedRAG
from langchain_ollama import OllamaEmbeddings
from database import DatabaseOperations, get_db
from csv_utils import get_csv_cache_status, create_csv_cache, get_csv_file_info
from main import VECTOR_STORES

# Initialize the MCP Server
mcp = FastMCP("Disease Pathway MCP Server")

# Initialize our Advanced RAG with the Ollama embeddings model
embeddings = OllamaEmbeddings(model="tinyllama")
advanced_rag = AdvancedRAG(embeddings_model=embeddings)


@mcp.tool()
async def search_pathway_vectors(query: str, disease_name: Optional[str] = None) -> str:
    """
    Search the vector store using Advanced RAG (Hybrid Search + Reranking) for a specific disease or globally.
    """
    key = (disease_name or "").lower() if disease_name else "global"
    store = VECTOR_STORES.get(key) or VECTOR_STORES.get("global")
    
    if not store:
        return f"No vector store found for '{disease_name}'."
        
    try:
        # Perform advanced hybrid search with reranking
        results = advanced_rag.perform_hybrid_search(query=query, faiss_store=store, k=5)
        
        if not results:
            return "No relevant information found."
            
        context = ""
        for i, res in enumerate(results):
            score = res.get('relevance_score', 0)
            context += f"--- Result {i+1} (Score: {score:.2f}) ---\n{res['text']}\n"
            
        return context
    except Exception as e:
        return f"Error during vector search: {str(e)}"


@mcp.tool()
async def get_full_disease_context(disease_name: str) -> str:
    """
    Get the full disease context directly from the database for comprehensive summaries.
    """
    try:
        # For simplicity in this demo, we'll open a session temporarily
        from database import SessionLocal
        db = SessionLocal()
        
        db_ops = DatabaseOperations(db)
        pathway_data = db_ops.get_disease_pathway_data_for_csv(disease_name.lower())
        
        if not pathway_data:
            db.close()
            return f"No database data found for '{disease_name}'"
            
        context_summary = f"Full Pathway Data for {disease_name}:\n"
        
        for stage_name, stage in pathway_data.get('stages', {}).items():
            context_summary += f"Stage: {stage.get('name', stage_name)}; Overview: {stage.get('overview','')}\n"
            for pp in stage.get('pain_points', []):
                context_summary += f"- PainPoint: {pp.get('description','')}\n"
                
        db.close()
        return context_summary
    except Exception as e:
        return f"Error generating DB context: {str(e)}"


@mcp.tool()
async def generate_pathway_csv(disease_name: str) -> str:
    """
    Generates or retrieves a cached CSV export for the specified disease.
    Returns the path to the CSV file or an error message.
    """
    try:
        from database import SessionLocal
        db = SessionLocal()
        db_ops = DatabaseOperations(db)
        
        disease = db_ops.get_disease_by_name(disease_name.lower())
        
        if not disease:
            db.close()
            return f"Disease '{disease_name}' not found"

        cache_valid, cached_file_path = get_csv_cache_status(
            disease_name.lower(),
            disease.updated_at
        )
        
        if not cache_valid:
            pathway_data = db_ops.get_disease_pathway_data_for_csv(disease_name.lower())
            success, message, file_path = create_csv_cache(disease_name.lower(), pathway_data)
            db.close()
            if success:
                return f"Successfully generated new CSV at: {file_path}"
            else:
                return f"Failed to generate CSV: {message}"
        else:
            db.close()
            return f"Using cached CSV at: {cached_file_path}"
    except Exception as e:
        return f"Error generating CSV: {str(e)}"
        
@mcp.tool()
async def list_available_diseases() -> str:
    """
    List all the diseases currently available in the database.
    Use this to see what diseases the user can ask about.
    """
    try:
        from database import SessionLocal
        db = SessionLocal()
        db_ops = DatabaseOperations(db)
        
        diseases = db_ops.get_all_diseases()
        db.close()
        
        if not diseases:
            return "No diseases found in the database."
            
        disease_names = [d.name for d in diseases]
        return f"Available diseases: {', '.join(disease_names)}"
    except Exception as e:
        return f"Error listing diseases: {str(e)}"


@mcp.tool()
async def get_disease_statistics(disease_name: str) -> str:
    """
    Get summary statistics for a specific disease (number of stages, total pain points).
    """
    try:
        from database import SessionLocal
        db = SessionLocal()
        db_ops = DatabaseOperations(db)
        
        disease = db_ops.get_disease_by_name(disease_name.lower())
        
        if not disease:
            db.close()
            return f"Disease '{disease_name}' not found."
            
        total_stages = len(disease.stages)
        total_pain_points = sum(stage.pain_points_count for stage in disease.stages)
        
        db.close()
        return (f"Statistics for {disease_name}:\n"
                f"- Total Stages: {total_stages}\n"
                f"- Total Pain Points: {total_pain_points}")
    except Exception as e:
        return f"Error getting statistics: {str(e)}"


if __name__ == "__main__":
    # Start the MCP server using stdio transport
    mcp.run()
