from django.contrib.syndication.views import Feed

from src.publishing.infrastructure.models import ArticleModel


class ArticlesFeed(Feed):
    title = "blog_tech — expériences Claude Code"
    link = "/"
    description = "Tests, problèmes, solutions — parfois en 3D."

    def items(self):
        return ArticleModel.objects.filter(status="published")[:20]

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        return item.excerpt

    def item_link(self, item):
        return f"/{item.locale}/articles/{item.slug}"

    def item_pubdate(self, item):
        return item.published_at
