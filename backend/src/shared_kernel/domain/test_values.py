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
