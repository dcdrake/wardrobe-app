# Contributing to Wardrobe Stylist

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 8
- [Python](https://www.python.org/) >= 3.11
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Docker](https://www.docker.com/) (for PostgreSQL)

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd wardrobe-app

# Full setup: installs deps, starts database, runs migrations
make setup

# Start dev servers (backend + frontend)
make dev
```

This starts the backend at http://localhost:8000 and the frontend at http://localhost:5173.

## Project Structure

```
wardrobe-app/
├── apps/
│   ├── backend/          # Django REST API
│   │   ├── accounts/     # User auth (JWT)
│   │   ├── wardrobe/     # Clothing items & outfits
│   │   ├── ai/           # AI provider integrations
│   │   └── config/       # Django settings & URLs
│   └── frontend/         # Vue 3 + Vite SPA
│       └── src/
│           ├── api/      # Axios API client
│           ├── components/
│           ├── stores/   # Pinia state management
│           ├── views/
│           └── router/
├── docker-compose.yml    # PostgreSQL service
├── Makefile              # Dev commands
└── pnpm-workspace.yaml   # Monorepo config
```

## Development Workflow

### Backend

```bash
cd apps/backend

# Run the dev server
uv run python manage.py runserver

# Create migrations after model changes
uv run python manage.py makemigrations

# Apply migrations
uv run python manage.py migrate

# Create an admin user
uv run python manage.py createsuperuser

# Run tests
uv run pytest

# Lint with ruff
uv run ruff check .
```

### Frontend

```bash
cd apps/frontend

# Dev server with hot reload
pnpm dev

# Production build
pnpm build

# Lint
pnpm lint
```

### Database

PostgreSQL runs via Docker Compose.

```bash
make db-up      # Start PostgreSQL
make db-down    # Stop PostgreSQL
```

Default credentials (see `docker-compose.yml`):
- **Database**: wardrobe
- **User**: postgres
- **Password**: postgres
- **Port**: 5432

## Environment Variables

Copy `apps/backend/.env.example` to `apps/backend/.env`. Key variables:

| Variable          | Description                                      | Default                  |
| ----------------- | ------------------------------------------------ | ------------------------ |
| `SECRET_KEY`      | Django secret key                                | dev key (change in prod) |
| `DEBUG`           | Debug mode                                       | `True`                   |
| `DB_NAME`         | PostgreSQL database                              | `wardrobe`               |
| `DB_USER`         | Database user                                    | `postgres`               |
| `DB_PASSWORD`     | Database password                                | `postgres`               |
| `AI_PROVIDER`     | AI backend: `placeholder`, `ollama`, `replicate` | `placeholder`            |
| `OLLAMA_BASE_URL` | Ollama API URL                                   | `http://localhost:11434` |
| `OLLAMA_MODEL`    | Ollama model name                                | `qwen3-vl:4b`            |

## AI Providers

The app supports pluggable AI providers for outfit suggestions:

- **placeholder** (default) -- Returns mock suggestions, no external service needed.
- **ollama** -- Uses a local Ollama instance with a vision-language model (e.g., Qwen2-VL).
- **replicate** -- Uses the Replicate cloud API.

Set `AI_PROVIDER` in your `.env` to switch providers.

## Code Style

- **Python**: Formatted with [Ruff](https://docs.astral.sh/ruff/), line length 100, targeting Python 3.11+.
- **JavaScript/Vue**: Linted with ESLint.
- **CSS**: Tailwind CSS utility classes.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
