# Patrons d'architecture — le geste : ORGANISER

L'échelle au-dessus des patterns GoF : ils structurent des applications
entières, pas des objets. (Sources d'étude : Wikipedia FR — IoC, DI, MVC.)

---

## Inversion de contrôle (IoC)

**Intention** : renverser le sens du contrôle — ce n'est plus ton code qui
appelle le framework, c'est le framework qui appelle ton code aux bons moments.
**Forme 3D** : *la boucle retournée* — une flèche qui part de ton code, fait le
grand tour, et revient POINTER VERS ton code.
**Démo** : version classique : ta flèche appelle la lib ; on retourne la
boucle : le framework tient la flèche et c'est toi qui es appelé (hooks,
handlers, lifecycle).
**Quand** : frameworks (Django appelle tes views, React tes composants),
plugins, hooks de cycle de vie — le principe d'Hollywood : « ne nous appelez
pas, on vous appellera ».
**Lien blog** : les hooks de Claude Code, les views Django du blog, les
composants Next.js — tout le projet vit en IoC.
**À ne pas confondre avec** : DI (une *technique* d'IoC parmi d'autres —
l'IoC est le principe, la DI un moyen).

---

## Injection de dépendances (DI)

**Intention** : fournir aux objets leurs dépendances depuis l'extérieur au
lieu de les laisser les construire eux-mêmes.
**Forme 3D** : *l'entonnoir* — les dépendances descendent d'en haut dans
l'objet ouvert ; rien ne remonte jamais chercher.
**Démo** : l'objet ouvre son entonnoir, la config + le repo + le logger
tombent dedans ; on remplace ce qui tombe (mock) → l'objet ne voit pas la
différence : testable.
**Quand** : partout où un singleton démange (cf. l'article fondateur du
blog) ; use cases hexagonaux (les ports injectés) ; tests.
**Formes concrètes** : par constructeur (la meilleure par défaut), par setter,
par interface ; conteneurs DI (Spring, le `@Qualifier` de NutriChain).
**Pièges** : sur-injection (8 dépendances = l'objet fait trop) ; conteneurs
magiques illisibles.
**Exemple minimal** (python) :
```python
class PublishArticle:
    def __init__(self, repo: ArticleRepository, clock: Clock):
        self.repo, self.clock = repo, clock   # tombés de l'entonnoir

use_case = PublishArticle(PgArticleRepo(), SystemClock())
```
**À ne pas confondre avec** : Service Locator (l'objet VA CHERCHER — c'est
l'anti-forme de l'entonnoir), Singleton (l'accès global caché).

---

## Modèle-Vue-Contrôleur (MVC)

**Intention** : séparer les données (Modèle), leur présentation (Vue) et la
logique qui les relie (Contrôleur).
**Forme 3D** : *le triangle des rôles* — trois boîtes aux trois coins ;
les flèches montrent qui a le droit de parler à qui.
**Démo** : l'utilisateur touche la Vue → le Contrôleur traduit → le Modèle
change → la Vue se rafraîchit. Le tour du triangle, toujours dans ce sens.
**Variantes** : MVT de Django (le Template est la vue, la view Django le
contrôleur), MVVM, MVP — même triangle, arêtes déplacées.
**Lien blog** : le backend du blog est du MVT Django + l'hexagonal par-dessus ;
le front FSD sépare pages (vue) / features (contrôleur) / entities (modèle).
**Pièges** : le contrôleur-fourre-tout (fat controller) ; la logique métier
qui fuit dans les vues.
**À ne pas confondre avec** : l'hexagonal (sépare le DOMAINE de la technique ;
MVC sépare la PRÉSENTATION des données — les deux se combinent).
