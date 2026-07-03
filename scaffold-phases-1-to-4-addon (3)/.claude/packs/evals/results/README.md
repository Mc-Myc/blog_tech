# Résultats d'eval runs

Rapports archivés produits par `/eval`. Knowledge store conforme à ADR-001.

## Structure

```
results/
├── README.md
├── INDEX.md             ← chargé au SessionStart si store actif
├── <date>-<cible>-<dataset>.md
└── archive/             ← rapports anciens (>90 jours)
```

## Convention de nommage

`<YYYY-MM-DD>-<cible>-<dataset-version>.md`

Exemple : `2026-05-29-auditor-security-quality-v1.md`

## Quoi en faire

- Comparer les pass rates entre versions de prompt → détecter régression.
- Identifier modes d'échec récurrents → enrichir le dataset OU corriger la cible.
- Si pass rate stable et élevé (95%+) sur plusieurs runs → durcir le dataset (Husain : un eval qui passe toujours ne teste rien).

## Compaction

`/compact packs/evals/results` quand l'INDEX dépasse son budget. Cibles d'archivage : rapports de runs > 90 jours dont la version de cible/dataset n'est plus active.
