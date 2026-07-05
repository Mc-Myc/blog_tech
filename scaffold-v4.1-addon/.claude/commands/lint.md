---
description: Contrôle de santé d'un knowledge store. Détecte incohérences, doublons, liens cassés, tags incohérents, items orphelins. Ne corrige rien — diagnostique uniquement.
allowed_tools: ["Read", "Glob", "Grep", "Bash"]
argument-hint: "<chemin du store>  — ex: /lint core/memory  |  /lint core/architecture/decisions"
---

# /lint

Mesure la **santé** d'un knowledge store. Complémentaire à `/compact` (qui mesure la taille). Diagnostique sans corriger.

## Usage

```
/lint <chemin>
```

Exemples :
- `/lint core/memory`
- `/lint core/architecture/decisions`
- `/lint core/specs`
- `/lint packs/research/wiki`
- `/lint packs/evals/results`

## Quand l'utiliser

- **Mensuellement** sur les stores actifs.
- **Trimestriellement** sur les stores peu actifs.
- **Avant un `/compact`** pour distinguer ce qui doit être archivé de ce qui est incohérent.
- **Quand un INDEX dérive visiblement** (entrées qui semblent manquer, doublons apparents).

## Ce que `/lint` détecte

- Items présents en fichier mais absents de l'INDEX (ou inverse).
- Front-matter d'INDEX invalide.
- IDs avec trous inexpliqués.
- Liens cassés vers items inexistants.
- Backlinks orphelins.
- Doublons sémantiques (titres/tags très proches).
- Contradictions non marquées (ADR qui en contredit une autre sans supersede).
- Tags incohérents (variantes du même concept).
- Items orphelins (jamais référencés).
- Statuts obsolètes (ex. ADR `proposé` depuis > 60 jours).

## Ce que `/lint` NE fait PAS

- **Aucune correction.** Le lint diagnostique uniquement.
- Aucune modification de fichier.
- Aucune compaction (pour ça : `/compact`).
- Aucun déplacement vers l'archive.

## Workflow

1. **Résoudre la cible.** Si l'argument est absent ou invalide, lister les stores connus du scaffold et **demander** lequel. Une seule question, attendre la réponse.
2. **Charger la skill** `health-check` (procédures de référence + checks normatifs) et la skill `knowledge-store` (vocabulaire commun).
3. **Inventorier** : lister les fichiers items, lire l'INDEX, comparer.
4. **Exécuter les 4 catégories de checks** (structurel, liens, sémantique, usage) — voir `skills/health-check/SKILL.md`.
5. **Produire le rapport** au format imposé par la skill (synthèse + errors + warnings + OK + suite proposée).
6. **Ne rien modifier.** Restituer au thread principal.
7. **Proposer la suite** : une seule question.
   > Score : <PASS/DÉGRADÉ/CRITIQUE>. Veux-tu :
   > a) corriger les errors maintenant (action par action, avec validation) ?
   > b) lancer `/compact` pour traiter les items obsolètes identifiés ?
   > c) ne rien faire (rapport pour info) ?

## Journalisation automatique (learning-loop)

À la fin du run : pour chaque **ERROR** structurel détecté, appender une entrée `[auto]` dans `core/memory/lessons-learned.md` (store, type d'erreur). Les WARNINGS ne sont pas journalisés (bruit). Rappel : les liens cassés récurrents alimentent aussi `recall-misses.md` (ADR-002) — deux journaux, deux finalités.

## Garde-fous

- **Pas de lint silencieux automatique.** Coût en tokens non négligeable — l'utilisateur valide chaque exécution.
- **Pas de correction sans validation.** Même une « petite » correction passe par l'utilisateur.
- **Tolérer les warnings.** Tout score `DÉGRADÉ` n'est pas une urgence. Seuls les `ERROR` méritent action immédiate.

## Lien avec `/compact`

- `/lint` **précède** souvent `/compact` : on diagnostique d'abord, on archive ensuite.
- Un store qui passe `/lint` est prêt pour `/compact` en confiance.
- Un store qui échoue `/lint` doit être corrigé **avant** compaction (sinon on archive des incohérences).

## Lien avec ADR-002

Si `/lint` révèle des **liens cassés** récurrents qu'un grep d'INDEX ne résout pas → potentiel `recall miss` à enregistrer dans `core/memory/recall-misses.md`. Critère explicite de réouverture d'ADR-002 (mémoire vectorielle).
