# Stage 1: Builder
FROM python:3.13.6-slim-bookworm AS builder

# Install system dependencies for pyodbc compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ unixodbc-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Final Runtime
FROM python:3.13.6-slim-bookworm

# Install the runtime library required for pyodbc to run
RUN apt-get update && apt-get install -y --no-install-recommends \
    unixodbc && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy your application code
COPY main.py excel_parser.py database.py models.py csv_utils.py create_admin.py admins.json ./
COPY auth/ ./auth/

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
