# La grammaire des formes — formalisation des design patterns en 3D

Le principe fondateur du blog : **une disposition se retient mieux qu'une
définition**. Chaque pattern a une forme 3D signature ; le code manuscrit s'y
dispose ; une démo animée montre le comportement ; les annotations expliquent
le pourquoi. Validé par prototypage (`prototype/atlas.html`, `article-3d.html`).

## Les trois familles = trois gestes = trois couleurs

| Famille | Geste | Couleur | Ce que les formes évoquent |
|---|---|---|---|
| Création (5) | **PRODUIRE** ⚙ | argile `#e8724c` | des machines : tapis, usine, échafaudage, tampon, orbite |
| Structurels (7) | **ASSEMBLER** ⌂ | bleu `#6cb6ff` | des constructions : prise, pont, arbre, anneaux, façade, ruche, portier |
| Comportementaux (10) | **DIALOGUER** ⇄ | jaune `#f2c94c` | des flux : chaîne, enveloppe, rail, tour, polaroïds, étoile, roue, outils, pochoir, tournée |
| Architecture (hors GoF) | **ORGANISER** | bleu | boucle retournée (IoC), entonnoir (DI), triangle (MVC) |

On reconnaît la famille (couleur + type de forme) avant même de lire le nom.

## Typographie (décision de lisibilité, vérifiée au screenshot)

- **En relief dans l'espace** (code manuscrit, annotations, UML, légendes) :
  **Shantell Sans bold** — trait épais qui porte l'extrusion.
- **Sur papier** (mémos isométriques, pages de cahier) : cursive fine
  (La Belle Aurore), encre bleue `#2e4bb5`, rouge du prof `#c0392b`,
  papier ligné + marge rouge.
- **Lettrage d'affiche** (nom du pattern en ouverture, posters, images OG) :
  Fraunces 900, face crème + flancs d'extrusion argile + ombre décollée.

## La règle des trois formats (réponse au « code trop long »)

1. **Code court ≤ 8 lignes** (l'essence du pattern) → manuscrit 3D disposé
   dans la forme du pattern (ex. l'anneau du singleton).
2. **Code long, réel** → bloc à plat annoté : stickers manuscrits 3D ancrés
   + flèches d'encre + badges de pattern ancrés aux lignes.
3. **Logique multi-classes** → UML manuscrit 3D (boîtes aux bords tracés main,
   flèche d'héritage à triangle creux, en relief).

Un article mixe librement les trois. Le MDX plat reste toujours la source
(SEO, accessibilité, agents, bouton « voir à plat / copier »).

## Le vocabulaire motion (prototypé en CSS, cible React Three Fiber)

| Mouvement | Rôle |
|---|---|
| Écriture au scroll | les lignes se tracent une à une, dans l'ordre de lecture ①→⑥ |
| Pose (line-settle) | chaque ligne rebondit légèrement en fin de tracé |
| Tampon (stamp) | annotations, mémos, boîtes UML « se posent » (grand + flou → rebond) |
| Bille d'exécution | parcourt la forme pour démontrer le comportement (la démo « aha ») |
| Lueur orbitale | vie ambiante continue de la scène |
| Flèche d'encre | se dessine vers sa cible puis respire |
| Micro-bascule | le lettrage d'affiche vit (rotation périodique) |
| Survol-traduction | ligne manuscrite → papier avec version tapée + explication |

Tout est désactivé avec `prefers-reduced-motion` (affichage direct, lisible).

## Le contrat JSON `scene` (v2)

```json
{
  "version": 2,
  "pattern": "singleton",
  "code": { "lang": "python", "source": "class Config:\n ..." },
  "pourquoi": "le code s'enroule : une seule sortie, une seule instance",
  "usages": ["config globale", "pool de connexions DB", "logger unique"],
  "traductions": [{ "ligne": 3, "texte": "le portier : toute création passe ici" }],
  "annotations": [{ "texte": "retenir ça !", "encre": "rouge", "ancre": "ligne:6", "fleche": true }],
  "demo": "exec-laps",
  "camera": { "path": "scroll-track" }
}
```

- `pattern` sélectionne le **layout** (la forme) et la **démo** — l'auteur ne
  positionne rien à la main, le renderer calcule.
- `encre` : `bleu` = à retenir, `rouge` = piège / décision.
- Ce contrat est produit par l'Éditeur du studio et, plus tard, par l'IA
  (suggestion depuis le code collé). Il ne bouge pas entre les versions.

## Exigences d'architecture (pour que les outils futurs restent possibles)

1. Le **dictionnaire vit en base** (contexte Django `patterns/`), jamais en dur
   dans le front — l'API, le Dojo, le Comparateur, l'extension VS Code lisent
   la même source.
2. Le **moteur de détection est un module autonome** (règles AST par langage,
   résultat = [pattern, lignes, confiance, explication]) — consommé par le
   Détecteur web, l'API, la GitHub Action et l'extension VS Code sans fork.
3. Les **formes sont rendables hors navigateur** (rendu serveur → PNG/SVG) —
   pour les images OG, les affiches, les posters.
