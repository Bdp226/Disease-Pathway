import json
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_ollama import ChatOllama
from models import PainPointCreate
from typing import List, Dict, Any

def verify_pain_point(disease_name: str, stage_name: str, new_pain_point: PainPointCreate, existing_descriptions: List[str]) -> Dict[str, Any]:
    """
    Uses ChatOllama to verify a new pain point.
    Checks for duplicates and clinical relevance.
    Returns a dict with 'approved' (bool) and 'reason' (str).
    """
    llm = ChatOllama(model="llama3", temperature=0, format="json", num_ctx=8192)
    
    existing_list_str = "\n".join([f"- {desc}" for desc in existing_descriptions])
    
    system_prompt = (
        "You are an expert medical AI assistant specialized in evaluating disease pathway pain points.\n"
        "Your task is to review a newly proposed pain point for a specific disease stage.\n"
        "You must output ONLY valid JSON matching this schema:\n"
        "{\n"
        '  "approved": boolean,\n'
        '  "reason": "string explaining why"\n'
        "}\n\n"
        "CRITERIA FOR REJECTION:\n"
        "1. DUPLICATE: The pain point is semantically identical or extremely similar to an existing pain point in the list.\n"
        "2. IRRELEVANT: The pain point is completely nonsensical or clearly unrelated to a clinical or process issue for the specified disease.\n\n"
        "If it is valid and not a duplicate, set approved to true."
    )
    
    user_prompt = (
        f"DISEASE: {disease_name}\n"
        f"STAGE: {stage_name}\n\n"
        f"EXISTING PAIN POINTS IN THIS STAGE:\n"
        f"{existing_list_str if existing_descriptions else 'None'}\n\n"
        f"PROPOSED NEW PAIN POINT:\n"
        f"Description: {new_pain_point.description}\n"
        f"Sources: {new_pain_point.sources or 'N/A'}\n"
        f"Coverage: {new_pain_point.coverage or 'N/A'}\n"
        f"Existing Solutions: {new_pain_point.existing_solutions or 'N/A'}\n\n"
        "Evaluate the proposed new pain point and return the JSON."
    )
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]
    
    try:
        response = llm.invoke(messages)
        # Parse JSON
        result = json.loads(response.content)
        return {
            "approved": result.get("approved", False),
            "reason": result.get("reason", "No reason provided by LLM.")
        }
    except Exception as e:
        # If the AI verification service (Ollama) is unavailable,
        # auto-approve the pain point rather than blocking the user.
        return {
            "approved": True,
            "reason": f"Auto-approved (AI verification unavailable: {str(e)})",
            "severity": "medium",
            "tags": []
        }
