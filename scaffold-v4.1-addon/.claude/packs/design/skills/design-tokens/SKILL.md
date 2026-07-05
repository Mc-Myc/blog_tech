---
name: design-tokens
description: Système de tokens (couleurs, typo, espacements, rayons, ombres, durées) — la cohérence par la structure, pas par la discipline. Format DTCG/JSON exportable vers CSS variables et Tailwind.
when_to_use: Démarrage d'un projet UI ; incohérences visuelles qui s'accumulent ; mise en place d'un thème (clair/sombre) ; passage de maquette à code.
---

# Skill : design-tokens

## Architecture à trois niveaux

1. **Primitifs** (la palette brute) : `blue-500: #2563eb`, `space-4: 16px`, `font-size-lg: 18px`. Aucun usage direct dans les composants.
2. **Sémantiques** (le sens) : `color-action: {blue-500}`, `color-danger`, `surface-raised`, `text-muted`. C'est le niveau que les composants consomment — et le niveau qui permet le theming (le mode sombre remappe les sémantiques, pas les composants).
3. **Composants** (si besoin) : `button-primary-bg: {color-action}`. Seulement quand un composant diverge légitimement du sémantique.

## Règles

- **Échelles contraintes** : espacements sur une base 4 ou 8px, typo sur une échelle modulaire (~1.2-1.25). Un espacement de 13px est un bug, pas un choix.
- Nommer par **rôle, jamais par apparence** au niveau sémantique : `color-danger`, pas `color-red` (le rouge peut changer, le danger reste).
- Une seule source de vérité (JSON/DTCG), exportée vers les cibles (CSS variables, Tailwind config, Figma variables) — jamais maintenue en double.
- Motion aussi : `duration-fast/base/slow`, `easing-standard/decelerate/accelerate` sont des tokens (raccord skill `motion-principles`).

## Sortie type

Fichier tokens structuré (3 niveaux), export CSS variables, table de correspondance
maquette → tokens, et la liste des valeurs hors-échelle trouvées dans l'existant
(les « 13px » à résorber).
