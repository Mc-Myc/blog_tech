---
name: pre-mortem
description: >
  Exercice de projection d'échec : « nous sommes dans 6 mois, le projet a échoué —
  pourquoi ? ». Produit une liste de causes plausibles classées, convertibles en
  contraintes négatives et en mitigations de la spec.
when_to_use: >
  OBLIGATOIRE avant le chunk 1 de toute spec `enjeu: critique` (câblé au Signal D).
  Recommandé sur `irreversible: true` et sur toute décision structurante one-shot
  (domaine 6 de mythos-triggers). Inutile sur les tâches courantes.
---

# Skill : pre-mortem

## Principe

Le post-mortem analyse un échec passé ; le pre-mortem **suppose l'échec futur**
et remonte aux causes. Le déplacement psychologique compte : « qu'est-ce qui
pourrait mal tourner ? » produit des réponses polies ; « c'est mort, pourquoi ? »
produit des réponses honnêtes.

## Procédure

1. **Poser le décor.** « Nous sommes le <date + 6 mois>. SPEC-<id> a été livrée,
   puis a échoué / a été rollbackée / a causé un incident. »
2. **Générer les causes** — trois familles, 2-4 causes chacune :
   - **Techniques** : la solution ne tenait pas (perf, concurrence, dépendance, migration ratée).
   - **De périmètre** : on a construit la mauvaise chose (besoin mal compris, exclusion oubliée, critère manquant).
   - **De processus** : la bonne chose, mal exécutée (hypothèse silencieuse, test absent, handoff raté).
3. **Classer** chaque cause : probabilité (faible/moyenne/élevée) × détectabilité
   (la verrait-on venir ?). Les causes **probables et indétectables** sont les prioritaires.
4. **Convertir** — chaque cause prioritaire devient au moins un des trois :
   - une **contrainte négative** de la spec,
   - un **critère d'acceptation** supplémentaire,
   - une ligne dans **Risques identifiés** avec mitigation.
5. **Synthèse** collée dans la section Risques de la spec (3-8 lignes, pas un rapport).

## Garde-fous

- **Timeboxer : 15-20 minutes.** Un pre-mortem d'une heure est de l'over-planning (cf. agent-antipatterns).
- **Pas de causes cosmiques.** « Le marché change » n'est pas actionnable. Chaque cause doit pouvoir se convertir (étape 4).
- **Ne remplace pas @critic.** Le pre-mortem est auto-administré par le producteur ; @critic attaque de l'extérieur. Sur `enjeu: critique`, les deux tournent : pre-mortem d'abord (il enrichit la spec), @critic ensuite (il attaque la spec enrichie).

## Lien avec le reste

- Déclenché par `/spec` quand `enjeu: critique` est posé (le wizard le rappelle à la génération).
- Câblé au **Signal D** de mythos-triggers : les specs qui déclenchent ce signal sont exactement celles où l'itération est interdite — donc où prévoir l'échec avant coûte moins que le constater après.
- Les causes récurrentes entre pre-mortems de plusieurs specs sont des candidates `distill-lessons`.
