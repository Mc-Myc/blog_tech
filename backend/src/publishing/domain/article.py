from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum

from src.shared_kernel.domain.values import Slug, Locale, MarkdownBody
from src.publishing.domain.events import ArticlePublished


class ArticleKind(StrEnum):
    STANDARD = "standard"
    CODE_3D = "code_3d"
    TIL = "til"


class ArticleStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class SceneRequise(Exception): ...
class TransitionInterdite(Exception): ...
class SlugImmuable(Exception): ...


@dataclass
class Article:
    slug: Slug
    locale: Locale
    kind: ArticleKind
    title: str
    excerpt: str
    body: MarkdownBody
    scene: dict | None
    status: ArticleStatus = ArticleStatus.DRAFT
    published_at: datetime | None = None
    events: list = field(default_factory=list)
    id: int | None = None

    @classmethod
    def draft(cls, **kw) -> "Article":
        return cls(**kw)

    @property
    def reading_time(self) -> int:
        return self.body.reading_time_minutes

    def publish(self, now: datetime) -> None:
        if self.status is not ArticleStatus.DRAFT:
            raise TransitionInterdite(f"publish depuis {self.status}")
        if self.kind is ArticleKind.CODE_3D and not self.scene:
            raise SceneRequise("un article code_3d exige une scene")
        self.status = ArticleStatus.PUBLISHED
        self.published_at = now
        self.events.append(ArticlePublished(slug=self.slug.value, locale=self.locale.value))

    def archive(self) -> None:
        if self.status is not ArticleStatus.PUBLISHED:
            raise TransitionInterdite(f"archive depuis {self.status}")
        self.status = ArticleStatus.ARCHIVED

    def change_slug(self, new_slug: Slug) -> None:
        if self.status is not ArticleStatus.DRAFT:
            raise SlugImmuable("slug figé après publication")
        self.slug = new_slug
