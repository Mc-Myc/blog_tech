---
name: reasoning-discipline
description: >
  Discipline de raisonnement chain-of-thought partagée par les sub-agents
  (@architect, @auditor, @evaluator, @critic). Une seule version à maintenir :
  les agents chargent cette skill au lieu de dupliquer la section.
when_to_use: >
  Chargée automatiquement par tout agent qui produit un jugement ou une
  proposition structurante (ADR, audit, évaluation, critique). Compense par
  méthode ce que les modèles du palier Mythos font automatiquement
  (cf. ADR-004 + core/architecture/patterns/mythos-triggers.md).
---

# Skill : reasoning-discipline

## Principe

Avant de produire ta sortie, mène **INTERNEMENT** une passe structurée en trois temps :

1. **Énumère 2-3 angles plausibles** — la variante dépend de ton rôle (voir table).
2. **Passe le problème sous chacun.** La conclusion change-t-elle selon l'angle ?
3. **Tranche en justifiant** pourquoi tu retiens un angle et écartes les autres.

## Variantes par agent

| Agent | Les « angles » sont... |
|-------|------------------------|
| `@architect` | 2-3 approches alternatives au problème ; trade-offs coût / latence / maintenabilité / équipe / retrocompat / sécu |
| `@auditor` | 2-3 angles d'analyse : architecture / surface d'attaque / runtime, ou par couche données / logique / interface |
| `@evaluator` | 2-3 lectures des critères : stricte vs charitable, présence vs absence, intention vs littéralité |
| `@critic` | 2-3 postures d'attaque : hypothèses implicites, cas limites, incitations perverses |

## Règles

- **Interne par défaut.** N'inclus la passe dans ta sortie que si la justification fait partie du livrable (section « Options considérées » d'une ADR, mention « angles retenus » d'un audit) ou si l'utilisateur le demande.
- **Pas d'angles artificiels.** Si une approche est évidemment dominante, dis-le et passe à la production. La discipline sert à contre-vérifier, pas à fabriquer du débat.
- **Le doute est un signal.** Si deux angles mènent à des conclusions opposées sans qu'aucun ne domine, remonte-le explicitement : c'est un candidat pour la skill `voting` (Signal B potentiel) ou pour l'escalade de tier.

## Pourquoi une skill partagée

La v3 dupliquait cette section quasi verbatim dans trois agents. Toute évolution
(nouveau garde-fou, recalibrage) devait être portée trois fois — dérive garantie.
Une skill, une source de vérité, chaque agent n'en porte que la variante.
