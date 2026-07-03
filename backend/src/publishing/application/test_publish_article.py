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
