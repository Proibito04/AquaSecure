# scada-backend/Dockerfile
FROM python:3.11-slim

# Set environment variables to prevent Python from writing .pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
# Added a retry logic and cleaned up the syntax
RUN apt-get update && \
    apt-get install -y --no-install-recommends coreutils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

EXPOSE 8000

# Command to run the app
# We use uvicorn with the app.main:app reference
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]