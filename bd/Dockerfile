# ── Stage 1: slim base ────────────────────────────────────────────────────────
FROM python:3.11-slim AS base

# Prevent .pyc files and ensure stdout/stderr are not buffered
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# ── Stage 2: dependencies ─────────────────────────────────────────────────────
FROM base AS deps

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# ── Stage 3: final image ──────────────────────────────────────────────────────
FROM deps AS final

COPY . .

EXPOSE 8000

# Start Uvicorn with 4 workers (adjust to match CPU count in production)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
