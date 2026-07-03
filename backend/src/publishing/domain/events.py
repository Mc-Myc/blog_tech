from dataclasses import dataclass


@dataclass(frozen=True)
class ArticlePublished:
    slug: str
    locale: str
