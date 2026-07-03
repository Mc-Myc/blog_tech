from datetime import datetime
from typing import Protocol

from src.publishing.domain.article import Article


class ArticleIntrouvable(Exception): ...


class ArticleRepository(Protocol):
    def get(self, article_id: int) -> Article: ...
    def save(self, article: Article) -> None: ...


class Clock(Protocol):
    def now(self) -> datetime: ...
