# Phase 1A — Backend Django (publishing + media_library) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** API REST publique + admin Django permettant de publier le premier article du blog (lecture, recherche full-text, llms.txt, RSS, i18n structurel).

**Architecture:** Hexagonal pragmatique — domaine Python pur (invariants, zéro import Django), use cases + ports, infrastructure ORM/Postgres qui implémente les ports, interface DRF read-only publique + admin comme éditeur v1. Spec de référence : `docs/superpowers/specs/2026-07-02-blog-tech-design.md`.

**Tech Stack:** Python 3.12+, Django 5.x, DRF, drf-spectacular, Postgres 16 **natif — SANS Docker** (Postgres.app/Homebrew, port 5432), pytest + pytest-django.

## Global Constraints

- ⚠️ Le dossier projet est `/Users/marcelyapo/Sites/Django_nexjs/blog_tech ` **avec un espace final** : TOUJOURS quoter les chemins dans les commandes shell.
- Racine backend : `backend/` (monorepo ; `frontend/` viendra au Plan 1B).
- Le domaine (`backend/src/*/domain/`) n'importe JAMAIS Django.
- API : préfixe `/api/v1/`, lecture publique sans auth, pagination 10.
- Locale : `fr` par défaut, valeurs autorisées `fr` | `en` ; slug unique PAR locale.
- **SANS Docker** : Postgres natif local (Postgres.app), port **5432**, base `blog_tech`, utilisateur = utilisateur macOS courant sans mot de passe ; settings lus via env (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`) avec ces défauts.
- Tests : `pytest` depuis `backend/` ; les tests domaine ne touchent pas la DB.
- Commits : préfixes `feat:`/`test:`/`chore:`, un commit par tâche minimum.
- `reading_time` = `max(1, round(mots / 200))`.
- Un article `kind="code_3d"` ne peut être publié sans `scene` (JSON) valide.

---

### Task 1: Bootstrap monorepo + Django + Postgres + pytest

**Files:**
- Create: `.gitignore`, `README.md`, `docker-compose.yml`
- Create: `backend/pyproject.toml`, `backend/manage.py`
- Create: `backend/config/__init__.py`, `backend/config/settings/{__init__,base,dev,test}.py`, `backend/config/urls.py`, `backend/config/wsgi.py`
- Test: `backend/tests/test_boot.py`

**Interfaces:**
- Produces: settings module `config.settings.dev` / `config.settings.test`, apps déclarées plus tard dans `INSTALLED_APPS` de `base.py`.

- [ ] **Step 1: git init + fichiers racine**

```bash
cd "/Users/marcelyapo/Sites/Django_nexjs/blog_tech "
git init -b main
```

`.gitignore` :
```
__pycache__/
*.pyc
.venv/
node_modules/
.env
media/
staticfiles/
.pytest_cache/
```

`README.md` :
```markdown
# blog_tech — expériences Claude Code

Monorepo : `backend/` (Django + DRF, hexagonal) · `frontend/` (Next.js, FSD — Plan 1B).
Spec : docs/superpowers/specs/2026-07-02-blog-tech-design.md

## Démarrage backend
docker compose up -d db
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
python manage.py migrate && python manage.py runserver
```

`docker-compose.yml` :
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: blog_tech
      POSTGRES_USER: blog
      POSTGRES_PASSWORD: blog
    ports: ["5433:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

- [ ] **Step 2: backend/pyproject.toml**

```toml
[project]
name = "blog-tech-backend"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "django>=5.1,<6",
  "djangorestframework>=3.15",
  "drf-spectacular>=0.27",
  "psycopg[binary]>=3.2",
]

[project.optional-dependencies]
dev = ["pytest>=8", "pytest-django>=4.9"]

[tool.pytest.ini_options]
DJANGO_SETTINGS_MODULE = "config.settings.test"
pythonpath = ["."]
testpaths = ["tests", "src"]
```

- [ ] **Step 3: settings découpés**

`backend/config/settings/base.py` :
```python
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = "dev-only-change-me"
DEBUG = False
ALLOWED_HOSTS: list[str] = []

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    "rest_framework",
    "drf_spectacular",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]

DATABASES = {"default": {
    "ENGINE": "django.db.backends.postgresql",
    "NAME": os.environ.get("DB_NAME", "blog_tech"),
    "USER": os.environ.get("DB_USER", getpass.getuser()),
    "PASSWORD": os.environ.get("DB_PASSWORD", ""),
    "HOST": os.environ.get("DB_HOST", "127.0.0.1"),
    "PORT": os.environ.get("DB_PORT", "5432"),
}}
```
(avec `import os` et `import getpass` en tête de `base.py`)
```python

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
LANGUAGE_CODE = "fr"
TIME_ZONE = "UTC"
USE_TZ = True
STATIC_URL = "static/"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "UNAUTHENTICATED_USER": None,
}
SPECTACULAR_SETTINGS = {"TITLE": "blog_tech API", "VERSION": "1.0.0"}
```

`backend/config/settings/dev.py` :
```python
from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
```

`backend/config/settings/test.py` :
```python
from .base import *  # noqa

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
```

`backend/config/urls.py` :
```python
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
]
```

`backend/config/wsgi.py` :
```python
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
application = get_wsgi_application()
```

`backend/manage.py` :
```python
#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
```

(Créer aussi les `__init__.py` vides : `backend/config/__init__.py`, `backend/config/settings/__init__.py`.)

- [ ] **Step 4: test de boot**

`backend/tests/__init__.py` (vide) et `backend/tests/test_boot.py` :
```python
def test_settings_load():
    from django.conf import settings
    assert settings.REST_FRAMEWORK["PAGE_SIZE"] == 10
```

- [ ] **Step 5: installer, démarrer la DB, vérifier**

```bash
cd "/Users/marcelyapo/Sites/Django_nexjs/blog_tech "
docker compose up -d db
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest tests/test_boot.py -v
```
Expected: `1 passed`.

```bash
python manage.py migrate && python manage.py check
```
Expected: `System check identified no issues`.

- [ ] **Step 6: Commit**

```bash
cd "/Users/marcelyapo/Sites/Django_nexjs/blog_tech "
git add -A && git commit -m "chore: bootstrap monorepo, Django config, Postgres docker, pytest"
```

---

### Task 2: shared_kernel — value objects Slug, Locale, MarkdownBody

**Files:**
- Create: `backend/src/__init__.py`, `backend/src/shared_kernel/__init__.py`, `backend/src/shared_kernel/domain/__init__.py`, `backend/src/shared_kernel/domain/values.py`
- Test: `backend/src/shared_kernel/domain/test_values.py`

**Interfaces:**
- Produces: `Slug(value: str)` (frozen, lève `ValueError` si invalide), `Locale` (StrEnum `FR="fr"`, `EN="en"`), `MarkdownBody(text: str)` avec `.word_count: int` et `.reading_time_minutes: int`.

- [ ] **Step 1: Write the failing tests**

`backend/src/shared_kernel/domain/test_values.py` :
```python
import pytest
from src.shared_kernel.domain.values import Slug, Locale, MarkdownBody


def test_slug_valide():
    assert Slug("mon-premier-article").value == "mon-premier-article"

@pytest.mark.parametrize("bad", ["", "Maj", "é-accent", "espace la", "-debut", "fin-", "a--b"])
def test_slug_invalide(bad):
    with pytest.raises(ValueError):
        Slug(bad)

def test_locale():
    assert Locale("fr") is Locale.FR
    with pytest.raises(ValueError):
        Locale("de")

def test_markdown_body_reading_time():
    body = MarkdownBody("mot " * 450)
    assert body.word_count == 450
    assert body.reading_time_minutes == 2      # 450/200 = 2.25 → round → 2

def test_markdown_body_minimum_une_minute():
    assert MarkdownBody("court").reading_time_minutes == 1
```

- [ ] **Step 2: Run to verify failure**

Run: `pytest src/shared_kernel -v` → Expected: FAIL `ModuleNotFoundError`.

- [ ] **Step 3: Implementation**

`backend/src/shared_kernel/domain/values.py` :
```python
import re
from dataclasses import dataclass
from enum import StrEnum

_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


@dataclass(frozen=True)
class Slug:
    value: str

    def __post_init__(self):
        if not _SLUG_RE.match(self.value):
            raise ValueError(f"slug invalide : {self.value!r}")


class Locale(StrEnum):
    FR = "fr"
    EN = "en"


@dataclass(frozen=True)
class MarkdownBody:
    text: str

    @property
    def word_count(self) -> int:
        return len(self.text.split())

    @property
    def reading_time_minutes(self) -> int:
        return max(1, round(self.word_count / 200))
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest src/shared_kernel -v` → Expected: `7 passed` (aucune DB touchée).

- [ ] **Step 5: Commit**

```bash
git add backend/src && git commit -m "feat: shared_kernel value objects (Slug, Locale, MarkdownBody)"
```

---

### Task 3: publishing/domain — Article, invariants de publication, événements

**Files:**
- Create: `backend/src/publishing/__init__.py`, `backend/src/publishing/domain/__init__.py`, `backend/src/publishing/domain/article.py`, `backend/src/publishing/domain/events.py`
- Test: `backend/src/publishing/domain/test_article.py`

**Interfaces:**
- Consumes: `Slug`, `Locale`, `MarkdownBody` (Task 2).
- Produces: `ArticleKind` (StrEnum `STANDARD="standard"`, `CODE_3D="code_3d"`, `TIL="til"`), `ArticleStatus` (StrEnum `DRAFT/PUBLISHED/ARCHIVED`), classe `Article` avec `publish(now: datetime)`, `archive()`, `change_slug(Slug)`, attributs `slug, locale, kind, title, excerpt, body, scene, status, published_at, reading_time, events`. Erreurs : `SceneRequise`, `TransitionInterdite`, `SlugImmuable`. Événement `ArticlePublished(slug, locale)`.

- [ ] **Step 1: Write the failing tests**

`backend/src/publishing/domain/test_article.py` :
```python
from datetime import datetime, timezone
import pytest

from src.shared_kernel.domain.values import Slug, Locale, MarkdownBody
from src.publishing.domain.article import (
    Article, ArticleKind, ArticleStatus,
    SceneRequise, TransitionInterdite, SlugImmuable,
)
from src.publishing.domain.events import ArticlePublished

NOW = datetime(2026, 7, 3, 12, 0, tzinfo=timezone.utc)


def brouillon(**kw):
    defaults = dict(
        slug=Slug("singleton-claude"), locale=Locale.FR,
        kind=ArticleKind.STANDARD, title="Le singleton",
        excerpt="résumé", body=MarkdownBody("mot " * 400), scene=None,
    )
    defaults.update(kw)
    return Article.draft(**defaults)


def test_draft_initial():
    a = brouillon()
    assert a.status is ArticleStatus.DRAFT
    assert a.published_at is None
    assert a.reading_time == 2


def test_publish_ok():
    a = brouillon()
    a.publish(now=NOW)
    assert a.status is ArticleStatus.PUBLISHED
    assert a.published_at == NOW
    assert ArticlePublished(slug="singleton-claude", locale="fr") in a.events


def test_code_3d_sans_scene_refuse():
    a = brouillon(kind=ArticleKind.CODE_3D, scene=None)
    with pytest.raises(SceneRequise):
        a.publish(now=NOW)


def test_code_3d_avec_scene_ok():
    a = brouillon(kind=ArticleKind.CODE_3D, scene={"version": 2, "pattern": "singleton"})
    a.publish(now=NOW)
    assert a.status is ArticleStatus.PUBLISHED


def test_double_publication_interdite():
    a = brouillon()
    a.publish(now=NOW)
    with pytest.raises(TransitionInterdite):
        a.publish(now=NOW)


def test_slug_immuable_apres_publication():
    a = brouillon()
    a.change_slug(Slug("autre-slug"))            # autorisé en draft
    a.publish(now=NOW)
    with pytest.raises(SlugImmuable):
        a.change_slug(Slug("interdit"))


def test_archive_depuis_published_seulement():
    a = brouillon()
    with pytest.raises(TransitionInterdite):
        a.archive()
    a.publish(now=NOW)
    a.archive()
    assert a.status is ArticleStatus.ARCHIVED
```

- [ ] **Step 2: Run to verify failure**

Run: `pytest src/publishing -v` → Expected: FAIL `ModuleNotFoundError`.

- [ ] **Step 3: Implementation**

`backend/src/publishing/domain/events.py` :
```python
from dataclasses import dataclass


@dataclass(frozen=True)
class ArticlePublished:
    slug: str
    locale: str
```

`backend/src/publishing/domain/article.py` :
```python
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum

from src.shared_kernel.domain.values import Slug, Locale, MarkdownBody
from src.publishing.domain.events import ArticlePublished


class ArticleKind(StrEnum):
    STANDARD = "standard"
    CODE_3D = "code_3d"
    TIL = "til"


class ArticleStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class SceneRequise(Exception): ...
class TransitionInterdite(Exception): ...
class SlugImmuable(Exception): ...


@dataclass
class Article:
    slug: Slug
    locale: Locale
    kind: ArticleKind
    title: str
    excerpt: str
    body: MarkdownBody
    scene: dict | None
    status: ArticleStatus = ArticleStatus.DRAFT
    published_at: datetime | None = None
    events: list = field(default_factory=list)
    id: int | None = None

    @classmethod
    def draft(cls, **kw) -> "Article":
        return cls(**kw)

    @property
    def reading_time(self) -> int:
        return self.body.reading_time_minutes

    def publish(self, now: datetime) -> None:
        if self.status is not ArticleStatus.DRAFT:
            raise TransitionInterdite(f"publish depuis {self.status}")
        if self.kind is ArticleKind.CODE_3D and not self.scene:
            raise SceneRequise("un article code_3d exige une scene")
        self.status = ArticleStatus.PUBLISHED
        self.published_at = now
        self.events.append(ArticlePublished(slug=self.slug.value, locale=self.locale.value))

    def archive(self) -> None:
        if self.status is not ArticleStatus.PUBLISHED:
            raise TransitionInterdite(f"archive depuis {self.status}")
        self.status = ArticleStatus.ARCHIVED

    def change_slug(self, new_slug: Slug) -> None:
        if self.status is not ArticleStatus.DRAFT:
            raise SlugImmuable("slug figé après publication")
        self.slug = new_slug
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest src/publishing -v` → Expected: `7 passed`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/publishing && git commit -m "feat: domaine Article (invariants publish/archive/slug, events)"
```

---

### Task 4: publishing/application — ports + use case PublishArticle

**Files:**
- Create: `backend/src/publishing/application/__init__.py`, `backend/src/publishing/application/ports.py`, `backend/src/publishing/application/use_cases/__init__.py`, `backend/src/publishing/application/use_cases/publish_article.py`
- Test: `backend/src/publishing/application/test_publish_article.py`

**Interfaces:**
- Consumes: `Article`, erreurs domaine (Task 3).
- Produces: `ArticleRepository` (Protocol : `get(article_id: int) -> Article`, `save(article: Article) -> None`), `Clock` (Protocol : `now() -> datetime`), use case `PublishArticle(repo, clock).execute(article_id: int) -> Article`, erreur `ArticleIntrouvable`.

- [ ] **Step 1: Write the failing test**

`backend/src/publishing/application/test_publish_article.py` :
```python
from datetime import datetime, timezone
import pytest

from src.shared_kernel.domain.values import Slug, Locale, MarkdownBody
from src.publishing.domain.article import Article, ArticleKind, ArticleStatus
from src.publishing.application.ports import ArticleIntrouvable
from src.publishing.application.use_cases.publish_article import PublishArticle

NOW = datetime(2026, 7, 3, tzinfo=timezone.utc)


class FakeRepo:
    def __init__(self, articles):
        self.db = {a.id: a for a in articles}
        self.saved = []

    def get(self, article_id):
        try:
            return self.db[article_id]
        except KeyError:
            raise ArticleIntrouvable(article_id)

    def save(self, article):
        self.saved.append(article)


class FakeClock:
    def now(self):
        return NOW


def make_article(id=1):
    a = Article.draft(
        slug=Slug("a"), locale=Locale.FR, kind=ArticleKind.STANDARD,
        title="t", excerpt="e", body=MarkdownBody("x"), scene=None,
    )
    a.id = id
    return a


def test_publie_et_sauvegarde():
    repo = FakeRepo([make_article(1)])
    result = PublishArticle(repo, FakeClock()).execute(article_id=1)
    assert result.status is ArticleStatus.PUBLISHED
    assert result.published_at == NOW
    assert repo.saved == [result]


def test_article_introuvable():
    repo = FakeRepo([])
    with pytest.raises(ArticleIntrouvable):
        PublishArticle(repo, FakeClock()).execute(article_id=99)
```

- [ ] **Step 2: Run to verify failure**

Run: `pytest src/publishing/application -v` → Expected: FAIL `ModuleNotFoundError`.

- [ ] **Step 3: Implementation**

`backend/src/publishing/application/ports.py` :
```python
from datetime import datetime
from typing import Protocol

from src.publishing.domain.article import Article


class ArticleIntrouvable(Exception): ...


class ArticleRepository(Protocol):
    def get(self, article_id: int) -> Article: ...
    def save(self, article: Article) -> None: ...


class Clock(Protocol):
    def now(self) -> datetime: ...
```

`backend/src/publishing/application/use_cases/publish_article.py` :
```python
from src.publishing.application.ports import ArticleRepository, Clock
from src.publishing.domain.article import Article


class PublishArticle:
    def __init__(self, repo: ArticleRepository, clock: Clock):
        self.repo = repo
        self.clock = clock

    def execute(self, article_id: int) -> Article:
        article = self.repo.get(article_id)
        article.publish(now=self.clock.now())
        self.repo.save(article)
        return article
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest src/publishing/application -v` → Expected: `2 passed` (toujours sans DB).

- [ ] **Step 5: Commit**

```bash
git add backend/src/publishing/application && git commit -m "feat: use case PublishArticle + ports (repo, clock)"
```

---

### Task 5: publishing/infrastructure — modèles ORM + app Django + migrations + admin

**Files:**
- Create: `backend/src/publishing/apps.py`, `backend/src/publishing/infrastructure/__init__.py`, `backend/src/publishing/infrastructure/models.py`, `backend/src/publishing/interface/__init__.py`, `backend/src/publishing/interface/admin.py`, `backend/src/publishing/migrations/__init__.py`
- Modify: `backend/config/settings/base.py` (INSTALLED_APPS)
- Test: `backend/src/publishing/infrastructure/test_models.py`

**Interfaces:**
- Produces: modèles `ArticleModel` (db_table `article`), `SeriesModel`, `TagModel` avec les champs de la spec §4 ; contrainte d'unicité `(slug, locale)` ; `reading_time` recalculé dans `save()`.

- [ ] **Step 1: déclarer l'app**

`backend/src/publishing/apps.py` :
```python
from django.apps import AppConfig


class PublishingConfig(AppConfig):
    name = "src.publishing"
    label = "publishing"
```

Dans `backend/config/settings/base.py`, ajouter à la fin d'`INSTALLED_APPS` :
```python
    "src.publishing.apps.PublishingConfig",
```

- [ ] **Step 2: Write the failing test**

`backend/src/publishing/infrastructure/test_models.py` :
```python
import pytest
from django.db import IntegrityError

from src.publishing.infrastructure.models import ArticleModel, TagModel

pytestmark = pytest.mark.django_db


def test_creation_et_reading_time():
    a = ArticleModel.objects.create(
        slug="premier", locale="fr", kind="standard",
        title="T", excerpt="E", body_mdx="mot " * 450,
    )
    assert a.status == "draft"
    assert a.reading_time == 2


def test_slug_unique_par_locale():
    ArticleModel.objects.create(slug="x", locale="fr", kind="standard",
                                title="T", excerpt="E", body_mdx="a")
    ArticleModel.objects.create(slug="x", locale="en", kind="standard",
                                title="T", excerpt="E", body_mdx="a")   # OK
    with pytest.raises(IntegrityError):
        ArticleModel.objects.create(slug="x", locale="fr", kind="standard",
                                    title="T", excerpt="E", body_mdx="a")


def test_tags():
    a = ArticleModel.objects.create(slug="y", locale="fr", kind="til",
                                    title="T", excerpt="E", body_mdx="a")
    a.tags.add(TagModel.objects.create(name="docker"))
    assert list(a.tags.values_list("name", flat=True)) == ["docker"]
```

Run: `pytest src/publishing/infrastructure -v` → Expected: FAIL (modèles inexistants).

- [ ] **Step 3: Implementation**

`backend/src/publishing/infrastructure/models.py` :
```python
from django.db import models


class TagModel(models.Model):
    name = models.SlugField(unique=True)

    class Meta:
        db_table = "tag"

    def __str__(self):
        return self.name


class SeriesModel(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)

    class Meta:
        db_table = "series"
        verbose_name_plural = "series"

    def __str__(self):
        return self.title


class ArticleModel(models.Model):
    KINDS = [("standard", "standard"), ("code_3d", "code_3d"), ("til", "til")]
    STATUSES = [("draft", "draft"), ("published", "published"), ("archived", "archived")]
    LOCALES = [("fr", "fr"), ("en", "en")]

    slug = models.SlugField()
    locale = models.CharField(max_length=2, choices=LOCALES, default="fr")
    translation_of = models.ForeignKey("self", null=True, blank=True,
                                       on_delete=models.SET_NULL,
                                       related_name="translations")
    kind = models.CharField(max_length=10, choices=KINDS, default="standard")
    title = models.CharField(max_length=300)
    excerpt = models.TextField(blank=True)
    body_mdx = models.TextField()
    scene = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUSES, default="draft")
    published_at = models.DateTimeField(null=True, blank=True)
    reading_time = models.PositiveIntegerField(default=1)
    series = models.ForeignKey(SeriesModel, null=True, blank=True,
                               on_delete=models.SET_NULL, related_name="articles")
    series_order = models.PositiveIntegerField(default=0)
    tags = models.ManyToManyField(TagModel, blank=True, related_name="articles")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "article"
        constraints = [models.UniqueConstraint(fields=["slug", "locale"],
                                               name="uniq_slug_locale")]
        ordering = ["-published_at"]

    def save(self, *args, **kwargs):
        self.reading_time = max(1, round(len(self.body_mdx.split()) / 200))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.locale}] {self.title}"
```

`backend/src/publishing/interface/admin.py` :
```python
from django.contrib import admin

from src.publishing.infrastructure.models import ArticleModel, SeriesModel, TagModel


@admin.register(ArticleModel)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "locale", "kind", "status", "published_at", "reading_time")
    list_filter = ("status", "kind", "locale", "tags")
    search_fields = ("title", "slug", "body_mdx")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("reading_time",)


admin.site.register(SeriesModel)
admin.site.register(TagModel)
```

Pour que l'admin soit chargé, `backend/src/publishing/apps.py` devient :
```python
from django.apps import AppConfig


class PublishingConfig(AppConfig):
    name = "src.publishing"
    label = "publishing"

    def ready(self):
        from src.publishing.interface import admin  # noqa: F401
```

- [ ] **Step 4: migrations + tests verts**

```bash
python manage.py makemigrations publishing
pytest src/publishing/infrastructure -v
```
Expected: migration `0001_initial` créée, `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/publishing backend/config
git commit -m "feat: modèles ORM Article/Series/Tag + admin (éditeur v1)"
```

---

### Task 6: publishing/infrastructure — repository Django (implémente le port)

**Files:**
- Create: `backend/src/publishing/infrastructure/repositories.py`
- Test: `backend/src/publishing/infrastructure/test_repositories.py`

**Interfaces:**
- Consumes: `ArticleRepository` port (Task 4), `ArticleModel` (Task 5), entité `Article` (Task 3).
- Produces: `DjangoArticleRepository` avec `get(article_id) -> Article` et `save(article) -> None` ; `SystemClock` avec `now()`.

- [ ] **Step 1: Write the failing test**

`backend/src/publishing/infrastructure/test_repositories.py` :
```python
from datetime import datetime, timezone
import pytest

from src.publishing.application.ports import ArticleIntrouvable
from src.publishing.application.use_cases.publish_article import PublishArticle
from src.publishing.domain.article import ArticleStatus
from src.publishing.infrastructure.models import ArticleModel
from src.publishing.infrastructure.repositories import DjangoArticleRepository

pytestmark = pytest.mark.django_db


class FixedClock:
    def now(self):
        return datetime(2026, 7, 3, tzinfo=timezone.utc)


def test_get_convertit_en_entite():
    row = ArticleModel.objects.create(slug="a", locale="fr", kind="standard",
                                      title="T", excerpt="E", body_mdx="mot mot")
    art = DjangoArticleRepository().get(row.id)
    assert art.slug.value == "a"
    assert art.status is ArticleStatus.DRAFT


def test_get_introuvable():
    with pytest.raises(ArticleIntrouvable):
        DjangoArticleRepository().get(12345)


def test_use_case_publish_de_bout_en_bout():
    row = ArticleModel.objects.create(slug="a", locale="fr", kind="standard",
                                      title="T", excerpt="E", body_mdx="mot")
    PublishArticle(DjangoArticleRepository(), FixedClock()).execute(row.id)
    row.refresh_from_db()
    assert row.status == "published"
    assert row.published_at is not None
```

Run: `pytest src/publishing/infrastructure/test_repositories.py -v` → Expected: FAIL.

- [ ] **Step 2: Implementation**

`backend/src/publishing/infrastructure/repositories.py` :
```python
from datetime import datetime, timezone

from src.publishing.application.ports import ArticleIntrouvable
from src.publishing.domain.article import Article, ArticleKind, ArticleStatus
from src.publishing.infrastructure.models import ArticleModel
from src.shared_kernel.domain.values import Slug, Locale, MarkdownBody


class SystemClock:
    def now(self) -> datetime:
        return datetime.now(timezone.utc)


class DjangoArticleRepository:
    def get(self, article_id: int) -> Article:
        try:
            row = ArticleModel.objects.get(pk=article_id)
        except ArticleModel.DoesNotExist:
            raise ArticleIntrouvable(article_id)
        art = Article(
            slug=Slug(row.slug), locale=Locale(row.locale),
            kind=ArticleKind(row.kind), title=row.title, excerpt=row.excerpt,
            body=MarkdownBody(row.body_mdx), scene=row.scene,
            status=ArticleStatus(row.status), published_at=row.published_at,
        )
        art.id = row.id
        return art

    def save(self, article: Article) -> None:
        ArticleModel.objects.filter(pk=article.id).update(
            slug=article.slug.value,
            status=article.status.value,
            published_at=article.published_at,
        )
```

- [ ] **Step 3: Run to verify pass**

Run: `pytest src/publishing -v` → Expected: tous les tests publishing passent.

- [ ] **Step 4: Commit**

```bash
git add backend/src/publishing/infrastructure
git commit -m "feat: DjangoArticleRepository + SystemClock (port implémenté)"
```

---

### Task 7: recherche full-text Postgres

**Files:**
- Create: `backend/src/publishing/infrastructure/search.py`
- Test: `backend/src/publishing/infrastructure/test_search.py`

**Interfaces:**
- Produces: `search_published(q: str, locale: str = "fr") -> QuerySet[ArticleModel]` — articles publiés triés par pertinence (`rank`), annotés `.rank`.

- [ ] **Step 1: Write the failing test**

`backend/src/publishing/infrastructure/test_search.py` :
```python
from datetime import datetime, timezone
import pytest

from src.publishing.infrastructure.models import ArticleModel
from src.publishing.infrastructure.search import search_published

pytestmark = pytest.mark.django_db
NOW = datetime(2026, 7, 3, tzinfo=timezone.utc)


def publie(slug, title, body):
    return ArticleModel.objects.create(
        slug=slug, locale="fr", kind="standard", title=title,
        excerpt="", body_mdx=body, status="published", published_at=NOW)


def test_trouve_par_corps_et_titre():
    publie("healthcheck", "Docker menteur", "le healthcheck curl échouait")
    publie("autre", "Sans rapport", "du texte python")
    hits = list(search_published("healthcheck docker"))
    assert [a.slug for a in hits] == ["healthcheck"]


def test_ignore_les_brouillons():
    ArticleModel.objects.create(slug="draft", locale="fr", kind="standard",
                                title="healthcheck", excerpt="", body_mdx="healthcheck")
    assert list(search_published("healthcheck")) == []
```

Run: `pytest src/publishing/infrastructure/test_search.py -v` → Expected: FAIL.

- [ ] **Step 2: Implementation**

`backend/src/publishing/infrastructure/search.py` :
```python
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector

from src.publishing.infrastructure.models import ArticleModel

_VECTOR = SearchVector("title", weight="A") + SearchVector("body_mdx", weight="B")


def search_published(q: str, locale: str = "fr"):
    query = SearchQuery(q, config="french")
    return (
        ArticleModel.objects
        .filter(status="published", locale=locale)
        .annotate(rank=SearchRank(_VECTOR, query))
        .filter(rank__gt=0.01)
        .order_by("-rank")
    )
```

- [ ] **Step 3: Run to verify pass**

Run: `pytest src/publishing/infrastructure/test_search.py -v` → Expected: `2 passed`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/publishing/infrastructure
git commit -m "feat: recherche full-text Postgres (config french, rank)"
```

---

### Task 8: API publique DRF — articles, séries, recherche

**Files:**
- Create: `backend/src/publishing/interface/serializers.py`, `backend/src/publishing/interface/views.py`, `backend/src/publishing/interface/urls.py`
- Modify: `backend/config/urls.py`
- Test: `backend/src/publishing/interface/test_api.py`

**Interfaces:**
- Consumes: `ArticleModel`, `search_published` (Tasks 5, 7).
- Produces: endpoints `GET /api/v1/articles/` (published only ; filtres `?kind=&tag=&locale=`), `GET /api/v1/articles/<slug>/?locale=fr`, `GET /api/v1/series/`, `GET /api/v1/search/?q=&locale=`, `GET /api/v1/schema/` (OpenAPI). Champs liste : `slug, locale, kind, title, excerpt, reading_time, published_at, tags` ; détail : + `body_mdx, scene, series`.

- [ ] **Step 1: Write the failing tests**

`backend/src/publishing/interface/test_api.py` :
```python
from datetime import datetime, timezone
import pytest
from rest_framework.test import APIClient

from src.publishing.infrastructure.models import ArticleModel, TagModel

pytestmark = pytest.mark.django_db
NOW = datetime(2026, 7, 3, tzinfo=timezone.utc)


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def articles():
    pub = ArticleModel.objects.create(
        slug="singleton", locale="fr", kind="code_3d", title="Le singleton",
        excerpt="E", body_mdx="corps", scene={"version": 2, "pattern": "singleton"},
        status="published", published_at=NOW)
    pub.tags.add(TagModel.objects.create(name="python"))
    ArticleModel.objects.create(slug="brouillon", locale="fr", kind="standard",
                                title="Draft", excerpt="", body_mdx="x")
    return pub


def test_liste_ne_montre_que_le_publie(client, articles):
    data = client.get("/api/v1/articles/").json()
    assert data["count"] == 1
    assert data["results"][0]["slug"] == "singleton"
    assert "body_mdx" not in data["results"][0]


def test_filtre_par_kind(client, articles):
    assert client.get("/api/v1/articles/?kind=til").json()["count"] == 0
    assert client.get("/api/v1/articles/?kind=code_3d").json()["count"] == 1


def test_detail_contient_scene(client, articles):
    data = client.get("/api/v1/articles/singleton/?locale=fr").json()
    assert data["scene"]["pattern"] == "singleton"
    assert data["tags"] == ["python"]


def test_detail_404_pour_brouillon(client, articles):
    assert client.get("/api/v1/articles/brouillon/").status_code == 404


def test_recherche(client, articles):
    data = client.get("/api/v1/search/?q=singleton").json()
    assert data["count"] == 1
```

Run: `pytest src/publishing/interface -v` → Expected: FAIL (404 partout).

- [ ] **Step 2: Implementation**

`backend/src/publishing/interface/serializers.py` :
```python
from rest_framework import serializers

from src.publishing.infrastructure.models import ArticleModel, SeriesModel


class ArticleListSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")

    class Meta:
        model = ArticleModel
        fields = ["slug", "locale", "kind", "title", "excerpt",
                  "reading_time", "published_at", "tags"]


class ArticleDetailSerializer(ArticleListSerializer):
    series = serializers.SlugRelatedField(read_only=True, slug_field="slug")

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + ["body_mdx", "scene", "series"]


class SeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeriesModel
        fields = ["slug", "title"]
```

`backend/src/publishing/interface/views.py` :
```python
from rest_framework import generics

from src.publishing.infrastructure.models import ArticleModel, SeriesModel
from src.publishing.infrastructure.search import search_published
from src.publishing.interface.serializers import (
    ArticleDetailSerializer, ArticleListSerializer, SeriesSerializer)


def _published(locale=None):
    qs = ArticleModel.objects.filter(status="published").prefetch_related("tags")
    if locale:
        qs = qs.filter(locale=locale)
    return qs


class ArticleList(generics.ListAPIView):
    serializer_class = ArticleListSerializer

    def get_queryset(self):
        qs = _published(self.request.query_params.get("locale", "fr"))
        if kind := self.request.query_params.get("kind"):
            qs = qs.filter(kind=kind)
        if tag := self.request.query_params.get("tag"):
            qs = qs.filter(tags__name=tag)
        return qs


class ArticleDetail(generics.RetrieveAPIView):
    serializer_class = ArticleDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return _published(self.request.query_params.get("locale", "fr"))


class SeriesList(generics.ListAPIView):
    queryset = SeriesModel.objects.all()
    serializer_class = SeriesSerializer


class SearchList(generics.ListAPIView):
    serializer_class = ArticleListSerializer

    def get_queryset(self):
        q = self.request.query_params.get("q", "")
        locale = self.request.query_params.get("locale", "fr")
        return search_published(q, locale) if q else ArticleModel.objects.none()
```

`backend/src/publishing/interface/urls.py` :
```python
from django.urls import path

from src.publishing.interface import views

urlpatterns = [
    path("articles/", views.ArticleList.as_view()),
    path("articles/<slug:slug>/", views.ArticleDetail.as_view()),
    path("series/", views.SeriesList.as_view()),
    path("search/", views.SearchList.as_view()),
]
```

`backend/config/urls.py` devient :
```python
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("src.publishing.interface.urls")),
    path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

- [ ] **Step 3: Run to verify pass**

Run: `pytest src/publishing/interface -v` → Expected: `5 passed`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/publishing/interface backend/config/urls.py
git commit -m "feat: API publique /api/v1 (articles, séries, recherche, schéma OpenAPI)"
```

---

### Task 9: sorties machine — llms.txt, article en .md, flux RSS

**Files:**
- Create: `backend/src/publishing/interface/markdown_views.py`, `backend/src/publishing/interface/feeds.py`
- Modify: `backend/src/publishing/interface/urls.py`
- Test: `backend/src/publishing/interface/test_markdown.py`

**Interfaces:**
- Produces: `GET /api/v1/llms.txt` (index markdown, `text/markdown`), `GET /api/v1/articles/<slug>.md` (front-matter + body, 404 si non publié), `GET /api/v1/rss.xml` (RSS 2.0, 20 derniers).

- [ ] **Step 1: Write the failing tests**

`backend/src/publishing/interface/test_markdown.py` :
```python
from datetime import datetime, timezone
import pytest
from django.test import Client

from src.publishing.infrastructure.models import ArticleModel

pytestmark = pytest.mark.django_db
NOW = datetime(2026, 7, 3, tzinfo=timezone.utc)


@pytest.fixture
def publie():
    return ArticleModel.objects.create(
        slug="singleton", locale="fr", kind="standard", title="Le singleton",
        excerpt="Résumé.", body_mdx="# Titre\n\ncorps", status="published",
        published_at=NOW)


def test_llms_txt(publie):
    r = Client().get("/api/v1/llms.txt")
    assert r.status_code == 200
    assert r["Content-Type"].startswith("text/markdown")
    assert "Le singleton" in r.content.decode()
    assert "/fr/articles/singleton" in r.content.decode()


def test_article_md(publie):
    r = Client().get("/api/v1/articles/singleton.md")
    body = r.content.decode()
    assert body.startswith("---\ntitle: Le singleton")
    assert "# Titre" in body


def test_article_md_404_si_brouillon():
    ArticleModel.objects.create(slug="d", locale="fr", kind="standard",
                                title="D", excerpt="", body_mdx="x")
    assert Client().get("/api/v1/articles/d.md").status_code == 404


def test_rss(publie):
    r = Client().get("/api/v1/rss.xml")
    assert r.status_code == 200
    assert b"<rss" in r.content and b"Le singleton" in r.content
```

Run: `pytest src/publishing/interface/test_markdown.py -v` → Expected: FAIL.

- [ ] **Step 2: Implementation**

`backend/src/publishing/interface/markdown_views.py` :
```python
from django.http import Http404, HttpResponse

from src.publishing.infrastructure.models import ArticleModel

MD = "text/markdown; charset=utf-8"


def llms_txt(request):
    lines = ["# blog_tech — expériences Claude Code", "",
             "Articles (markdown brut : /api/v1/articles/<slug>.md) :", ""]
    for a in ArticleModel.objects.filter(status="published"):
        lines.append(f"- [{a.title}](/{a.locale}/articles/{a.slug}) — {a.excerpt}")
    return HttpResponse("\n".join(lines), content_type=MD)


def article_md(request, slug):
    try:
        a = ArticleModel.objects.get(slug=slug, status="published")
    except ArticleModel.DoesNotExist:
        raise Http404
    front = (f"---\ntitle: {a.title}\nlocale: {a.locale}\nkind: {a.kind}\n"
             f"published: {a.published_at:%Y-%m-%d}\n---\n\n")
    return HttpResponse(front + a.body_mdx, content_type=MD)
```

`backend/src/publishing/interface/feeds.py` :
```python
from django.contrib.syndication.views import Feed

from src.publishing.infrastructure.models import ArticleModel


class ArticlesFeed(Feed):
    title = "blog_tech — expériences Claude Code"
    link = "/"
    description = "Tests, problèmes, solutions — parfois en 3D."

    def items(self):
        return ArticleModel.objects.filter(status="published")[:20]

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        return item.excerpt

    def item_link(self, item):
        return f"/{item.locale}/articles/{item.slug}"

    def item_pubdate(self, item):
        return item.published_at
```

Dans `backend/src/publishing/interface/urls.py`, ajouter avant `articles/<slug:slug>/` :
```python
from src.publishing.interface.feeds import ArticlesFeed
from src.publishing.interface.markdown_views import article_md, llms_txt

urlpatterns = [
    path("llms.txt", llms_txt),
    path("rss.xml", ArticlesFeed()),
    path("articles/<slug:slug>.md", article_md),
    # ... routes existantes ensuite
]
```
(⚠️ garder `articles/<slug:slug>.md` AVANT `articles/<slug:slug>/`.)

- [ ] **Step 3: Run to verify pass**

Run: `pytest src/publishing/interface -v` → Expected: `9 passed` (5 API + 4 markdown/RSS).

- [ ] **Step 4: Commit**

```bash
git add backend/src/publishing/interface
git commit -m "feat: llms.txt, article .md et flux RSS (sorties machine)"
```

---

### Task 10: media_library minimal

**Files:**
- Create: `backend/src/media_library/__init__.py`, `backend/src/media_library/apps.py`, `backend/src/media_library/infrastructure/__init__.py`, `backend/src/media_library/infrastructure/models.py`, `backend/src/media_library/interface/__init__.py`, `backend/src/media_library/interface/admin.py`, `backend/src/media_library/migrations/__init__.py`
- Modify: `backend/config/settings/base.py` (INSTALLED_APPS)
- Test: `backend/src/media_library/test_models.py`

**Interfaces:**
- Produces: `MediaAsset(file, alt, created_at)` avec `.url`.

- [ ] **Step 1: Write the failing test**

`backend/src/media_library/test_models.py` :
```python
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from src.media_library.infrastructure.models import MediaAsset

pytestmark = pytest.mark.django_db


def test_upload(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    asset = MediaAsset.objects.create(
        file=SimpleUploadedFile("capture.png", b"png-bytes"), alt="capture")
    assert asset.url.startswith("/media/uploads/")
```

Run: `pytest src/media_library -v` → Expected: FAIL.

- [ ] **Step 2: Implementation**

`backend/src/media_library/apps.py` :
```python
from django.apps import AppConfig


class MediaLibraryConfig(AppConfig):
    name = "src.media_library"
    label = "media_library"

    def ready(self):
        from src.media_library.interface import admin  # noqa: F401
```

`backend/src/media_library/infrastructure/models.py` :
```python
from django.db import models


class MediaAsset(models.Model):
    file = models.FileField(upload_to="uploads/%Y/%m/")
    alt = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "media_asset"

    @property
    def url(self) -> str:
        return self.file.url
```

`backend/src/media_library/interface/admin.py` :
```python
from django.contrib import admin

from src.media_library.infrastructure.models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("file", "alt", "created_at")
```

Ajouter à `INSTALLED_APPS` : `"src.media_library.apps.MediaLibraryConfig",`

- [ ] **Step 3: migration + tests verts**

```bash
python manage.py makemigrations media_library
pytest src/media_library -v
```
Expected: `1 passed`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/media_library backend/config
git commit -m "feat: media_library (upload d'assets via admin)"
```

---

### Task 11: seed de démo + vérification bout-en-bout

**Files:**
- Create: `backend/src/publishing/management/__init__.py`, `backend/src/publishing/management/commands/__init__.py`, `backend/src/publishing/management/commands/seed_demo.py`
- Test: `backend/src/publishing/test_seed.py`

**Interfaces:**
- Produces: `python manage.py seed_demo` — idempotent, crée 1 série + 3 articles publiés (1 `standard`, 1 `til`, 1 `code_3d` avec `scene` v2 conforme à la spec §4).

- [ ] **Step 1: Write the failing test**

`backend/src/publishing/test_seed.py` :
```python
import pytest
from django.core.management import call_command

from src.publishing.infrastructure.models import ArticleModel

pytestmark = pytest.mark.django_db


def test_seed_idempotent():
    call_command("seed_demo")
    call_command("seed_demo")
    assert ArticleModel.objects.filter(status="published").count() == 3
    scene = ArticleModel.objects.get(kind="code_3d").scene
    assert scene["version"] == 2 and scene["pattern"] == "singleton"
```

Run: `pytest src/publishing/test_seed.py -v` → Expected: FAIL (commande inconnue).

- [ ] **Step 2: Implementation**

`backend/src/publishing/management/commands/seed_demo.py` :
```python
from datetime import datetime, timezone

from django.core.management.base import BaseCommand

from src.publishing.infrastructure.models import ArticleModel, SeriesModel, TagModel

NOW = datetime(2026, 7, 3, tzinfo=timezone.utc)

SCENE_SINGLETON = {
    "version": 2,
    "pattern": "singleton",
    "code": {"lang": "python", "source": (
        "class Config:\n    _instance = None\n\n    def __new__(cls):\n"
        "        if cls._instance is None:\n"
        "            cls._instance = super().__new__(cls)\n"
        "        return cls._instance")},
    "pourquoi": "le code s'enroule : une seule sortie, une seule instance",
    "usages": ["config globale", "pool de connexions DB", "logger unique"],
    "annotations": [{"texte": "retenir ça !", "encre": "rouge",
                     "ancre": "ligne:6", "fleche": True}],
    "demo": "exec-laps",
    "camera": {"path": "scroll-track"},
}

ARTICLES = [
    dict(slug="healthcheck-docker-menteur", kind="standard",
         title="Trois heures sur un healthcheck Docker qui mentait",
         excerpt="Le conteneur était healthy, l'app était morte.",
         body_mdx="# Le symptôme\n\nLe healthcheck utilisait curl…",
         tags=["docker", "debugging"], scene=None),
    dict(slug="til-hooks-pretooluse", kind="til",
         title="TIL : les hooks PreToolUse peuvent bloquer un rm -rf",
         excerpt="Petite découverte du jour.",
         body_mdx="Un hook PreToolUse peut refuser un outil…",
         tags=["claude-code"], scene=None),
    dict(slug="singleton-claude-refusait", kind="code_3d",
         title="Le singleton que Claude refusait d'écrire",
         excerpt="Il avait raison, cette fois.",
         body_mdx="# La demande\n\nJe voulais un point d'accès global…",
         tags=["python", "design-patterns"], scene=SCENE_SINGLETON),
]


class Command(BaseCommand):
    help = "Crée la série et les 3 articles de démonstration (idempotent)."

    def handle(self, *args, **options):
        serie, _ = SeriesModel.objects.get_or_create(
            slug="galeres-docker", defaults={"title": "Mes galères Docker"})
        for spec in ARTICLES:
            tags = spec.pop("tags")
            art, _ = ArticleModel.objects.update_or_create(
                slug=spec["slug"], locale="fr",
                defaults={**spec, "status": "published", "published_at": NOW,
                          "series": serie if spec["kind"] == "standard" else None})
            art.tags.set([TagModel.objects.get_or_create(name=t)[0] for t in tags])
        self.stdout.write(self.style.SUCCESS("seed_demo : 3 articles publiés"))
```

- [ ] **Step 3: tests + vérification manuelle bout-en-bout**

```bash
pytest -v                       # TOUTE la suite backend
python manage.py migrate && python manage.py seed_demo
python manage.py runserver &
sleep 2
curl -s http://127.0.0.1:8000/api/v1/articles/ | python3 -m json.tool | head -20
curl -s http://127.0.0.1:8000/api/v1/search/?q=singleton | python3 -m json.tool | head -8
curl -s http://127.0.0.1:8000/api/v1/llms.txt
kill %1
```
Expected: suite verte, `count: 3`, la recherche trouve le singleton, llms.txt liste les 3 articles.

- [ ] **Step 4: Commit final**

```bash
git add -A && git commit -m "feat: seed de démo + vérification bout-en-bout de l'API"
```

---

## Suite

**Plan 1B (frontend Next.js FSD)** sera écrit quand 1A tourne : squelette FSD +
design system porté du prototype (`prototype/proto.css`), pages home/article/
series/search sur l'API réelle, i18n `[locale]`, llms.txt/RSS proxifiés,
Steiger + Vitest + smoke Playwright.
