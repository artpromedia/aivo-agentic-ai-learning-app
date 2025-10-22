FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

# Copy application code
COPY . .

# Create data directories
RUN mkdir -p models data/training data/checkpoints

# Expose port
EXPOSE 8004

# Run service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004"]
