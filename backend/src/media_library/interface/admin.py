from django.contrib import admin

from src.media_library.infrastructure.models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("file", "alt", "created_at")
