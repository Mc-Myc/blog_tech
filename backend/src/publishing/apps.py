from django.apps import AppConfig


class PublishingConfig(AppConfig):
    name = "src.publishing"
    label = "publishing"

    def ready(self):
        from src.publishing.interface import admin  # noqa: F401
