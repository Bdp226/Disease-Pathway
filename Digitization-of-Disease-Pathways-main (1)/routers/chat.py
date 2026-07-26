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

# Import from shared_state to avoid circular imports with main.py
from shared_state import VECTOR_STORES, MEMORY_STORES

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

# Initialize ChatOllama globally for the router to reuse
llm = ChatOllama(model="tinyllama", temperature=0.2)

@router.post("")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """Streaming chat endpoint using LLaMA3 and FAISS Vector Search"""
    query = request.message
    disease_name = request.disease_name.lower() if request.disease_name else None
    
    # 1. Retrieve context
    context = ""
    sources = []
    
    if disease_name and disease_name in VECTOR_STORES:
        try:
            vs = VECTOR_STORES[disease_name]
            docs = vs.similarity_search(query, k=5)
            context_parts = []
            for d in docs:
                txt = d.page_content.strip()
                meta = d.metadata
                src_str = meta.get('source', 'Unknown')
                context_parts.append(f"[Source: {src_str}]\n{txt}")
                sources.append(src_str)
            context = "\n\n".join(context_parts)
            sources = list(set(sources)) # Unique sources
        except Exception as e:
            logging.error(f"Vector search failed: {e}")
            context = "Unable to retrieve specific guidelines from the vector store."
    else:
        context = "No specific disease context loaded. Provide general medical guidance based on standard clinical knowledge."

    # 2. Build Memory (Session History)
    session_id = request.session_id
    if session_id not in MEMORY_STORES:
        MEMORY_STORES[session_id] = []
    
    # Keep last 5 turns (10 messages)
    history = MEMORY_STORES[session_id][-10:]

    # 3. Construct prompt
    system_prompt = f"""You are Axon, a helpful and professional medical AI assistant.
Your task is to answer the user's query directly and concisely.

Context Information:
{context}

If the context contains the answer, use it. If not, rely on your general medical knowledge. Do not use emojis. Respond directly to the user without repeating these instructions.
"""
    
    messages = [SystemMessage(content=system_prompt)]
    for msg in history:
        messages.append(msg)
    
    user_msg = HumanMessage(content=query)
    messages.append(user_msg)

    # 4. Generate full response
    try:
        full_response = ""
        async for chunk in llm.astream(messages):
            content = chunk.content
            if content:
                full_response += content
                
        # Save to memory after generation
        MEMORY_STORES[session_id].append(user_msg)
        from langchain_core.messages import AIMessage
        MEMORY_STORES[session_id].append(AIMessage(content=full_response))
        
        return {"response": full_response}
    except Exception as e:
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
