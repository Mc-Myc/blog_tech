from datetime import datetime, timezone

from src.publishing.application.ports import ArticleIntrouvable
from src.publishing.domain.article import Article, ArticleKind, ArticleStatus
from src.publishing.infrastructure.models import ArticleModel
from src.shared_kernel.domain.values import Slug, Locale, MarkdownBody


class SystemClock:
    def now(self) -> datetime:
        return datetime.now(timezone.utc)


class DjangoArticleRepository:
    def get(self, article_id: int) -> Article:
        try:
            row = ArticleModel.objects.get(pk=article_id)
        except ArticleModel.DoesNotExist:
            raise ArticleIntrouvable(article_id)
        art = Article(
            slug=Slug(row.slug), locale=Locale(row.locale),
            kind=ArticleKind(row.kind), title=row.title, excerpt=row.excerpt,
            body=MarkdownBody(row.body_mdx), scene=row.scene,
            status=ArticleStatus(row.status), published_at=row.published_at,
        )
        art.id = row.id
        return art

    def save(self, article: Article) -> None:
        ArticleModel.objects.filter(pk=article.id).update(
            slug=article.slug.value,
            status=article.status.value,
            published_at=article.published_at,
        )
