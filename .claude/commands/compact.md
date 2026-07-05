# /compact — compacter un knowledge store

Compacte un store markdown : fusionne les doublons, archive le périmé,
réécrit l'INDEX. Complémentaire de `/lint` (qui mesure la santé sans modifier).

## Usage

```
/compact <chemin-du-store>
```

## Déroulé

1. Charger la skill `knowledge-store` (conventions).
2. Lire l'INDEX + toutes les entrées du store visé.
3. Proposer un plan de compaction : fusions, archivages, réécritures — attendre validation.
4. Appliquer, réécrire l'INDEX, journaliser une entrée `[auto] compaction` dans le store.
