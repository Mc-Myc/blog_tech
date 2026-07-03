# L'écosystème d'outils patterns — roadmap priorisée (validée le 2026-07-03)

Trois briques socles + neuf outils dérivés. Prototypes de référence dans
`prototype/` : `atlas.html`, `detecteur.html`, `editeur.html`.

## Les 3 briques socles

| Brique | Rôle | Implémentation |
|---|---|---|
| **L'Atlas** (dictionnaire) | 22 patterns GoF + architecture, chacun : intention, forme 3D, démo, usages, pièges, confusions | contexte Django `patterns/`, contenu importé depuis `docs/patterns/*.md`, servi par l'API |
| **Le Détecteur** | code collé → [pattern, lignes, confiance, explication] | moteur de règles AST autonome (module réutilisable), par langage ; v2 : modèle ML entraîné sur l'Atlas |
| **L'Éditeur** | compose une scène : pattern → forme + démo, code, pourquoi, usages, annotations → JSON `scene` v2 | outil du studio ; suggestion IA depuis le code collé (via le Détecteur) |

## Roadmap des outils dérivés (priorités de Marcel)

### 💛 Indispensables (Phase 6)
| Outil | Description | Réutilise |
|---|---|---|
| **4 · GitHub Action / bot de PR** | commente les PR : patterns détectés + lien fiche Atlas | le moteur de détection tel quel |
| **5 · Extension VS Code** | badges de patterns dans l'éditeur, cliquables vers l'Atlas | le moteur de détection tel quel |
| **6 · API publique + MCP** | `/api/v1/patterns`, `/api/v1/detect` + serveur MCP pour agents IA | l'Atlas en base + le moteur |

### ❤️ Coups de cœur (Phase 7)
| Outil | Description | Réutilise |
|---|---|---|
| **8 · Explorateur de codebase** | un repo entier → carte 3D des formes détectées, par module | Détecteur + formes 3D |
| **9 · Refactoring Playground** | exercices : refactorer du code cassé vers un pattern, la forme 3D s'assemble au fil du refactoring | Détecteur (scoring live) + renderer |

### 💚 Victoires rapides (Phase 4bis, avec l'Atlas public)
| Outil | Description | Réutilise |
|---|---|---|
| **2 · Comparateur** | les confusions classiques côte à côte (Strategy vs State…), deux formes animées + « la différence en une phrase » | les paires « à ne pas confondre » des fiches |
| **3 · Générateur d'affiches** | posters/wallpapers/OG : lettrage 3D + forme + intention ; PDF de l'Atlas complet | le rendu serveur des formes |

### Backlog (non priorisé)
| Outil | Description |
|---|---|
| 1 · Le Dojo | quiz forme→pattern, répétition espacée |
| 7 · L'anti-Atlas | dictionnaire des anti-patterns, formes cassées |

## Exigences transverses (à respecter dès la Phase 1)

1. **Dictionnaire en base**, jamais en dur — tous les outils lisent la même source.
2. **Moteur de détection = module autonome** — web, API, Action, extension le
   consomment sans fork.
3. **Formes rendables hors navigateur** (rendu serveur → PNG/SVG) — OG, affiches.
4. **Contenu 100 % maison** — structure inspirée de refactoring.guru,
   classification GoF publique, aucun texte ni visuel copié.
