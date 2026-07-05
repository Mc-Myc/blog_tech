---
name: revue-maquette
description: Procédure de revue structurée d'une maquette avant développement — parcours, états, responsive, accessibilité, faisabilité. Le pendant design d'une code review.
when_to_use: Avant de transmettre une maquette au développement ; avant de valider un design externe ; en gate de chunk pour les specs à composante UI.
---

# Skill : revue-maquette

## Les 5 passes (dans l'ordre)

1. **Parcours** — la maquette résout-elle l'étape du parcours visé ? L'action principale est-elle évidente en < 3 secondes ? Le persona cible s'y retrouve-t-il ?
2. **États** — pour CHAQUE composant interactif : défaut, hover, focus, actif, désactivé, erreur, vide, chargement. Les états absents de la maquette seront inventés par le développeur — c'est là que la cohérence meurt.
3. **Responsive** — les 3 points de rupture au minimum (mobile ~375, tablette ~768, desktop ~1280). Que devient chaque bloc ? Les tableaux et navigations ont-ils leur variante mobile ?
4. **Accessibilité** — contrastes AA (4.5:1 texte, 3:1 UI), cibles ≥ 44px, hiérarchie de titres, l'information ne repose jamais sur la couleur seule, ordre de focus plausible.
5. **Faisabilité & tokens** — chaque valeur correspond-elle à un token (skill `design-tokens`) ? Y a-t-il des éléments coûteux à implémenter pour un gain marginal ? Les assets sont-ils exportables ?

## Format de restitution

Findings par passe, format `[passe] [bloquant|à arbitrer|suggestion] <constat> → <action>`.
**Bloquant** = le développement produirait du travail à refaire (état manquant,
responsive non défini). Verdict final : prête au dev / corrections d'abord.

## Règles

- La revue se fait en déroulant les scénarios, pas en contemplant les écrans.
- Un finding sans action proposée est une opinion — le reformuler ou le retirer.
- Cette skill se branche naturellement en gate de chunk (/run-spec) pour les chunks UI : c'est un « test concret » de design.
