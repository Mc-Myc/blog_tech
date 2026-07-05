---
name: voting
description: >
  Pattern Parallelization/voting (Anthropic, Building Effective Agents) :
  3 passes du producteur en contextes isolés sur la même question, comparaison
  des sorties, détection automatique du Signal B (divergence persistante,
  cf. mythos-triggers).
when_to_use: >
  Décision structurante où le doute persiste après reasoning-discipline ;
  suspicion de Signal B ; enjeu élevé où l'on veut durcir une décision avant
  de l'adopter. PAS pour les tâches courantes : coût ~3× une génération.
---

# Skill : voting

## Principe

Trois passes **indépendantes** (contextes isolés — aucune passe ne voit les
autres) du même producteur sur la même question, puis une passe de comparaison.
L'indépendance est la condition de validité : trois passes dans le même contexte
produisent trois reformulations, pas trois avis.

## Procédure

1. **Formaliser la question** en un prompt unique et autoporteur (la question +
   le contexte minimal). Les trois passes reçoivent exactement le même prompt.
2. **Lancer 3 passes isolées** du producteur (@architect, @auditor, ou Claude direct).
   En pratique Claude Code : 3 invocations Task séparées, ou 3 sessions parallèles.
3. **Comparer** (passe de synthèse, contexte neuf) :
   - Les trois réponses portent-elles la **même stratégie** (au-delà de la formulation) ?
   - Les désaccords sont-ils de surface (détails d'implémentation) ou de fond (approches opposées) ?
4. **Brancher** :
   - **Convergence** → adopter la réponse convergente, en intégrant les meilleurs éléments des trois. Consigner « voting : convergent » dans la sortie.
   - **Divergence de surface** → adopter la stratégie commune, arbitrer les détails.
   - **Divergence de fond** → **Signal B détecté**. Journaliser dans `core/memory/escalations.md`, escalader vers le tier Escalade (Fable 5) conformément à ADR-004 / mythos-triggers.

## Critère de divergence de fond

Deux réponses divergent « de fond » si suivre l'une rend l'autre impossible ou
inutile (architectures incompatibles, périmètres opposés, hypothèses de départ
contradictoires). Si les trois réponses peuvent être fusionnées sans conflit,
c'est de la surface.

## Garde-fous

- **3 passes, pas plus.** 5 passes n'apportent presque rien de plus et coûtent 66% de plus.
- **Jamais sur tâche interactive** (ADR-004 : la latence triple).
- **Pas de voting sur critères flous.** Si la question est mal posée, les trois passes divergeront pour de mauvaises raisons. D'abord la spec.
- **Le vote ne remplace pas l'eval.** La réponse adoptée passe ensuite le circuit normal (@evaluator ou @critic selon le cas).

## Lien avec le reste

- Détecteur officiel du **Signal B** (mythos-triggers) — avant cette skill, le signal était défini mais rien ne le mesurait.
- S'insère dans le flux de décision d'ADR-004, branche « durcir la décision ».
- Chaque déclenchement est journalisé (learning-loop) : question, convergence ou non, suite donnée.
