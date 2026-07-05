---
name: priorisation
description: Arbitrage de backlog par scoring — RICE par défaut, MoSCoW pour les périmètres de release. Produit un classement justifié, pas une intuition.
when_to_use: Backlog > 5 items en concurrence ; arbitrage entre features ; définition du périmètre d'une release ; conflit de priorités entre parties prenantes.
---

# Skill : priorisation

## RICE (défaut)

Pour chaque item : **Reach** (combien d'utilisateurs/période) × **Impact**
(3=massif, 2=fort, 1=moyen, 0.5=faible, 0.25=minime) × **Confidence**
(100/80/50% — en dessous de 50%, c'est une hypothèse à tester, pas un item à
scorer) ÷ **Effort** (en personne-semaines, ou en chunks pour ce scaffold).

Règles :
- Les quatre valeurs sont **justifiées en une phrase chacune** — un score sans justification est une intuition déguisée.
- Confidence < 50% → sortir l'item du scoring, créer une tâche de validation (interview, prototype, data) à la place.
- Le classement est un point de départ de discussion, pas une sentence : un écart de 15% entre deux scores n'est pas significatif.

## MoSCoW (périmètre de release)

Must / Should / Could / Won't-this-time. Règle dure : **Must ≤ 60% de l'effort
total** — sinon il n'y a pas de marge, donc pas de release fiable. Chaque Won't
est explicite et daté : c'est la section « Exclus » de la spec.

## Sortie type

Table classée (item, R, I, C, E, score, justifications), coupure de release
proposée, items déclassés vers validation, et les 2-3 arbitrages sensibles
explicités (pourquoi X passe devant Y).

## Anti-patterns

- Scorer pour confirmer une décision déjà prise — si le résultat était connu d'avance, dire la décision et ses raisons, pas maquiller.
- Re-prioriser chaque semaine : le scoring sert entre deux caps, pas à chaque vague.
