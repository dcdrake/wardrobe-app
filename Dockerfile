# Stage 1: Build frontend
FROM node:20-slim AS frontend
WORKDIR /app/apps/frontend
COPY apps/frontend/package.json apps/frontend/package-lock.json ./
RUN npm ci
COPY apps/frontend/ ./
RUN npm run build

# Stage 2: Python app + built frontend
FROM python:3.11-slim
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install Python deps
COPY apps/backend/pyproject.toml apps/backend/uv.lock apps/backend/
RUN cd apps/backend && uv sync --frozen --no-dev

# Copy backend code
COPY apps/backend/ apps/backend/

# Copy built frontend
COPY --from=frontend /app/apps/frontend/dist/ apps/frontend/dist/

# Collect static files
RUN cd apps/backend && uv run python manage.py collectstatic --noinput

EXPOSE 8000
CMD cd apps/backend && uv run python manage.py migrate --noinput && uv run gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120
