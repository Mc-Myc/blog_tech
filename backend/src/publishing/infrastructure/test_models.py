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
