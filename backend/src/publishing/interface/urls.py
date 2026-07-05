from django.urls import path

from src.publishing.interface import views

urlpatterns = [
    path("articles/", views.ArticleList.as_view()),
    path("articles/<slug:slug>/", views.ArticleDetail.as_view()),
    path("series/", views.SeriesList.as_view()),
    path("search/", views.SearchList.as_view()),
]
