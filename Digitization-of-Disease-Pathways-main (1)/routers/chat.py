from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import json
import asyncio
from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage

from database import get_db, ChatbotFeedback
import logging
import uuid
import numpy as np
import time

# Optional heavy ML imports — degrade gracefully if not installed
try:
    import faiss
    _ML_AVAILABLE = True
    logging.info("faiss loaded successfully.")
except ImportError:
    _ML_AVAILABLE = False
    logging.warning("faiss not installed. Semantic Cache disabled.")

# Import from shared_state to avoid circular imports with main.py
from shared_state import VECTOR_STORES, MEMORY_STORES
from rag_tools import AdvancedRAG
from multi_route_agent import MultiRouteAgent

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

class ChatRequest(BaseModel):
    message: str
    model: str = "llama"
    disease_name: str = None 
    session_id: str = "default_session"

class FeedbackRequest(BaseModel):
    message_index: int
    feedback_value: int
    user_query: str = None
    bot_response: str = None

# Initialize Global AI Models (Loaded once on startup)
advanced_rag = AdvancedRAG(None) # Embeddings not needed for hybrid search
routing_agent = MultiRouteAgent()

# ==========================================
# SEMANTIC CACHING SYSTEM (FAANG Optimization)
# ==========================================
class OllamaEmbeddingsWrapper:
    def __init__(self, model="nomic-embed-text"):
        from langchain_ollama import OllamaEmbeddings
        self.embeddings = OllamaEmbeddings(model=model)
    
    def encode(self, texts):
        import numpy as np
        emb = self.embeddings.embed_documents(texts)
        return np.array(emb, dtype=np.float32)

class SemanticCache:
    def __init__(self, threshold=0.90):
        if not _ML_AVAILABLE:
            self.enabled = False
            logging.warning("SemanticCache disabled — ML packages not available.")
            return
        self.enabled = True
        try:
            self.encoder = OllamaEmbeddingsWrapper('nomic-embed-text')
            dummy_emb = self.encoder.encode(['test'])
            self.dimension = dummy_emb.shape[1]
            self.index = faiss.IndexFlatIP(self.dimension) # Inner product for cosine sim
            self.cache_store = [] # Maps index to (query, response)
            self.threshold = threshold
        except Exception as e:
            logging.error(f"Failed to initialize OllamaEmbeddings: {e}")
            self.enabled = False
        
    def get(self, query: str):
        if not self.enabled or self.index.ntotal == 0:
            return None
            
        q_emb = self.encoder.encode([query])
        faiss.normalize_L2(q_emb)
        scores, indices = self.index.search(q_emb, 1)
        
        if scores[0][0] >= self.threshold:
            idx = indices[0][0]
            logging.info(f"Semantic Cache Hit! Score: {scores[0][0]:.3f}")
            return self.cache_store[idx][1]
        return None
        
    def put(self, query: str, response: str):
        if not self.enabled:
            return
        q_emb = self.encoder.encode([query])
        faiss.normalize_L2(q_emb)
        self.index.add(q_emb)
        self.cache_store.append((query, response))

# Global Cache Instance
semantic_cache = SemanticCache()

# ==========================================
# CIRCUIT BREAKER (SRE Reliability Pattern)
# ==========================================
class CircuitBreaker:
    def __init__(self, failure_threshold=3, recovery_timeout=30):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failures = 0
        self.last_failure_time = 0
        self.state = "CLOSED" # CLOSED, OPEN, HALF_OPEN
        
    def can_execute(self):
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN"
                return True
            return False
        return True # HALF_OPEN allows 1 test request

    def record_success(self):
        self.failures = 0
        self.state = "CLOSED"
        
    def record_failure(self):
        self.failures += 1
        self.last_failure_time = time.time()
        if self.failures >= self.failure_threshold:
            self.state = "OPEN"
            logging.error(f"CIRCUIT BREAKER OPENED! LLM is unreachable. Backing off for {self.recovery_timeout}s.")

llm_circuit_breaker = CircuitBreaker()

@router.post("")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """Streaming chat endpoint using LLaMA3 and FAISS Vector Search"""
    query = request.message
    disease_name = request.disease_name.lower() if request.disease_name else None
    
    # 0. Intercept greetings early to prevent vector search hallucinations
    import re
    import string
    
    # Strip whitespace and punctuation for greeting check
    q_clean = query.strip().lower().translate(str.maketrans('', '', string.punctuation))
    greetings = ['hi', 'hii', 'hello', 'hey', 'how are you', 'hi axon', 'hello axon', 'hlo', 'helo', 'heya', 'herllo', 'yo']
    
    is_greeting = False
    if q_clean in greetings:
        is_greeting = True
    elif any(q_clean.startswith(g) for g in ['hi ', 'hello ', 'hey ', 'yo ']) and len(q_clean) < 25:
        is_greeting = True
    elif re.match(r'^h[a-z]{0,4}ll?o+w?$', q_clean): # Catches hello, herllo, hallo, helo, hellow
        is_greeting = True
        
    if is_greeting:
        async def stream_greeting():
            yield "Hello! I am Axon, your medical AI assistant. I'm ready to help you brainstorm disease pathway logic. How can I assist you today?"
        return StreamingResponse(stream_greeting(), media_type="text/plain")

    # 1. Check Semantic Cache (Extremely Fast, bypasses LLM)
    cached_response = semantic_cache.get(query)
    if cached_response:
        async def stream_cache():
            yield cached_response
        return StreamingResponse(stream_cache(), media_type="text/plain")

    # 2. Retrieve context using Heavy Gen AI Multi-Route Agent
    context = ""
    sources = []
    
    async def vector_search_fn(q: str, d_name: str):
        logging.info(f"[DEBUG] vector_search_fn called with q={q!r}, d_name={d_name!r}")
        # 0. Check if user explicitly named a disease in the query
        query_lower = q.lower()
        explicit_d_name = None
        for name in VECTOR_STORES.keys():
            if name != "global" and name in query_lower:
                explicit_d_name = name
                break
                
        target_d_name = explicit_d_name or d_name
        logging.info(f"[DEBUG] target_d_name={target_d_name!r}")
        
        # 1. Try the target disease context first
        if target_d_name and target_d_name in VECTOR_STORES:
            vs = VECTOR_STORES[target_d_name]
            logging.info(f"[DEBUG] Running search on target_d_name={target_d_name}")
            results = advanced_rag.perform_hybrid_search(q, vs, k=5)
            if results:
                logging.info(f"[DEBUG] Results found in target_d_name={target_d_name}")
                return results
                
        # 2. If no results found, return empty. We do not aggressively fallback 
        # to searching other diseases to prevent hallucination. Explicit naming 
        # is already handled in step 0 above.
        return []

    try:
        route_result = await routing_agent.route(
            query=query, 
            db_session=db, 
            disease_name=disease_name, 
            vector_search_fn=vector_search_fn
        )
        route_type = route_result.get("route")
        data = route_result.get("data")
        
        if route_type == "sql":
            context = f"SQL Aggregation Results (Existing Solutions by Category):\n{json.dumps(data, indent=2)}\nUse this data to comprehensively answer the user's request."
            sources.append("SQL Database")
        elif route_type == "csv":
            context = f"Full CSV Dump Pathway Data:\n{json.dumps(data, indent=2)}\nSummarize or extract exactly what the user requested from this full dataset."
            sources.append("System CSV Export")
        else:
            # Vector route
            context_parts = []
            if data:
                for item in data:
                    txt = item['text'].strip()
                    src_str = item['metadata'].get('source', 'Unknown')
                    context_parts.append(f"[Source: {src_str}]\n{txt}")
                    sources.append(src_str)
                context = "\n\n".join(context_parts)
                sources = list(set(sources)) # Unique sources
            else:
                async def stream_no_context():
                    yield "I don't have enough information about that specific topic in my database to provide a reliable answer."
                return StreamingResponse(stream_no_context(), media_type="text/plain")
    except Exception as e:
        logging.error(f"Routing/Vector search failed: {e}")
        async def stream_error():
            yield "Unable to retrieve specific guidelines from the database."
        return StreamingResponse(stream_error(), media_type="text/plain")

    # 2. Build Memory (Session History)
    session_id = request.session_id
    if session_id not in MEMORY_STORES:
        MEMORY_STORES[session_id] = []
    
    # Keep last 5 turns (10 messages)
    history = MEMORY_STORES[session_id][-10:]

    # 3. Construct prompt
    system_prompt = f"""You are Axon, a medical AI assistant. Answer the user based ONLY on this information:

{context}

If the information does not contain the answer to their question, reply exactly: 'I don't know.'
Do not guess. Do not chat."""
    
    messages = [SystemMessage(content=system_prompt)]
    for msg in history:
        messages.append(msg)
    
    user_msg = HumanMessage(content=query)
    messages.append(user_msg)

    # Initialize LLM dynamically based on user choice
    MODEL_MAPPING = {"llama": "llama3", "tinyllama": "tinyllama"}
    selected_model = MODEL_MAPPING.get(request.model, "llama3")
    llm = ChatOllama(model=selected_model, temperature=0.0, stop=["User:", "User: ", "\nUser:"])

    # 4. Generate full response with Circuit Breaker
    if not llm_circuit_breaker.can_execute():
        logging.warning("Circuit breaker is OPEN. Rejecting LLM request instantly.")
        return StreamingResponse(
            (chunk for chunk in ["⚠️ The AI service is currently overloaded or down. Please try again in 30 seconds."]), 
            media_type="text/plain"
        )
        
    try:
        async def generate_and_cache():
            full_response = ""
            try:
                async for chunk in llm.astream(messages):
                    content = chunk.content
                    if content:
                        full_response += content
                        yield content
                llm_circuit_breaker.record_success()
            except Exception as stream_e:
                llm_circuit_breaker.record_failure()
                logging.error(f"Streaming error: {stream_e}")
                yield "\n\n[Connection to AI lost. Please try again.]"
                return
                
            # Save to memory and Semantic Cache after generation completes
            if full_response:
                MEMORY_STORES[session_id].append(user_msg)
                from langchain_core.messages import AIMessage
                MEMORY_STORES[session_id].append(AIMessage(content=full_response))
                semantic_cache.put(query, full_response)

        return StreamingResponse(generate_and_cache(), media_type="text/plain")
    except Exception as e:
        llm_circuit_breaker.record_failure()
        logging.error(f"Error in chat generation: {str(e)}")
        return {"response": "Error communicating with AI model."}

@router.post("/feedback")
async def chat_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    """Save user feedback (thumbs up/down) for a chatbot response"""
    try:
        new_feedback = ChatbotFeedback(
            message_index=req.message_index,
            user_query=req.user_query,
            bot_response=req.bot_response,
            feedback_value=req.feedback_value
        )
        db.add(new_feedback)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error saving feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to save feedback")
