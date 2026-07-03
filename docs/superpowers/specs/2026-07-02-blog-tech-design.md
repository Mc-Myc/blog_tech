# Spec — Blog tech « expériences Claude Code »

**Date** : 2026-07-02
**Statut** : design validé en brainstorming
**Projet** : `~/Sites/Django_nexjs/blog_tech ` (attention : le dossier a un espace final)

---

## 1. Vision

Blog personnel de Marcel pour s'exprimer et partager ses expériences de code avec
Claude Code : tests, problèmes rencontrés, solutions. Expérience de lecture au niveau
de Medium, studio d'édition privé, pipeline qui transforme les sessions Claude Code
en brouillons d'articles.

**Signature du blog** (validée par prototypage, référence : `prototype/`) :
dans les articles `code_3d`, **le code lui-même est écrit en manuscrit 3D et sa
disposition spatiale prend la forme du pattern qu'il implémente** — le singleton
s'enroule en anneau autour de son instance unique, l'observer se déploie en
étoile. Annotations (pourquoi, à quoi ça sert), flèches d'encre et mémos papier
vivent dans le même univers de cahier 3D. Le tout animé : le code s'écrit au
scroll, une bille d'exécution démontre le comportement du pattern.
La formalisation complète (familles, gestes, formes, typographie, motion,
règle des trois formats, contrat JSON `scene` v2) est dans
**`docs/patterns/grammaire-des-formes.md`** — les 25 fiches patterns dans
`docs/patterns/` (création, structurels, comportementaux, architecture).

**Écosystème patterns** : le blog porte aussi un produit — **l'Atlas**
(dictionnaire des 22 patterns + formes 3D), **le Détecteur** (code collé →
patterns détectés, moteur de règles AST réutilisable) et **l'Éditeur de
scènes** (studio). Roadmap des 9 outils dérivés priorisée dans
`docs/patterns/outils.md`. Nouveau bounded context Django : `patterns/`.

**Hors périmètre de cette spec** (specs séparées ultérieures) :

- La **génération ML complète** de scènes depuis le code (au-delà de la
  suggestion du Détecteur prévue en phase 5) — le JSON `scene` v2 (§4) est le
  contrat qui l'attend.
- Les outils des phases 6-7 (API/MCP, GitHub Action, extension VS Code,
  Explorateur, Playground) — cadrés dans `docs/patterns/outils.md`, chacun
  aura sa spec.
- La maturation du framework ContentMagic (session parallèle dans
  `~/Sites/js/framework_ts/contentmagic`). **Le blog n'en dépend pas** : la 3D
  utilise React Three Fiber directement.

## 2. Architecture backend — Django + DRF, hexagonal pragmatique

### Structure

```
backend/
├── manage.py
├── pyproject.toml
├── config/                          # composition root
│   ├── settings/{base,dev,prod}.py
│   ├── urls.py                      # monte /api/v1/ + /admin/
│   └── wsgi.py
└── src/
    ├── shared_kernel/
    │   └── domain/                  # value objects : Slug, Locale, MarkdownBody
    │
    ├── publishing/                  # ═══ CONTEXTE CŒUR (phase 1) ═══
    │   ├── domain/                  # Python pur, ZÉRO import Django
    │   │   ├── article.py           # aggregate root : kind, status, invariants
    │   │   ├── series.py
    │   │   ├── tag.py
    │   │   └── events.py            # ArticlePublished…
    │   ├── application/
    │   │   ├── ports.py             # ArticleRepository (interface)
    │   │   └── use_cases/           # publish_article, schedule_article,
    │   │                            # search_articles, list_feed
    │   ├── infrastructure/
    │   │   ├── models.py            # ORM Django
    │   │   ├── repositories.py      # implémente les ports
    │   │   ├── search.py            # Postgres SearchVector
    │   │   └── mdx.py               # extraction sommaire, reading_time
    │   └── interface/
    │       ├── serializers.py       # DTOs API
    │       ├── views.py             # ViewSets DRF
    │       ├── urls.py
    │       ├── markdown_views.py    # /articles/<slug>.md + /llms.txt
    │       └── admin.py             # éditeur de secours phase 1
    │
    ├── media_library/               # ═══ SUPPORT (phase 1), couches minces ═══
    ├── ingestion/                   # ═══ PIPELINE CLAUDE CODE (phase 2) ═══
    │   ├── domain/                  # CapturedSession, DraftProposal
    │   ├── application/             # ingest_draft, convert_to_article
    │   ├── infrastructure/
    │   └── interface/               # POST /api/v1/ingestion/drafts
    ├── engagement/                  # ═══ CLAPS + COMMENTAIRES (phase 3) ═══
    ├── analytics/                   # ═══ COMPTEUR DE VUES (phase 3) ═══
    └── patterns/                    # ═══ L'ATLAS (phase 4bis) ═══
        ├── domain/                  # Pattern, Forme, Confusion (paires)
        ├── application/             # get_fiche, compare, detect
        ├── infrastructure/          # import depuis docs/patterns/*.md,
        │                            # moteur de détection AST (module autonome)
        └── interface/               # /api/v1/patterns, /api/v1/detect
```

### Règle de dépendance (non négociable)

```
interface ──► application ──► domain ◄── infrastructure
```

- Le domaine ne connaît ni Django ni la DB → testable en pur pytest.
- L'infrastructure implémente les ports définis dans `application/ports.py`.
- **Pragmatique** : pas de double mapping entité↔modèle ORM tant qu'un besoin
  réel ne l'exige pas ; la discipline porte sur la direction des dépendances
  et la pureté du domaine.

## 3. Architecture frontend — Next.js App Router, Feature-Sliced Design

### Structure

```
frontend/
├── app/                              # wrappers MINCES uniquement (règle FSD)
│   ├── layout.tsx
│   ├── [locale]/                     # i18n : /fr/... /en/...
│   │   ├── (public)/
│   │   │   ├── page.tsx                      # → @/pages/home
│   │   │   ├── articles/[slug]/page.tsx      # → @/pages/article
│   │   │   ├── series/[slug]/page.tsx        # → @/pages/series
│   │   │   └── search/page.tsx               # → @/pages/search
│   │   └── (studio)/                 # zone authentifiée
│   │       └── studio/
│   │           ├── page.tsx                  # → @/pages/studio-dashboard
│   │           └── editor/[id]/page.tsx      # → @/pages/studio-editor
│   └── api/                          # routes techniques (og-image, revalidate)
├── pages/.gitkeep                    # bloque le Pages Router legacy
└── src/
    ├── pages/                        # compositions d'écran
    │   ├── home/  article/  series/  search/
    │   └── studio-dashboard/  studio-editor/
    ├── widgets/                      # blocs autonomes
    │   ├── site-shell/               # header, footer, nav, switch de langue
    │   ├── article-reader/           # MDX : highlight, sommaire, progression
    │   ├── article-scene-3d/         # ★ R3F + drei, DYNAMIC IMPORT (phase 4)
    │   │   ├── ui/scene.tsx
    │   │   ├── model/scene-schema.ts # types du JSON `scene`
    │   │   └── lib/pattern-shapes/   # singleton, observer, factory…
    │   ├── editor-canvas/            # MDX + preview live (phase 2)
    │   └── drafts-list/  stats-panel/  ingestion-queue/
    ├── features/                     # interactions
    │   ├── search-articles/  filter-by-tag/  toggle-theme/
    │   ├── copy-markdown/
    │   ├── edit-article/  publish-article/  upload-media/
    │   └── react-to-article/         # claps (phase 3)
    ├── entities/                     # concepts métier (miroir des contexts Django)
    │   ├── article/
    │   │   ├── api/                  # SEUL endroit qui connaît les DTOs DRF
    │   │   ├── model/                # types domaine front, mappers
    │   │   └── ui/                   # ArticleCard, ArticleMeta
    │   └── series/  tag/
    └── shared/                       # agnostique métier
        ├── api/                      # client HTTP typé (fetch + zod)
        ├── ui/                       # design system : boutons, typo, cards
        ├── i18n/                     # dictionnaires fr/en
        └── config/
```

### Règles FSD

- Imports strictement descendants : `pages → widgets → features → entities → shared`.
  Jamais latéraux, jamais montants.
- Chaque slice expose son API publique via `index.ts` (exports nommés explicites).
- **Steiger** en CI pour faire respecter les frontières.
- `app/` ne contient que des re-exports et le câblage framework.

### Correspondance des bounded contexts

| Django | Next.js |
|---|---|
| `publishing` | `entities/article`, `entities/series`, `entities/tag` + widgets de lecture |
| `ingestion` | `widgets/ingestion-queue` + dashboard pipeline |
| `engagement` | `features/react-to-article`, commentaires |
| `analytics` | `widgets/stats-panel` |
| `patterns` | pages atlas/détecteur/comparateur + `entities/pattern` |
| champ `scene` JSON | `widgets/article-scene-3d` (l'Éditeur du studio l'écrit) |

### Style d'API : REST (décision explicite)

REST versionné `/api/v1/` — choisi contre GraphQL et gRPC parce que : un seul
client (le front Next.js), lecture publique massivement cacheable (cache HTTP,
CDN, ISR par URL), pas de besoin d'agrégation multi-sources. Le typage
bout-en-bout est assuré par **drf-spectacular** (schéma OpenAPI généré côté
Django) + génération du client TypeScript typé dans `frontend/src/shared/api/`.
GraphQL ne serait reconsidéré que si plusieurs clients hétérogènes (mobile,
widgets tiers) apparaissent — il s'ajouterait alors à côté de REST, sans le
remplacer.

## 4. Modèle de contenu (contexte `publishing`)

### Article (aggregate root)

| Champ | Type | Notes |
|-------|------|-------|
| `slug` | Slug | unique par locale, immuable après publication |
| `locale` | `fr` \| `en` | défaut `fr` |
| `translation_of` | FK Article nullable | lie les versions FR/EN |
| `kind` | `standard` \| `code_3d` \| `til` | `til` livré en phase 2 |
| `title`, `excerpt` | str | |
| `body_mdx` | text | source de vérité du contenu, toujours présente |
| `scene` | JSON nullable | scène 3D, requise si `kind=code_3d` |
| `status` | `draft` → `published` → `archived` | transitions contrôlées par le domaine |
| `published_at` | datetime nullable | publication programmable |
| `reading_time` | int (minutes) | calculé à la sauvegarde (mots ÷ 200) |
| `series` | FK nullable | |
| `tags` | M2M | |
| `source_session` | FK ingestion nullable | traçabilité session Claude Code → article |

Invariants (dans `domain/article.py`) :

- un article `code_3d` ne peut être publié sans `scene` valide ;
- slug immuable après publication ;
- `published_at` requis pour l'état `published`.

**Series** : parcours ordonné d'articles. **Tag** : taxonomie libre.

### i18n — décision de structure, implémentation progressive

- URLs préfixées : `/fr/articles/<slug>`, `/en/articles/<slug>` ; `/` redirige
  selon `Accept-Language` (défaut `fr`).
- Le modèle porte `locale` + `translation_of` dès la phase 1 ; le contenu EN
  peut arriver bien plus tard sans migration.
- `hreflang` dès qu'une traduction existe.

### Format `scene` v2 (contrat du renderer 3D et de l'Éditeur)

Le renderer **calcule la disposition** du code manuscrit selon le layout du
pattern — l'auteur ne positionne rien à la main :

```json
{
  "version": 2,
  "pattern": "singleton",
  "code": { "lang": "python", "source": "class Config:\n    ..." },
  "pourquoi": "le code s'enroule : une seule sortie, une seule instance",
  "usages": ["config globale", "pool de connexions DB", "logger unique"],
  "traductions": [{ "ligne": 3, "texte": "le portier : toute création passe ici" }],
  "annotations": [{ "texte": "retenir ça !", "encre": "rouge", "ancre": "ligne:6", "fleche": true }],
  "demo": "exec-laps",
  "camera": { "path": "scroll-track" }
}
```

- `pattern` sélectionne un **layout** (anneau, étoile, tapis…) et une **démo
  « aha »** scriptée (singleton : les deux tours de la bille d'exécution).
  Catalogue des 25 formes : `docs/patterns/`.
- `traductions` alimente le survol (ligne manuscrite → version tapée +
  explication) ; `encre` ∈ `bleu` (à retenir) | `rouge` (piège/décision).
- Ce JSON est produit par l'Éditeur du studio (suggestion IA via le Détecteur).

### Langage visuel & motion (validés par prototypage, réf. `prototype/`)

Détail complet : `docs/patterns/grammaire-des-formes.md`. L'essentiel :

- **Typographie deux niveaux** : relief = Shantell Sans bold ; papier = cursive
  fine (La Belle Aurore, encre bleue + rouge du prof) ; lettrage d'affiche =
  Fraunces 900 (face crème + flancs argile + ombre décollée).
- **Règle des trois formats** : code ≤ 8 lignes → manuscrit en forme de
  pattern ; code long → bloc à plat + stickers 3D ancrés + badges de pattern
  aux lignes ; logique multi-classes → UML manuscrit 3D.
- **Vocabulaire motion** : écriture au scroll, pose, tampon, bille d'exécution,
  lueur orbitale, flèche d'encre, survol-traduction — tout désactivé via
  `prefers-reduced-motion`.
- **Garde-fous** : bouton « voir à plat / copier » sur chaque code manuscrit ;
  MDX plat = source (SEO, accessibilité, agents) ; images OG générées depuis
  la forme du pattern (rendu serveur).

## 5. Blog public

**Phase 1 — lecture soignée (pratiques Medium)** : temps de lecture, sommaire
collant, barre de progression, coloration syntaxique + bouton copier, articles
liés (par tags), mode sombre, typographie de lecture (~70 caractères de mesure),
RSS, sitemap, images Open Graph générées, partage social.

**Phase 1 — recherche** : full-text Postgres natif (`SearchVector` sur titre,
corps, tags, par locale), endpoint `/api/v1/search?q=`, barre de recherche.

**Phase 1 — lisible par les IA** : `/llms.txt` (index markdown des articles) et
`/<locale>/articles/<slug>.md` (article en markdown brut) ; bouton « copier en
markdown » sur chaque article.

**Phase 3 — engagement (sans comptes lecteurs)** : réactions anonymes type
« claps » (dédup par IP hashée + cookie), commentaires avec modération a priori
dans le dashboard. Pas de comptes lecteurs — inutile pour un blog personnel.

**Fallback 3D** : le MDX est toujours la source ; la scène 3D est une couche
au-dessus. Sans WebGL ou avec `prefers-reduced-motion`, rendu classique →
SEO et accessibilité préservés.

## 6. Studio (zone privée Next.js)

- **Éditeur** : MDX avec preview live côte à côte, upload d'images, métadonnées
  (tags, série, excerpt, locale), publier/programmer. Admin Django en secours.
- **Dashboard** :
  - *Contenu* (phase 2) : brouillons, statuts, séries/tags, file d'ingestion
  - *Pipeline* (phase 2) : sessions capturées → retravaillées → publiées
  - *Stats* (phase 3) : vues par article (contexte `analytics`, compteur maison)
  - *SEO/perf* (phase 4+) : métas manquantes, Core Web Vitals
- **Auth** : Marcel seul utilisateur. Session Django pour le studio
  (navigateur) ; token d'API statique (DRF TokenAuthentication) pour
  `/blog-capture` et les outils CLI.

## 7. Pipeline Claude Code → blog (contexte `ingestion`)

- **Skill `/blog-capture`** (dans `~/.claude/skills/`) : en fin de session
  intéressante, extrait l'histoire (problème → tentatives → solution), rédige un
  brouillon MDX avec snippets et erreurs réels, POSTe sur
  `/api/v1/ingestion/drafts` (authentifié).
- **Backfill** : `/blog-capture --history` scanne les sessions JSONL de
  `~/.claude/projects/`, score l'intérêt narratif (erreurs résolues, longueur,
  diversité d'outils), propose une liste ; Marcel choisit.
- Les brouillons ingérés apparaissent dans le dashboard avec `source_session`.
- **Trois sources d'ingestion** (validées par les crash-tests du prototype) :
  sessions Claude Code (JSONL), **notebooks `.ipynb`** (cellules → composants :
  code/stdout/warnings/tracebacks/dataframes, carte de pipeline) et **fichiers
  source commentés** (encadrés → pastilles-concept, schémas ASCII → diagrammes,
  javadoc/ADR → encarts cahier, détection de patterns → badges).
- **Évolutions prévues sans changement de contrat** : hook `SessionEnd`
  (capture automatique) et production de brouillons `til`.

## 8. Renderer 3D (phase 4, widget `article-scene-3d`)

- React Three Fiber + drei ; texte manuscrit via `troika-three-text` + police
  handwriting ; animations pilotées au scroll.
- Chargé en `dynamic import` uniquement quand `kind=code_3d` → zéro coût sur
  les articles standard.
- Interprète le JSON `scene` (§4). Catalogue de formes de patterns versionné
  côté front.

## 9. Phasage

| Phase | Livrable | Résultat pour Marcel |
|-------|----------|----------------------|
| 1 | Blog public (lecture, recherche, llms.txt, i18n structurel) + `publishing` + `media_library` + admin Django | premier article publié |
| 2 | Studio (éditeur + dashboard contenu/pipeline) + `ingestion` + `/blog-capture` + backfill + type `til` | écrire depuis ses sessions |
| 3 | `engagement` (claps, commentaires) + `analytics` (vues) + panneau stats | mesurer et interagir |
| 4 | Renderer 3D (code manuscrit en forme de pattern, UML 3D) + premiers articles `code_3d` + panneau SEO | la signature visuelle |
| 4bis | Contexte `patterns` + **Atlas public** + **Comparateur** + **Générateur d'affiches/OG** | le dictionnaire des formes en ligne |
| 5 | **Détecteur** (moteur AST) + **Éditeur de scènes** du studio (+ suggestion IA) | composer des scènes sans coder |
| 6 | **API publique + MCP** + **GitHub Action** + **extension VS Code** (indispensables) | le détecteur sort du blog |
| 7 | **Explorateur de codebase** + **Refactoring Playground** (coups de cœur) | l'architecture visible, l'apprentissage interactif |

Roadmap détaillée et exigences transverses : `docs/patterns/outils.md`
(dictionnaire en base, moteur de détection autonome, formes rendables serveur).

## 10. Tests, qualité, déploiement

- **Backend** : pytest ; domaine testé sans DB ; use cases avec DB de test ;
  tests d'API DRF sur les endpoints publics.
- **Frontend** : Vitest + Testing Library pour les composants ; un smoke
  Playwright par page ; Steiger (frontières FSD) en CI.
- **Déploiement** : **sans Docker** (décision du 2026-07-03). Dev : Postgres natif
  (Postgres.app/Homebrew, port 5432). Prod : VPS classique (gunicorn + nginx +
  Postgres managé) ou PaaS — à trancher au moment du déploiement.
- **Repo** : monorepo `backend/` + `frontend/` dans `blog_tech `.
