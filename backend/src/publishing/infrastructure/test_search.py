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
