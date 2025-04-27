# syntax=docker/dockerfile:1

# ----- Builder stage -----
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system deps
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends build-essential git && \
    rm -rf /var/lib/apt/lists/*

# Copy project metadata first for caching
COPY backend/ ./backend/
COPY pyproject.toml poetry.lock* ./

# Install python deps
RUN pip install --upgrade pip && \
    pip wheel --no-cache-dir --no-deps -r backend/conversational-ai-gemini-twilio/requirements.txt -w /tmp/wheels

# ----- Final stage -----
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install runtime system libs
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Copy wheels and install
COPY --from=builder /tmp/wheels /tmp/wheels
RUN pip install --upgrade pip && pip install --no-cache-dir --no-index --find-links=/tmp/wheels *.whl

# Copy source code
COPY . .

EXPOSE 8080

# Entrypoint
CMD ["python", "backend/conversational-ai-gemini-twilio/run.py"] 