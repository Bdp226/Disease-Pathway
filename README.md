# Disease Pathway Platform

A production-grade platform for digitizing disease pathways, enriching them with AI-assisted retrieval, and supporting enterprise governance workflows.

## High-Level Simple Overview

This release upgraded the application from a single-app prototype into an enterprise-ready architecture:

- Split core backend responsibilities into modular routers for auth, diseases, and chat.
- Unified chatbot behavior under one reliable `/chat` flow with streaming responses.
- Added semantic caching and FAISS-based retrieval for faster repeated questions.
- Strengthened frontend usability with global search, live metrics, and resilient UI components.
- Improved operational readiness with CI workflows, Docker assets, health endpoints, and test coverage.

## FAANG-Relevant System Design Principles Applied

- Reliability first: fallback paths (in-memory caching if Redis unavailable, graceful no-context responses).
- Modular ownership boundaries: API router separation with dedicated auth and disease domains.
- Performance by design: vector retrieval + semantic cache + incremental CSV caching.
- Observability and operations: structured logs, health endpoints, and deployment configs.
- Scalable evolution path: clear migration from monolith-style handlers to service/router split.

## Architecture At a Glance

```mermaid
flowchart LR
    UI[React Frontend\nVite SPA] --> API[FastAPI Gateway]
    API --> AUTH[Auth Router]
    API --> DISEASE[Disease Router]
    API --> CHAT[Chat Router]
    CHAT --> AGENT[Multi-Route Agent]
    AGENT --> SQL[(Main DB)]
    AGENT --> VS[(FAISS Vector Stores)]
    AGENT --> CSV[(CSV Export Cache)]
    CHAT --> OLLAMA[Ollama LLM + Embeddings]
    AUTH --> AUTHDB[(Auth DB)]
```

## Research and Retrieval Workflow

This workflow shows how a user query is routed for the best answer source.

```mermaid
flowchart TD
    Q[User Question] --> G{Greeting or small talk?}
    G -- Yes --> R1[Return direct conversational response]
    G -- No --> C{Semantic cache hit?}
    C -- Yes --> R2[Return cached response]
    C -- No --> MRA[Multi-Route Agent]
    MRA --> RT{Route type}
    RT -- SQL --> S1[Aggregate structured data]
    RT -- Vector --> S2[Hybrid retrieval over FAISS]
    RT -- CSV --> S3[Return full pathway extract]
    S1 --> P[Prompt assembly]
    S2 --> P
    S3 --> P
    P --> LLM[Ollama generation]
    LLM --> OUT[Stream response to frontend]
```

## Architectural Workflows

### 1) Excel Ingestion and Indexing

```mermaid
sequenceDiagram
    participant Admin
    participant FE as Frontend
    participant API as FastAPI
    participant Parser as Excel Parser
    participant DB as Main DB
    participant Index as FAISS Builder

    Admin->>FE: Upload pathway workbook
    FE->>API: POST /upload-excel
    API->>Parser: Parse merged cells + rows
    Parser-->>API: Normalized disease graph
    API->>DB: Upsert Disease/Stage/PainPoint/Solution
    API->>Index: Rebuild disease vector store
    Index-->>API: Persisted index under vector_stores/
    API-->>FE: Upload and indexing status
```

### 2) Chat Request Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant FE as ChatbotWidget
    participant API as /chat
    participant Agent as MultiRouteAgent
    participant Data as SQL/FAISS/CSV
    participant LLM as Ollama

    User->>FE: Ask question
    FE->>API: POST /chat (message, model, disease_name, session_id)
    API->>Agent: Route intent
    Agent->>Data: Fetch context by route
    Data-->>API: Context payload + sources
    API->>LLM: Generate constrained answer
    LLM-->>API: Stream tokens
    API-->>FE: text/plain stream
    FE-->>User: Progressive response rendering
```

### 3) CSV Export with Smart Cache

```mermaid
flowchart TD
    DREQ[Download request] --> CHK{Cache exists and fresh?}
    CHK -- Yes --> FILE[Stream cached CSV]
    CHK -- No --> BUILD[Build full CSV from DB]
    BUILD --> SAVE[Store timestamped cache file]
    SAVE --> FILE
```

## Current System Design Improvements in This Repo

- Chat reliability fix: removed legacy conflicting `/chat` implementation from `main.py` so `routers/chat.py` owns chat behavior.
- Optional-context chat behavior: greetings and non-disease queries now handled safely by router logic.
- Faster retrieval setup: `faiss-cpu` support validated with local vector index loading.
- Startup consistency: backend and frontend runbook aligned for local and container workflows.
- Documentation alignment: single source of truth for architecture, workflows, and operational setup.

## Component and Service Boundaries

| Boundary | Primary Files | Responsibility |
| :--- | :--- | :--- |
| API Entry | `main.py` | App wiring, middleware, router registration |
| Auth Domain | `auth/routes.py`, `auth/models.py` | Registration, login, admin and user controls |
| Disease Domain | `routers/diseases_router.py`, `database.py` | Pathway retrieval, stats, export-oriented data |
| AI Domain | `routers/chat.py`, `multi_route_agent.py`, `rag_tools.py` | Route selection, retrieval, generation, streaming |
| Frontend UI | `frontend/disease-pathways/src` | Route views, widgets, search, dashboards |

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| Backend | Python 3.13+, FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| AI/RAG | LangChain, Ollama (`llama3`, `nomic-embed-text`), FAISS |
| Frontend | React 18, Vite, React Router, Framer Motion, Axios |
| Data | SQLite (local), optional SQL Server/Azure SQL support |
| Quality | Cypress E2E, pytest, GitHub Actions |

## Deployment Topology (Reference)

```mermaid
flowchart TB
    subgraph Client
      Browser[Web Browser]
    end

    subgraph App
      FE[React App]
      BE[FastAPI Service]
    end

    subgraph AI
      OL[Ollama Runtime]
      FAI[FAISS Index Files]
    end

    subgraph Data
      MDB[(Main DB)]
      ADB[(Auth DB)]
      CACHE[(CSV Cache)]
    end

    Browser --> FE
    FE --> BE
    BE --> OL
    BE --> FAI
    BE --> MDB
    BE --> ADB
    BE --> CACHE
```

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18.x or 20.x
- Ollama installed and running

```bash
ollama pull llama3
ollama pull nomic-embed-text
```

### Backend

```powershell
cd "Digitization-of-Disease-Pathways-main (1)"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install faiss-cpu
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

- Docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

### Frontend

```powershell
cd "Digitization-of-Disease-Pathways-main (1)\frontend\disease-pathways"
npm install
npm run dev
```

- App: http://127.0.0.1:3000 (or 3001 if 3000 is occupied)

## Design Roadmap (Next Enterprise Steps)

- Move heavy indexing/evaluation tasks to worker queues (Celery/Redis).
- Add strict request SLOs and p95 dashboards for chat and search routes.
- Introduce per-tenant policy controls and scoped model access.
- Add policy-driven redaction and audit trails for regulated environments.
