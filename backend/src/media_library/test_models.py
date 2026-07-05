import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from src.media_library.infrastructure.models import MediaAsset

pytestmark = pytest.mark.django_db


def test_upload(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path
    asset = MediaAsset.objects.create(
        file=SimpleUploadedFile("capture.png", b"png-bytes"), alt="capture")
    assert asset.url.startswith("/media/uploads/")
