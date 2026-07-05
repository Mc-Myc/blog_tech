from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector

from src.publishing.infrastructure.models import ArticleModel

_VECTOR = SearchVector("title", weight="A", config="french") + SearchVector("body_mdx", weight="B", config="french")


def search_published(q: str, locale: str = "fr"):
    query = SearchQuery(q, config="french")
    return (
        ArticleModel.objects
        .filter(status="published", locale=locale)
        .annotate(rank=SearchRank(_VECTOR, query))
        .filter(rank__gt=0.01)
        .order_by("-rank")
    )
