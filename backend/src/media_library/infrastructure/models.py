from django.db import models


class MediaAsset(models.Model):
    file = models.FileField(upload_to="uploads/%Y/%m/")
    alt = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "media_asset"

    @property
    def url(self) -> str:
        return self.file.url
