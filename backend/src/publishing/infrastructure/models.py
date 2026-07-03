from django.db import models


class TagModel(models.Model):
    name = models.SlugField(unique=True)

    class Meta:
        db_table = "tag"

    def __str__(self):
        return self.name


class SeriesModel(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)

    class Meta:
        db_table = "series"
        verbose_name_plural = "series"

    def __str__(self):
        return self.title


class ArticleModel(models.Model):
    KINDS = [("standard", "standard"), ("code_3d", "code_3d"), ("til", "til")]
    STATUSES = [("draft", "draft"), ("published", "published"), ("archived", "archived")]
    LOCALES = [("fr", "fr"), ("en", "en")]

    slug = models.SlugField()
    locale = models.CharField(max_length=2, choices=LOCALES, default="fr")
    translation_of = models.ForeignKey("self", null=True, blank=True,
                                       on_delete=models.SET_NULL,
                                       related_name="translations")
    kind = models.CharField(max_length=10, choices=KINDS, default="standard")
    title = models.CharField(max_length=300)
    excerpt = models.TextField(blank=True)
    body_mdx = models.TextField()
    scene = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUSES, default="draft")
    published_at = models.DateTimeField(null=True, blank=True)
    reading_time = models.PositiveIntegerField(default=1)
    series = models.ForeignKey(SeriesModel, null=True, blank=True,
                               on_delete=models.SET_NULL, related_name="articles")
    series_order = models.PositiveIntegerField(default=0)
    tags = models.ManyToManyField(TagModel, blank=True, related_name="articles")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "article"
        constraints = [models.UniqueConstraint(fields=["slug", "locale"],
                                               name="uniq_slug_locale")]
        ordering = ["-published_at"]

    def save(self, *args, **kwargs):
        self.reading_time = max(1, round(len(self.body_mdx.split()) / 200))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.locale}] {self.title}"
