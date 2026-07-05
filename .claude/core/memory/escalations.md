---
store: memory/escalations
budget_tokens: 1200
current_tokens: ~90
last_compact: jamais
---

# Journal des escalades de tier (ADR-004 / mythos-triggers)

Append-only. Une ligne par escalade effective vers le tier Escalade (Fable 5),
journalisée **au moment de l'escalade** (write-ahead), le verdict d'apport
complété après coup.

Format :

```
- [YYYY-MM-DD] signal:<A|B|C|D|E> domaine:<1-7> tâche:<une phrase> verdict:<pending | justifié | non-justifié> apport:<qu'a apporté Mythos que l'orchestration Opus n'aurait pas pu — une phrase>
```

## Entrées

(aucune pour l'instant)

## Bilan de calibration

À 10-15 entrées : compter les `justifié` vs `non-justifié` par domaine et par
signal. Un domaine jamais justifié = candidat au retrait via une **nouvelle ADR
(006+)** qui supersede partiellement ADR-004.
Même posture que recall-misses.md pour ADR-002 : décision posée, signaux définis,
l'observation calibre.
