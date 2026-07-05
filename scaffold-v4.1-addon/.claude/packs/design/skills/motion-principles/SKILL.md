---
name: motion-principles
description: Durées, courbes d'accélération et chorégraphie pour les animations d'interface — le mouvement fonctionnel, performant et accessible.
when_to_use: Spécifier une transition ou micro-interaction ; harmoniser les animations d'un produit ; arbitrer « trop/pas assez » d'animation.
---

# Skill : motion-principles

## Durées de référence

| Échelle | Durée | Exemples |
|---|---|---|
| Micro | 100-150ms | hover, toggle, tooltip |
| Composant | 200-300ms | dropdown, modal, accordéon |
| Page/vue | 300-400ms | transition de route, panneau latéral |

Au-delà de 400ms en interface : l'utilisateur attend. En dessous de 100ms : imperceptible, autant couper.

## Courbes

- **Décélération** (ease-out) : entrées — l'élément arrive vite et se pose. Le défaut pour 80% des cas.
- **Accélération** (ease-in) : sorties — l'élément part sans traîner.
- **Standard** (ease-in-out) : déplacements à l'écran.
- Jamais `linear` sur du mouvement spatial (robotique) — réservé aux fondus d'opacité et rotations continues (spinners).

## Chorégraphie

- **Stagger** : listes qui apparaissent → décalage 20-50ms par item, plafonné (au-delà de ~6 items, le reste arrive ensemble).
- **Origine** : un élément entre depuis ce qui l'a déclenché (menu depuis son bouton) — le mouvement explique la causalité.
- **Continuité** : ce qui persiste entre deux vues se déplace, ne disparaît/réapparaît pas.

## Contraintes non négociables

- Animer **transform + opacity** uniquement en continu (compositeur GPU). `width/height/top/left` = reflow = jank.
- **`prefers-reduced-motion`** : version réduite (fondus courts, pas de déplacement) systématique.
- Le mouvement répond à une question de l'utilisateur (d'où / vers où / quoi de neuf / ça a marché ?) — sinon, le supprimer.
