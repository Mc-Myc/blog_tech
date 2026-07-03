---
name: health-check
description: >
  Contrôle de santé d'un knowledge store : cohérence interne, liens cassés, entrées
  orphelines, tags incohérents, contradictions. Complémentaire à /compact (qui réduit
  le volume) : /lint mesure la santé du contenu, pas sa taille.
when_to_use: >
  Périodiquement (1× / mois sur les stores actifs), avant une session de travail
  importante si l'INDEX a dérivé, ou quand un INDEX présente des incohérences
  visibles (entrées manquantes, doublons apparents, tags qui dérivent).
---

# Skill : health-check

## Pourquoi cette skill existe

`/compact` réduit le **volume**. `/lint` mesure la **santé**. Sans contrôle de santé, un store reste « petit » mais peut accumuler de la pourriture silencieuse : liens vers des items archivés, doublons sémantiques (deux ADR qui se contredisent sans supersede), tags incohérents (`sécurité` vs `security`), items orphelins (créés et jamais référencés).

Pattern emprunté à Karpathy (op `lint` dans son LLM Wiki). Adapté ici à tout knowledge store conforme à ADR-001, pas seulement au wiki.

## Périmètre — ce que cette skill vérifie

### Cohérence structurelle

- [ ] Chaque entrée listée dans `INDEX.md` a un fichier item correspondant.
- [ ] Chaque fichier item dans le dossier est listé dans `INDEX.md`.
- [ ] Le front-matter de l'INDEX est valide (`budget_tokens`, `current_tokens`, `last_compact` présents).
- [ ] Les `id` sont uniques et continus (pas de trou inexpliqué).
- [ ] `current_tokens` reflète à peu près la réalité (`±20%`).

### Cohérence des liens

- [ ] Toute référence à un `id` (ex: `voir adr-005`) pointe vers une entrée existante (active ou archivée).
- [ ] Les `[[backlinks]]` pointent vers des pages/entrées existantes.
- [ ] Pas de référence à un item supprimé (anomalie : un item devrait être archivé, pas supprimé — cf. ADR-001).

### Cohérence sémantique

- [ ] Pas de **doublons sémantiques** : deux entrées qui décrivent la même chose (titre/tags très proches).
- [ ] Pas de **contradictions non marquées** : deux entrées qui se contredisent sans qu'une supersede l'autre. Pour les ADRs : un nouveau ADR contredisant un ancien doit marquer l'ancien `supersédé par <id>`.
- [ ] **Tags cohérents** : pas de variantes (`sécurité`/`security`/`secu`) pour le même concept.
- [ ] **Statuts cohérents** : pas d'entrée `livrée` qui dépend d'une entrée `en cours`.

### Cohérence d'usage

- [ ] Pas d'item **orphelin** : présent mais jamais référencé depuis ailleurs (anomalie possible — soit l'item est inutile, soit il manque des liens).
- [ ] Pas de **source orpheline** dans `research/raw/` (présente mais jamais référencée par une page wiki).
- [ ] Pas d'item dont le `statut` est obsolète : ex. ADR `proposé` depuis > 60 jours sans devenir `accepté` ou `déprécié`.

## Procédure

### Étape 1 — Identifier la cible

L'utilisateur passe un chemin de store. Charger la skill `knowledge-store` (procédures de référence) en complément.

### Étape 2 — Inventaire

- `ls <store>` pour lister les fichiers items.
- Lire `INDEX.md` et extraire la table d'entrées actives.
- Comparer : items présents en fichier ↔ items listés dans l'INDEX.

### Étape 3 — Passes de vérification

Exécuter les 4 catégories de checks ci-dessus dans l'ordre. Pour chaque check, soit :
- **OK** (silencieux)
- **WARNING** (cosmétique, à signaler sans bloquer)
- **ERROR** (incohérence structurelle, à corriger)

### Étape 4 — Restituer

Format de sortie :

```markdown
# Health check — <store> — <date>

## Synthèse
- Items actifs : N
- Items archivés : M
- ERRORS : x
- WARNINGS : y
- Score de santé : <PASS si 0 ERROR / DÉGRADÉ si ERROR isolé / CRITIQUE si plusieurs ERROR>

## Erreurs

### ❌ E1 : <titre court>
**Cible** : <fichier ou entrée>
**Constat** : <ce qui ne va pas>
**Recommandation** : <action concrète>

## Avertissements

### ⚠️ W1 : <titre court>
**Cible** : <fichier ou entrée>
**Constat** : <ce qui pourrait être amélioré>

## OK
- <N checks passés, listés brièvement>

## Suite proposée
1. <action prioritaire 1>
2. <action prioritaire 2>
```

### Étape 5 — Pas de correction automatique

Cette skill **ne corrige rien**. Elle diagnostique. La correction est une étape séparée, validée explicitement par l'utilisateur (et pour certaines corrections — archivage, fusion — c'est `/compact` qui les exécute).

## Cadence recommandée

- **Stores actifs** : 1× / mois.
- **Stores peu actifs** : 1× / trimestre.
- **Wiki research** : après chaque grosse ingestion (>10 sources).
- **Avant un `/compact` important** : pour distinguer ce qui doit être archivé (compact) de ce qui est incohérent (à corriger d'abord).

## Anti-patterns à éviter

- **Lint silencieux automatique.** Le lint coûte des tokens (lecture de tout le store). Ne pas le déclencher sans demande explicite.
- **Correction sans validation.** Tentation : « tant qu'on est là, je corrige ». Non : on diagnostique, on rend, l'utilisateur tranche.
- **Sur-stricter.** Un store n'a pas besoin d'être parfait. Tolérer les warnings ; ne corriger que les errors.

## Lien avec ADR-002

Si le lint révèle des **liens cassés** ou des **références introuvables** récurrents → c'est un cas de `recall miss` (cf. ADR-002). Incrémenter `core/memory/recall-misses.md` si pertinent.
