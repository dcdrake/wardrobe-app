# Wardrobe Stylist

A web app to catalog your wardrobe and get AI-powered outfit suggestions.

## Monorepo Structure

```
wardrobe-app/
├── apps/
│   ├── backend/     # Django REST API
│   └── frontend/    # Vue 3 + Vite
├── packages/        # Shared packages (future)
├── docker-compose.yml
├── Makefile
└── pnpm-workspace.yaml
```

## Quick Start

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Setup everything (installs deps, starts db, runs migrations)
make setup

# Start development servers
make dev
```

This starts:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:5173

## Commands

| Command | Description |
|---------|-------------|
| `make setup` | Full setup (install, db, migrate) |
| `make dev` | Run both servers |
| `make db-up` | Start PostgreSQL |
| `make db-down` | Stop PostgreSQL |
| `make migrate` | Run Django migrations |
| `make build` | Build frontend |
| `make clean` | Remove artifacts |

## Tech Stack

- **Backend**: Django 5, Django REST Framework, PostgreSQL
- **Frontend**: Vue 3, Vite, Tailwind CSS, Pinia
- **AI**: Pluggable (Ollama/Qwen, Replicate)

## Configuration

Copy `apps/backend/.env.example` to `apps/backend/.env` and configure:

```bash
# AI Provider: placeholder (default), ollama, replicate
AI_PROVIDER=placeholder

# For Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2-vl:7b
```

## Development

### Backend

```bash
cd apps/backend
uv run python manage.py runserver      # Run server
uv run python manage.py makemigrations # Create migrations
uv run python manage.py migrate        # Apply migrations
uv run python manage.py createsuperuser # Create admin user
```

### Frontend

```bash
cd apps/frontend
pnpm dev      # Dev server
pnpm build    # Production build
```
