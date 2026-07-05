from datetime import datetime, timezone

from django.core.management.base import BaseCommand

from src.publishing.infrastructure.models import ArticleModel, SeriesModel, TagModel

NOW = datetime(2026, 7, 3, tzinfo=timezone.utc)

SCENE_SINGLETON = {
    "version": 2,
    "pattern": "singleton",
    "code": {"lang": "python", "source": (
        "class Config:\n    _instance = None\n\n    def __new__(cls):\n"
        "        if cls._instance is None:\n"
        "            cls._instance = super().__new__(cls)\n"
        "        return cls._instance")},
    "pourquoi": "le code s'enroule : une seule sortie, une seule instance",
    "usages": ["config globale", "pool de connexions DB", "logger unique"],
    "annotations": [{"texte": "retenir ça !", "encre": "rouge",
                     "ancre": "ligne:6", "fleche": True}],
    "demo": "exec-laps",
    "camera": {"path": "scroll-track"},
}

ARTICLES = [
    dict(slug="healthcheck-docker-menteur", kind="standard",
         title="Trois heures sur un healthcheck Docker qui mentait",
         excerpt="Le conteneur était healthy, l'app était morte.",
         body_mdx="# Le symptôme\n\nLe healthcheck utilisait curl…",
         tags=["docker", "debugging"], scene=None),
    dict(slug="til-hooks-pretooluse", kind="til",
         title="TIL : les hooks PreToolUse peuvent bloquer un rm -rf",
         excerpt="Petite découverte du jour.",
         body_mdx="Un hook PreToolUse peut refuser un outil…",
         tags=["claude-code"], scene=None),
    dict(slug="singleton-claude-refusait", kind="code_3d",
         title="Le singleton que Claude refusait d'écrire",
         excerpt="Il avait raison, cette fois.",
         body_mdx="# La demande\n\nJe voulais un point d'accès global…",
         tags=["python", "design-patterns"], scene=SCENE_SINGLETON),
]


class Command(BaseCommand):
    help = "Crée la série et les 3 articles de démonstration (idempotent)."

    def handle(self, *args, **options):
        serie, _ = SeriesModel.objects.get_or_create(
            slug="galeres-docker", defaults={"title": "Mes galères Docker"})
        for spec in ARTICLES:
            spec_copy = spec.copy()
            tags = spec_copy.pop("tags")
            art, _ = ArticleModel.objects.update_or_create(
                slug=spec_copy["slug"], locale="fr",
                defaults={**spec_copy, "status": "published", "published_at": NOW,
                          "series": serie if spec_copy["kind"] == "standard" else None})
            art.tags.set([TagModel.objects.get_or_create(name=t)[0] for t in tags])
        self.stdout.write(self.style.SUCCESS("seed_demo : 3 articles publiés"))
