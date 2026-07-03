# blog_tech — expériences Claude Code

Monorepo : `backend/` (Django + DRF, hexagonal) · `frontend/` (Next.js, FSD — Plan 1B).
Spec : docs/superpowers/specs/2026-07-02-blog-tech-design.md

## Démarrage backend
docker compose up -d db
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
python manage.py migrate && python manage.py runserver
