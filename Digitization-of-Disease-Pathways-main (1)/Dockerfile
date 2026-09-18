# ============================================================
# Multi-Stage Dockerfile — FAANG Production Grade
# Disease Pathways API v3.0
# ============================================================
# Stage 1: Builder — compiles all dependencies in isolation
FROM python:3.13.6-slim-bookworm AS builder

LABEL maintainer="Disease Pathways Team"
LABEL description="Disease Pathway RAG + GraphRAG API"

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ unixodbc-dev curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create isolated virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ============================================================
# Stage 2: Runtime — lean final image
FROM python:3.13.6-slim-bookworm

# Install only runtime system libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    unixodbc curl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security (FAANG requirement)
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application source code
COPY --chown=appuser:appuser main.py excel_parser.py database.py models.py ./
COPY --chown=appuser:appuser csv_utils.py verification.py shared_state.py tasks.py ./
COPY --chown=appuser:appuser rag_tools.py graph_builder.py mcp_server.py ml_utils.py ./
COPY --chown=appuser:appuser multi_route_agent.py cache_manager.py worker.py ./
COPY --chown=appuser:appuser auth/ ./auth/
COPY --chown=appuser:appuser routers/ ./routers/
COPY --chown=appuser:appuser services/ ./services/
COPY --chown=appuser:appuser repositories/ ./repositories/
COPY --chown=appuser:appuser middleware/ ./middleware/

# Create required directories with correct ownership
RUN mkdir -p /app/vector_stores /app/uploads /app/data && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8000

# Docker health check — used by docker-compose depends_on conditions
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production command (no --reload in prod)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
