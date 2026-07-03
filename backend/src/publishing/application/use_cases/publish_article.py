from src.publishing.application.ports import ArticleRepository, Clock
from src.publishing.domain.article import Article


class PublishArticle:
    def __init__(self, repo: ArticleRepository, clock: Clock):
        self.repo = repo
        self.clock = clock

    def execute(self, article_id: int) -> Article:
        article = self.repo.get(article_id)
        article.publish(now=self.clock.now())
        self.repo.save(article)
        return article
