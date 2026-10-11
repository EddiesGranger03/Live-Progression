# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS frontend-build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY angular.json tsconfig.json tsconfig.app.json ./
COPY frontend ./frontend
RUN npm run build

FROM python:3.13-slim-bookworm AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    SOLO_DB_PATH=/app/data/solo.db
WORKDIR /app
COPY backend/requirements-runtime.txt ./backend/requirements-runtime.txt
RUN pip install --no-cache-dir -r backend/requirements-runtime.txt \
    && groupadd --gid 10001 solo \
    && useradd --uid 10001 --gid solo --no-create-home --shell /usr/sbin/nologin solo \
    && mkdir -p /app/data \
    && chown solo:solo /app/data
COPY backend/app ./backend/app
COPY --from=frontend-build /build/dist ./dist
USER solo
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health', timeout=3).read()"
CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--no-access-log"]
