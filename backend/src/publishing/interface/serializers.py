from rest_framework import serializers

from src.publishing.infrastructure.models import ArticleModel, SeriesModel


class ArticleListSerializer(serializers.ModelSerializer):
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")

    class Meta:
        model = ArticleModel
        fields = ["slug", "locale", "kind", "title", "excerpt",
                  "reading_time", "published_at", "tags"]


class ArticleDetailSerializer(ArticleListSerializer):
    series = serializers.SlugRelatedField(read_only=True, slug_field="slug")

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + ["body_mdx", "scene", "series"]


class SeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeriesModel
        fields = ["slug", "title"]
