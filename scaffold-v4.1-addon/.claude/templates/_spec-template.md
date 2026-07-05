---
id: "{{NNN}}"
titre: "{{titre-court-kebab}}"
statut: brouillon        # brouillon | prête | en cours | livrée | abandonnée
date: "{{YYYY-MM-DD}}"
auteur: "{{nom}}"
adrs_lies: []            # ex: [adr-001, adr-004]
tags: []                 # 2-4 tags kebab-case. Tags sensibles reconnus (Signal E,
                         # cf. mythos-triggers) : crypto, concurrency, pii,
                         # formal-proof, migration-irreversible
enjeu: normal            # normal | eleve | critique   (critique => Signal D, pre-mortem obligatoire)
irreversible: false      # true => Signal D, arrêt forcé avant toute action irréversible
tier: jugement           # mecanique | courant | jugement | escalade — pré-calculé par /spec (ADR-006)
checkpoint_every: 3      # mode batch de /run-spec : arrêt volontaire tous les N chunks (ADR-005)
---

# SPEC-{{id}} : {{Titre}}

## Objectif

> {{Une phrase : « cette feature doit permettre à <qui> de <faire quoi> »}}

## Pourquoi maintenant

{{Déclencheur business ou technique. Si tu ne peux pas répondre clairement, ce n'est peut-être pas prioritaire.}}

## Périmètre

### Inclus

- {{Élément concret 1}}
- {{Élément concret 2}}
- {{Élément concret 3}}

### Exclus (NE FAIT PAS partie de cette spec)

- {{Hors-périmètre 1 — explicite pour éviter la dérive}}
- {{Hors-périmètre 2}}

## Contraintes

### Conventions à respecter

- ADRs : {{liste}}
- Patterns du projet : {{liste — voir core/architecture/patterns/}}
- Choix techno : {{stack imposée, libs préférées}}

### Contraintes négatives (« on ne fait PAS ça »)

- {{Anti-pattern à éviter — /spec suggère ici les leçons pertinentes de lessons-learned.md}}
- {{Approche déjà essayée et écartée — référencer la session/ADR si possible}}
- {{Bibliothèque/technique bannie sur ce projet}}

> En mode batch (/run-spec), toute hypothèse posée par l'agent qui touche une ligne
> de cette section provoque un ARRÊT FORCÉ (ADR-005). La remplir sérieusement.

## Critères d'acceptation

Conditions binaires mesurables. Chaque case doit pouvoir être cochée objectivement.
`/spec` génère un squelette de dataset d'eval à partir de cette section.

- [ ] {{Critère 1 — vérifiable par un test ou une inspection}}
- [ ] {{Critère 2}}
- [ ] {{Critère 3}}

## Plan de prompts (chunks atomiques)

Séquence d'invocations courtes, une session par chunk. `depends_on` déclare les
dépendances (exécution séquentielle aujourd'hui ; parallélisme possible demain
entre chunks sans dépendance mutuelle). `tier` par chunk : override optionnel du
tier de la spec — un chunk d'extraction dans une spec `jugement` peut tourner en
`mecanique` (résolution : skill `model-dispatch`, registre : core/config/models.yaml).

### Chunk 1 : {{titre court}}
- **depends_on** : —
- **tier** : {{optionnel — mecanique | courant | jugement | escalade ; absent = hérite du tier de la spec (ADR-006)}}
- **Prompt suggéré** : {{phrasé concret}}
- **Critère de fin** : {{condition binaire}}
- **Tests concrets** : {{commande(s) code-based : test, build, schema-check}}

### Chunk 2 : {{titre court}}
- **depends_on** : chunk-1
- **Prompt suggéré** : {{...}}
- **Critère de fin** : {{...}}
- **Tests concrets** : {{...}}

### Chunk final (obligatoire) : validation de livraison
- **depends_on** : {{tous}}
- **Prompt suggéré** : « Invoquer @evaluator contre les critères d'acceptation de SPEC-{{id}}. »
- **Critère de fin** : verdict **PASS** — condition nécessaire du passage au statut `livrée`.

> Si un chunk semble dépasser 30 min de travail, le subdiviser.

## Risques identifiés

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| {{...}} | faible/moyen/élevé | {{...}} |

> Si `enjeu: critique` : lancer la skill `pre-mortem` avant le chunk 1 et coller la synthèse ici.

## Notes

{{Liens vers research/, contexte client, hypothèses connues, etc.}}
