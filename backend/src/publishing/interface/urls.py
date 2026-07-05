from django.urls import path

from src.publishing.interface import views
from src.publishing.interface.feeds import ArticlesFeed
from src.publishing.interface.markdown_views import article_md, llms_txt

urlpatterns = [
    path("llms.txt", llms_txt),
    path("rss.xml", ArticlesFeed()),
    path("articles/", views.ArticleList.as_view()),
    path("articles/<slug:slug>.md", article_md),
    path("articles/<slug:slug>/", views.ArticleDetail.as_view()),
    path("series/", views.SeriesList.as_view()),
    path("search/", views.SearchList.as_view()),
]
