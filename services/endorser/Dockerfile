FROM --platform=linux/arm64/v8 python:3.10-slim-buster

# Install gcc and other build essentials before installing Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip, setuptools, and wheel
RUN pip install --upgrade pip setuptools wheel

WORKDIR /app
ENV ENDORSER_API_PORT=5000
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

EXPOSE ${ENDORSER_API_PORT}
ENTRYPOINT ["./docker-entrypoint.sh"]