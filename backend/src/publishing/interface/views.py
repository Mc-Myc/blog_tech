from rest_framework import generics

from src.publishing.infrastructure.models import ArticleModel, SeriesModel
from src.publishing.infrastructure.search import search_published
from src.publishing.interface.serializers import (
    ArticleDetailSerializer, ArticleListSerializer, SeriesSerializer)


def _published(locale=None):
    qs = ArticleModel.objects.filter(status="published").prefetch_related("tags")
    if locale:
        qs = qs.filter(locale=locale)
    return qs


class ArticleList(generics.ListAPIView):
    serializer_class = ArticleListSerializer

    def get_queryset(self):
        qs = _published(self.request.query_params.get("locale") or "fr")
        if kind := self.request.query_params.get("kind"):
            qs = qs.filter(kind=kind)
        if tag := self.request.query_params.get("tag"):
            qs = qs.filter(tags__name=tag)
        return qs


class ArticleDetail(generics.RetrieveAPIView):
    serializer_class = ArticleDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return _published(self.request.query_params.get("locale") or "fr")


class SeriesList(generics.ListAPIView):
    queryset = SeriesModel.objects.all()
    serializer_class = SeriesSerializer


class SearchList(generics.ListAPIView):
    serializer_class = ArticleListSerializer

    def get_queryset(self):
        q = self.request.query_params.get("q", "")
        locale = self.request.query_params.get("locale") or "fr"
        return search_published(q, locale) if q else ArticleModel.objects.none()
