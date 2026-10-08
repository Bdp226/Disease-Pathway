# Disease Pathway Platform

A production-grade web application for digitizing, visualizing, and exploring clinical disease pathways with automated Excel ingestion, interactive knowledge graphs, AI-assisted reasoning, and user feedback submission.

---

## High-Level Simpler Overview of Changes

Below is a concise, non-technical overview of the core capabilities and recent improvements:

* **Smarter, Always-Ready AI Assistant ("Axon")**:
  * Handles standard conversational greetings and deep-dive pathway queries across CAD, Lung Cancer, and Alzheimer's.
  * Streams token responses in real-time.
  * Robust fallback handling without strict parameter constraints for general queries.

* **High-Speed Semantic Search and Caching**:
  * Clinical questions are evaluated and cached via vector similarity (`faiss-cpu`), delivering rapid responses for repeated or closely matching inquiries.
  * Pathway datasets and CSV exports are cached and invalidated only when new data is ingested.

* **Modern, Interactive User Interface**:
  * **Global Search (`Cmd/Ctrl + K`)**: Fast lookup for pain points, interventions, and care stages across all pathways.
  * **Live Metrics Dashboard**: Visual indicators for total pathways, stages, mapped pain points, and technical solutions.
  * **Interactive Stakeholder & Pain Point Cards**: Flexible card layouts with flip details, category filters, and responsive design for desktop, tablet, and mobile.

* **Modular and Resilient Architecture**:
  * Extracted monolithic logic into isolated, testable FastAPI routers (`/chat`, `/diseases`, `/auth`).
  * Structured frontend state using custom hooks and global error boundaries to prevent application crashes.
  * Added automated Cypress tests for end-to-end interface verification.

---

## Architectural Highlights

### 1. Modular Backend (FastAPI)
- **Separation of Concerns:** Route handlers reside in the `routers/` package (`diseases_router.py`, `chat.py`, `auth/routes.py`), decoupling domain logic from core bootstrapping.
- **Multi-Route AI Orchestrator:** Dynamic intent routing (`multi_route_agent.py`) routes queries across FAISS vector stores, relational SQL aggregations, or direct CSV summaries.
- **Semantic Caching & Vector Store:** Integrated `faiss-cpu` with `nomic-embed-text` embeddings for sub-millisecond retrieval of previously answered queries.
- **Observability Middleware:** Request-level correlation IDs for distributed tracing and structured JSON logging.

### 2. Frontend Architecture (React 18 + Vite)
- **Component-Driven UI:** Presentation components (`PinterestLayout`, `StakeholderCard`, `AnimatedStatCounter`) separated from page containers.
- **Error Boundaries:** Graceful UI crash protection via `ErrorBoundary.jsx`.
- **Centralized API Client:** Unified Axios instance with automatic token attachment and error interception.

### 3. Dual Database Pattern
- **Main Database:** Stores clinical entities (Diseases, Stages, Pain Points, and Categorized Solutions).
- **Auth Database:** Dedicated schema storing hashed credentials (bcrypt), role metadata, and moderation queues.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.13+, FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| **AI / RAG** | LangChain, Ollama (`llama3`, `nomic-embed-text`), FAISS |
| **Frontend** | React 18, Vite, React Router, Framer Motion, Lucide Icons, Axios |
| **Databases** | SQLite (Local Dev) / Microsoft SQL Server (Azure) |
| **Testing & CI**| Cypress E2E, GitHub Actions (`.github/workflows/ci.yml`), NGINX |

---

## Getting Started

### 1. Prerequisites
- **Python**: 3.13+ installed and on PATH
- **Node.js**: 18.x or 20.x with `npm`
- **Ollama**: Installed and running locally (`ollama serve`) with models pulled:
  ```bash
  ollama pull llama3
  ollama pull nomic-embed-text
  ```

### 2. Backend Setup
Navigate to the backend directory:
```powershell
cd "Digitization-of-Disease-Pathways-main (1)"

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
pip install faiss-cpu

# Start backend development server (Port 8000)
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
* **Interactive API Documentation:** http://127.0.0.1:8000/docs
* **Health Check:** http://127.0.0.1:8000/health

### 3. Frontend Setup
In a new terminal window:
```powershell
cd "Digitization-of-Disease-Pathways-main (1)\frontend\disease-pathways"

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```
* **Application UI:** http://127.0.0.1:3000 (or `http://127.0.0.1:3001` if port 3000 is occupied).
