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
