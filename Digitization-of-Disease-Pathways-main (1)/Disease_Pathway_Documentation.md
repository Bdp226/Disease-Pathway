# Disease Pathway - Full End-to-End Documentation

## 1. Executive Summary
The Disease Pathway project is a comprehensive full-stack web application designed to manage, analyze, and visualize structured disease pathway data. It processes hierarchical data from Excel imports, parses complex cell structures, and persists this information into a queryable relational database. The platform is designed with FAANG-grade system architecture, focusing on observability, modern frontend best practices, and robust error handling.

**Key Features:**
- **Hierarchical Pathway Management:** Supports multi-stage data organization (Prevention, Diagnosis, Treatment, Recovery) including associated pain points and categorized solutions.
- **Admin Excel Processing:** Intelligent Excel parser capable of handling merged cells and complex formatting.
- **Dual Database Pattern:** Enhances security by isolating domain data (Main DB) from user/auth data (Auth DB).
- **RAG Chatbot Assistant:** FAISS-based semantic search and local LLM (Ollama) integration for querying pathway data.
- **User Engagement:** Authenticated interface for users to submit additional pain points, queued for administrative review.
- **Automated Notifications:** Webhook integrations via Microsoft Teams/Power Automate for administrative workflows.

---

## 2. Technology Stack
### 2.1 Backend
- **Language:** Python 3.14
- **Framework:** FastAPI (Async REST API)
- **Data Validation:** Pydantic
- **Data Processing:** openpyxl (Excel parsing), pandas (CSV generation)
- **Database:** Microsoft SQL Server (Azure) with SQLAlchemy ORM
- **Authentication:** JWT (OAuth2 Bearer) with bcrypt hashing
- **Server:** Uvicorn (ASGI)

### 2.2 Frontend
- **Framework:** React 18.3
- **Routing:** React Router 7
- **Build Tool:** Vite 5 (HMR enabled)
- **Styling & Animations:** Custom CSS, Framer Motion, Lucide React

### 2.3 LLM & RAG Infrastructure
- **LLM Engine:** Ollama (`ChatOllama`)
- **Embeddings:** `OllamaEmbeddings` (nomic-embed)
- **Vector Database:** FAISS

---

## 3. System Architecture
The application leverages a robust modular architecture that clearly separates concerns between presentation, API processing, data storage, and AI inference.

### 3.1 High-Level Architecture Diagram
```mermaid
graph TB
    subgraph Frontend["Frontend - React SPA"]
        AuthUI[Auth UI<br/>Login/Register]
        AdminUI[Admin Dashboard<br/>Excel Upload & Review]
        MainUI[Main UI<br/>Pathway Viewer & Chatbot]
    end
    
    subgraph Backend["Backend API Gateway - FastAPI"]
        MainAPI[main.py<br/>Main API - Disease Endpoints]
        AuthAPI[auth/routes.py<br/>Auth API - User Management]
        RAGRouter[multi_route_agent.py<br/>Heuristic Router]
    end
    
    subgraph Processing["Processing Layer"]
        Parser[excel_parser.py<br/>Excel Parser]
        CSVGen[csv_utils.py<br/>CSV Generator]
        Cache[CSV Cache<br/>Generated Files]
    end
    
    subgraph Databases["Databases - SQL Server"]
        MainDB[(Main Disease DB<br/>Diseases, Stages,<br/>Pain Points, Solutions)]
        AuthDB[(Auth DB<br/>Users, Admins,<br/>Submissions)]
    end
    
    AuthUI --> AuthAPI
    MainUI --> MainAPI
    AdminUI --> MainAPI
    AdminUI --> AuthAPI
    MainUI --> RAGRouter
    
    MainAPI --> Parser
    MainAPI --> CSVGen
    MainAPI --> MainDB
    
    AuthAPI --> AuthDB
    
    Parser --> MainDB
    CSVGen --> Cache
    Cache --> MainDB
```

---

## 4. Dual Database Pattern Schema

### 4.1 Main Disease Database
This 4-tier relational model captures the full structure of disease pathways.

```mermaid
erDiagram
    Disease ||--o{ Stage : "has many"
    Stage ||--o{ PainPoint : "contains"
    PainPoint ||--o{ Solution : "has"
    
    Disease {
        int id PK
        string name UK "Disease name (e.g., CAD)"
        datetime created_at
        datetime updated_at "For CSV cache invalidation"
    }
    
    Stage {
        int id PK
        int disease_id FK
        string name "Stage name (e.g., Prevention)"
        text stakeholders "Comma-separated stakeholders"
        text overview "Stage description/overview"
        int pain_points_count "Cached count"
        datetime created_at
    }
    
    PainPoint {
        int id PK
        int stage_id FK
        text description "Pain point description"
        int row_number "Excel row number"
        text sources "Reference sources"
        text coverage "SHS portfolio coverage"
        text existing_solutions "Ecosystem solutions"
        datetime created_at
    }
    
    Solution {
        int id PK
        int pain_point_id FK
        string solution_type "digitalization|automation|sensing|clinical_innovation|process_innovation"
        text description "Solution description"
        datetime created_at
    }
```

### 4.2 Authentication & User Activity Database
Isolates user roles (Admin vs User) and handles community submissions.

```mermaid
erDiagram
    User ||--o{ UserPainPoint : "submits"
    
    User {
        int id PK
        string email UK "User email (login)"
        string full_name
        string password_hash "bcrypt hashed"
    }
    
    Admin {
        int id PK
        string email UK "Admin email (login)"
        string full_name
        string password_hash "bcrypt hashed"
    }
    
    UserPainPoint {
        int id PK
        int user_id FK
        string disease_name "Disease name"
        text pain_point "Pain point description"
        text solution "Proposed solution"
        string status "pending | approved | denied"
    }
```

---

## 5. RAG Chatbot Architecture
The AI integration utilizes a heuristic router (`MultiRouteAgent`) to determine if a query should search the FAISS vector database (semantic), execute a SQL aggregation, or trigger a full CSV payload export.

```mermaid
graph TD
    subgraph Frontend [Client Layer]
        A["ChatbotWidget.jsx"]
    end

    subgraph API [FastAPI Backend Engine]
        B["/chat (Direct Processing)"]
        C["/route-query (MultiRouteAgent)"]
        D["/index-disease (Vector Compiler)"]
    end

    subgraph Retrieval [Data Architecture]
        E["FAISS Vector Stores"]
        F["Relational DB (DatabaseOperations)"]
    end

    subgraph LLM [Local Inference Infrastructure]
        G["Ollama Local SLM (ChatOllama)"]
        H["OllamaEmbeddings (nomic-embed)"]
    end

    A -->|Intent Query| C
    C -->|Semantic Search| E
    C -->|Quantitative Aggregation| F
    
    B -->|Fetch Semantic Match| E
    B -->|Execute Inference Payload| G
    G -->|Synthesized String| B
    B -->|JSON Response| A
```

---

## 6. Key Workflows

### 6.1 Admin Excel Upload and Processing
An incremental update strategy that parses nested merged cells.

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant MainAPI as main.py
    participant Parser as excel_parser.py
    participant DB as Main Database
    
    Admin->>Frontend: Upload Excel file
    Frontend->>MainAPI: POST /upload-excel (with JWT)
    MainAPI->>Parser: CADExcelParser(file_path)
    Parser->>Parser: Load workbook & Detect merged cells
    Parser-->>MainAPI: parsed_data dict
    
    loop For each stage & pain point
        MainAPI->>DB: Get or create Stage/PainPoint
    end
    
    MainAPI->>MainAPI: Invalidate CSV cache
    MainAPI-->>Frontend: ExcelUploadResponse
```

### 6.2 Smart CSV Download with Caching
To prevent generation bottlenecks on large datasets, CSV caching validates against `updated_at`.

```mermaid
sequenceDiagram
    actor User
    participant MainAPI as main.py
    participant CSV as csv_utils.py
    participant Cache as csv_cache/
    participant DB as Main Database
    
    User->>MainAPI: GET /diseases/{name}/download-csv
    MainAPI->>DB: Check disease updated_at timestamp
    MainAPI->>CSV: get_csv_cache_status()
    
    alt Cache Invalid or Missing
        CSV->>DB: Fetch full pathway data
        CSV->>Cache: Generate & Save new CSV file
    end
    
    MainAPI-->>User: StreamingResponse (CSV file)
```

---

## 7. Frontend Integration & UI/UX
- **Custom Hooks (`useDiseases.js`, `useAuth.js`):** Extracted complex data-fetching logic out of UI components, separating state management from the presentation layer.
- **Global Error Boundaries:** Integrated at the root React application layer to gracefully catch rendering errors.
- **Responsive Navigation:** Admin panel components use flexbox and grid layouts (`.admin-layout`, `.admin-sidebar`) to adapt seamlessly from desktop to tablet/mobile interfaces.

---
*Generated Documentation for Disease Pathway v2*
