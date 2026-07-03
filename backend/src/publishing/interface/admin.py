from django.contrib import admin

from src.publishing.infrastructure.models import ArticleModel, SeriesModel, TagModel


@admin.register(ArticleModel)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "locale", "kind", "status", "published_at", "reading_time")
    list_filter = ("status", "kind", "locale", "tags")
    search_fields = ("title", "slug", "body_mdx")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("reading_time",)


admin.site.register(SeriesModel)
admin.site.register(TagModel)
