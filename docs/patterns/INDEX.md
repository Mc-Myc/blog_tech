# docs/patterns — la base de connaissances des design patterns

Source de vérité du futur contexte Django `patterns/` (l'Atlas). Tout ce qui est
ici a vocation à être importé en base de données et servi par l'API.

| Fichier | Contenu |
|---|---|
| [grammaire-des-formes.md](grammaire-des-formes.md) | La formalisation : familles, gestes, couleurs, formes 3D, démos, contrat JSON `scene` |
| [creation.md](creation.md) | Les 5 patrons de création (fiches complètes) |
| [structurels.md](structurels.md) | Les 7 patrons structurels |
| [comportementaux.md](comportementaux.md) | Les 10 patrons comportementaux |
| [architecture.md](architecture.md) | L'échelle au-dessus : IoC, DI, MVC |
| [outils.md](outils.md) | L'écosystème d'outils : Atlas, Détecteur, Éditeur + roadmap priorisée |

**Gabarit d'une fiche** (hérité de l'analyse de refactoring.guru, contenu 100 % maison) :
Intention → Forme 3D (nom, description, démo « aha ») → Quand l'utiliser →
Pièges → Exemple minimal (≤ 8 lignes, prêt pour l'anneau manuscrit) →
À ne pas confondre avec (paires du futur Comparateur).

**Références étudiées** (structure et classification seulement — aucun texte copié) :
refactoring.guru/fr/design-patterns (30 pages, screenshots du 2026-07-03),
adimeo.com (design patterns à quoi ça sert), Wikipedia FR (IoC, DI, MVC).
Classification : Gang of Four. Formes 3D : création originale blog_tech.
