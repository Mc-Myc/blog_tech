from django.apps import AppConfig


class MediaLibraryConfig(AppConfig):
    name = "src.media_library"
    label = "media_library"

    def ready(self):
        from src.media_library.interface import admin  # noqa: F401
