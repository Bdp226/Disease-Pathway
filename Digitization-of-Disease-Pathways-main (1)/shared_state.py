"""
Shared in-memory state for vector stores and conversation memory.
Using a separate module avoids circular imports between main.py and routers.
"""

# FAISS vector stores keyed by disease name
VECTOR_STORES = {}

# Conversation memory keyed by session_id
MEMORY_STORES = {}
