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
