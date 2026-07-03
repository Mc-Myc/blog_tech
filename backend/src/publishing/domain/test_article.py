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
