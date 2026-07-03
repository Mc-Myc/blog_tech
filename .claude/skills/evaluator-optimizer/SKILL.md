---
name: evaluator-optimizer
description: >
  Pattern « evaluator-optimizer » des 5 workflows canoniques d'Anthropic : un agent
  génère, un autre évalue, on itère jusqu'à acceptable. Skill chargée par les
  commandes/agents qui orchestrent une boucle qualité (génération → jugement →
  raffinement).
when_to_use: >
  Génération d'une ADR, d'une doc, d'une spec, d'un audit, d'un patch de code, où
  les critères de qualité sont explicites et où plusieurs passes améliorent
  significativement le résultat. Utiliser via le sub-agent @evaluator couplé à
  un agent producteur (@architect, @auditor, etc.).
---

# Skill : evaluator-optimizer

## D'où ça vient

Un des **5 patterns canoniques** documentés par Anthropic dans *Building Effective Agents* (décembre 2024) :
1. Prompt Chaining — étapes séquentielles
2. Routing — classifieur dirige
3. Parallelization — sectioning / voting
4. Orchestrator-Workers — décomposition dynamique
5. **Evaluator-Optimizer — un génère, un juge, on itère** ← celui-là

C'est le seul pattern qui permet d'**améliorer une sortie** avant de l'accepter, plutôt que de la valider au feeling.

## Quand le déclencher

- Critères de qualité **explicites** (issus d'une spec, d'une skill, d'un dataset d'eval).
- La sortie bénéficie significativement de plusieurs passes (ADR, doc, traduction, code, audit).
- Le coût des itérations reste raisonnable (≤ 3 boucles, sinon réinvestir dans la spec).

## Quand NE PAS le déclencher

- Tâche triviale (un commit, un rename) — overhead injustifié.
- Critères flous (« doit être bien ») — il faut d'abord clarifier.
- Itérations qui n'améliorent rien (output qui ne change pas entre les passes) — c'est un signal pour reformuler la demande.

## Boucle de référence

```
       [demande + critères]
              │
              ▼
       ┌──────────────┐
       │  Producteur  │   ex: @architect, @auditor, ou Claude direct
       │  génère v1   │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ @evaluator   │   contexte isolé, juge sur critères
       │ PASS / FAIL  │
       └──────┬───────┘
              │
       PASS ──┴── FAIL
        │           │
        ▼           ▼
     archive    Producteur lit la critique,
                produit v2, retour à l'évaluateur
                (max N itérations)
```

## Paramètres explicites

- **N max itérations** : 3 par défaut. Au-delà, c'est un signal : critères mal posés, ou producteur incapable.
- **Critère d'arrêt** : verdict `PASS` du `@evaluator`, OU `N` itérations atteintes (échec consigné).
- **Coût attendu** : ~3× le coût d'une génération simple en moyenne. Ce coût est un investissement, pas un gâchis : il prévient les régressions silencieuses.

## Procédure

1. **Préparer** : formaliser la demande + les critères. Si les critères viennent d'une spec, charger la spec et extraire les critères d'acceptation.
2. **Génération v1** : agent producteur produit une sortie.
3. **Évaluation** : invoquer `@evaluator` avec (sortie, critères, contexte).
4. **Branchement** :
   - Si `PASS` → archiver la sortie + le rapport d'éval. Stop.
   - Si `FAIL` → l'agent producteur reçoit la critique structurée + produit v2. Goto 3.
   - Si `N` itérations sans `PASS` → archiver toutes les versions + le dernier rapport d'éval. Notifier l'utilisateur : « la boucle n'a pas convergé, voici les actions correctives résiduelles. »

## Antipatterns à éviter

- **Boucle infinie déguisée.** Si tu lances 7 itérations « parce qu'on y est presque », c'est que les critères sont mauvais.
- **Évaluateur trop indulgent.** Un eval qui passe à 100% ne teste rien. Husain : *« un taux de passage de 70% indique souvent une évaluation plus significative qui stresse réellement le système »*.
- **Évaluateur biaisé par le producteur.** Le `@evaluator` doit avoir un contexte **isolé** — ne pas avoir vu la génération en cours. C'est la raison du sub-agent dédié.
- **Critères découverts pendant la boucle.** Tous les critères doivent exister **avant** la v1. Sinon le producteur joue contre une cible mobile.

## Lien avec le reste du scaffold

- Cette skill est invoquée par `/eval` quand on évalue un agent contre un dataset, et par n'importe quelle commande qui veut une boucle qualité.
- Les critères d'une spec (`core/specs/`) peuvent devenir directement les critères d'éval.
- Les rapports d'éval sont archivés dans `packs/evals/results/`.
