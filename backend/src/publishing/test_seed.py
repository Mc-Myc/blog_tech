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
