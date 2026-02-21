# Wardrobe Stylist

A web app to catalog your wardrobe and get AI-powered outfit suggestions.

## Monorepo Structure

```
wardrobe-app/
├── apps/
│   ├── backend/     # Django REST API
│   └── frontend/    # React 18 + Vite
├── packages/        # Shared packages (future)
├── docker-compose.yml
└── Makefile
```

## Quick Start

```bash
# Setup everything (installs deps, starts db, runs migrations)
make setup

# Start development servers
make dev
```

This starts:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:5173

## Commands

| Command        | Description                       |
| -------------- | --------------------------------- |
| `make setup`   | Full setup (install, db, migrate) |
| `make dev`     | Run both servers                  |
| `make db-up`   | Start PostgreSQL                  |
| `make db-down` | Stop PostgreSQL                   |
| `make migrate` | Run Django migrations             |
| `make build`   | Build frontend                    |
| `make clean`   | Remove artifacts                  |

## Tech Stack

- **Backend**: Django 5, Django REST Framework, PostgreSQL
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand
- **AI**: Pluggable (Gemini, HuggingFace, Claude, Ollama)

## Configuration

Copy `apps/backend/.env.example` to `apps/backend/.env` and configure:

```bash
# AI Provider: placeholder (default), gemini, huggingface, claude, ollama
AI_PROVIDER=placeholder

# For Gemini (free tier)
GEMINI_API_KEY=your-key

# For Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3-vl:4b
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
npm run dev      # Dev server
npm run build    # Production build
```
