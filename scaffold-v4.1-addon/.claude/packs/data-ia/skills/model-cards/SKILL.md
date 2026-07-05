---
name: model-cards
description: Documentation normalisée d'un modèle ou système IA — usage prévu, données, performances, limites, risques. Une page honnête par système en production.
when_to_use: Tout système IA mis en production (modèle local, API tierce, pipeline RAG, agent) ; audit d'un système existant non documenté ; exigence AI Act de documentation technique.
---

# Skill : model-cards

## Structure imposée

```markdown
# Model card — <système> — v<N>

## Identité
Modèle(s) sous-jacent(s), version, tier de routing (ADR-004), self-hosted ou API.

## Usage prévu
Ce que le système fait, pour qui. ET : usages explicitement NON prévus
(l'équivalent du « Exclus » d'une spec — la moitié de la valeur de la card).

## Données
Sources d'entrée, données de référence/few-shot, présence de données
personnelles (si oui → skill conformite-rgpd-ai-act), rétention.

## Performances
Résultats d'eval (lien vers packs/evals/results/), pass rate, modes d'échec
connus (top 3), conditions de dégradation.

## Limites et risques
Populations/cas où le système est moins fiable, biais connus, risques d'usage
détourné. Section co-rédigée avec le rôle ethique-ia sur les systèmes sensibles.

## Supervision
Qui surveille quoi, seuils d'alerte, procédure de fallback, recours humain
(pour les décisions affectant des personnes).
```

## Règles

- **Une card par système servi**, pas par modèle brut — un pipeline RAG a sa card même si le modèle sous-jacent a la sienne.
- La card vit avec le système : toute évolution (modèle, prompt majeur, données) = nouvelle version de card. Store ADR-001, append-only.
- **Honnêteté sur les limites** : une card sans mode d'échec connu signifie que l'eval n'a pas été faite, pas que le système est parfait.
- La card est le prérequis documentaire de la conformité AI Act pour les systèmes concernés — la faire d'abord, la conformité s'appuie dessus.
