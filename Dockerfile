FROM python:3.9-slim

WORKDIR /app

# Change this to point to backend/requirements.txt
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Change this to only copy the backend directory
COPY backend/ .

CMD ["gunicorn", "src.api.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:10000"]