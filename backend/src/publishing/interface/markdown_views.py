from django.http import Http404, HttpResponse

from src.publishing.infrastructure.models import ArticleModel

MD = "text/markdown; charset=utf-8"


def llms_txt(request):
    lines = ["# blog_tech — expériences Claude Code", "",
             "Articles (markdown brut : /api/v1/articles/<slug>.md) :", ""]
    for a in ArticleModel.objects.filter(status="published"):
        lines.append(f"- [{a.title}](/{a.locale}/articles/{a.slug}) — {a.excerpt}")
    return HttpResponse("\n".join(lines), content_type=MD)


def article_md(request, slug):
    try:
        a = ArticleModel.objects.get(slug=slug, status="published")
    except ArticleModel.DoesNotExist:
        raise Http404
    front = (f"---\ntitle: {a.title}\nlocale: {a.locale}\nkind: {a.kind}\n"
             f"published: {a.published_at:%Y-%m-%d}\n---\n\n")
    return HttpResponse(front + a.body_mdx, content_type=MD)
