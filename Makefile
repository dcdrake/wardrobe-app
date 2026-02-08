.PHONY: help install dev build test lint clean db-up db-down migrate setup

help:
	@echo "Wardrobe Stylist - Monorepo Commands"
	@echo ""
	@echo "  make setup     - Full project setup (install deps, start db, migrate)"
	@echo "  make dev       - Run backend + frontend dev servers"
	@echo "  make build     - Build frontend for production"
	@echo "  make test      - Run all tests"
	@echo "  make lint      - Run linters"
	@echo "  make clean     - Remove build artifacts"
	@echo ""
	@echo "  make db-up     - Start PostgreSQL"
	@echo "  make db-down   - Stop PostgreSQL"
	@echo "  make migrate   - Run Django migrations"

setup:
	pnpm install
	cd apps/backend && uv sync
	cd apps/backend && cp -n .env.example .env || true
	docker compose up -d
	@sleep 2
	cd apps/backend && uv run python manage.py migrate
	@echo "✅ Setup complete! Run 'make dev' to start."

install:
	pnpm install
	cd apps/backend && uv sync

dev:
	pnpm dev

build:
	pnpm build

test:
	cd apps/backend && uv run pytest

lint:
	cd apps/frontend && pnpm lint

db-up:
	docker compose up -d

db-down:
	docker compose down

migrate:
	cd apps/backend && uv run python manage.py migrate

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".venv" -exec rm -rf {} + 2>/dev/null || true
