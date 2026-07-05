FROM python:3.12-slim

# Install system utilities (pciutils contains the lspci command)
RUN apt-get update && apt-get install -y --no-install-recommends \
    pciutils \
    curl \
    iputils-ping \
    dnsutils \
    traceroute \
    lm-sensors \
    bluetooth \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY main.py .

EXPOSE 3000

# Environment variables
ENV SYSVEIW_API_KEY=sv-c1-3a8f2d9e
ENV PORT=3000

# Start the application using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
