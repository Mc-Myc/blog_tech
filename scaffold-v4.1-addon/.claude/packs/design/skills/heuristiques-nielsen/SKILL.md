---
name: heuristiques-nielsen
description: Revue d'interface contre les 10 heuristiques de Nielsen — transforme le « je n'aime pas » en findings argumentés et priorisés.
when_to_use: Revue de maquette ou d'interface existante ; arbitrage d'un débat de design ; audit UX rapide sans test utilisateur disponible.
---

# Skill : heuristiques-nielsen

## Les 10 heuristiques (grille de lecture)

1. **Visibilité de l'état du système** — l'utilisateur sait toujours ce qui se passe (chargements, confirmations, progression).
2. **Correspondance système/monde réel** — langue de l'utilisateur, pas jargon interne.
3. **Contrôle et liberté** — annuler, revenir, sortir. Pas de tunnel sans issue.
4. **Cohérence et standards** — internes (même action = même pattern partout) et externes (conventions de plateforme).
5. **Prévention des erreurs** — mieux vaut empêcher que bien afficher l'erreur (confirmation sur destructif, contraintes de saisie).
6. **Reconnaissance plutôt que rappel** — options visibles, pas à mémoriser.
7. **Flexibilité et efficacité** — raccourcis pour experts sans complexifier pour débutants.
8. **Design minimaliste** — chaque élément en compétition avec les autres pour l'attention ; le superflu dilue l'essentiel.
9. **Aider à reconnaître et corriger les erreurs** — message en clair : quoi, pourquoi, comment réparer.
10. **Aide et documentation** — en dernier recours, contextuelle, orientée tâche.

## Procédure de revue

1. Parcourir l'interface en déroulant un **scénario réel** (pas écran par écran hors contexte).
2. Pour chaque friction : quelle heuristique, quel écran, quelle sévérité — 0 (cosmétique) à 4 (bloquant, empêche la tâche).
3. Prioriser sévérité × fréquence du parcours touché.

## Format de finding

`[H<n>] [sévérité 0-4] <écran/composant> : <constat> → <recommandation concrète>`

## Règles

- Une revue heuristique ne remplace pas un test utilisateur — elle attrape ~2/3 des problèmes à ~1/10 du coût. Les 4 de sévérité méritent un vrai test.
- Deux évaluateurs valent nettement mieux qu'un : c'est un bon usage du voting (2-3 passes isolées, consolidation).
