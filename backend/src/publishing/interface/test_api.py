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
