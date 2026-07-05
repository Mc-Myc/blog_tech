---
name: user-stories
description: Découpage de besoins en user-stories INVEST avec critères d'acceptation binaires — le format d'entrée naturel du wizard /spec.
when_to_use: Transformer un besoin flou en éléments constructibles ; préparer l'entrée d'une spec ; découper une epic trop grosse.
---

# Skill : user-stories

## Format

« En tant que <persona précis — pas "utilisateur">, je veux <action> afin de
<bénéfice vérifiable> », suivi de critères d'acceptation **Given/When/Then**,
binaires, testables.

## INVEST comme check-list de découpage

- **I**ndépendante — livrable seule ; sinon documenter la dépendance (futur `depends_on`).
- **N**égociable — décrit le besoin, pas la solution ; le comment appartient au chunk.
- **V**alorisable — un bénéfice utilisateur nommé ; « refacto du module X » n'est pas une story, c'est de la dette (à assumer comme telle).
- **E**stimable — si l'équipe ne peut pas l'estimer, il manque de la connaissance : créer un spike.
- **S**mall — si > ~3 chunks de 30 min, découper : par étape du parcours, par variante (nominal d'abord, cas d'erreur ensuite), par persona, ou par CRUD.
- **T**estable — chaque critère cochable objectivement. C'est LE point de contact avec le scaffold : ces critères deviennent ceux de la spec, puis le dataset d'eval.

## Sortie type

Stories découpées + critères G/W/T + dépendances + les stories écartées (avec
raison) — l'équivalent du « Exclus » au niveau story.

## Anti-patterns

- La story-solution (« je veux un bouton bleu ») : remonter au besoin.
- Le « afin de » décoratif (« afin d'améliorer l'expérience ») : si le bénéfice n'est pas vérifiable, il est inventé.
- Découper par couche technique (front/back/BDD) : chaque tranche doit traverser la stack et livrer quelque chose d'observable.
