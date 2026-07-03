# SPEC-{{id}} : {{Titre}}

- **Date** : {{YYYY-MM-DD}}
- **Statut** : `brouillon` | `prête` | `en cours` | `livrée` | `abandonnée`
- **Auteur** : {{nom}}
- **ADRs liés** : {{adr-NNN, adr-MMM}}
- **Tags** : {{2-4 tags kebab-case}}

## Objectif

> {{Une phrase : « cette feature doit permettre à <qui> de <faire quoi> »}}

## Pourquoi maintenant

{{Déclencheur business ou technique qui justifie le travail. Si tu ne peux pas répondre clairement, c'est peut-être que ce n'est pas prioritaire.}}

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

- {{Anti-pattern à éviter 1 — souvent lié à une lesson apprise}}
- {{Approche déjà essayée et écartée — référencer la session/ADR si possible}}
- {{Bibliothèque/technique bannie sur ce projet}}

> Cette section évite la moitié des régressions. La remplir sérieusement.

## Critères d'acceptation

Conditions binaires mesurables. Chaque case doit pouvoir être cochée objectivement.

- [ ] {{Critère 1 — vérifiable par un test ou une inspection}}
- [ ] {{Critère 2}}
- [ ] {{Critère 3}}
- [ ] {{Critère 4}}

## Plan de prompts (chunks atomiques)

Séquence d'invocations courtes, une session par chunk.

### Chunk 1 : {{titre court}}

**Prompt suggéré** :
> {{Phrasé concret à donner à l'agent.}}

**Critère de fin** : {{ce qui doit être vrai pour passer au chunk suivant}}

### Chunk 2 : {{titre court}}

**Prompt suggéré** :
> {{...}}

**Critère de fin** : {{...}}

### Chunk 3 : {{titre court}}

**Prompt suggéré** :
> {{...}}

**Critère de fin** : {{...}}

> Si un chunk semble dépasser 30 min de travail, le subdiviser.

## Risques identifiés

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| {{...}} | faible/moyen/élevé | {{...}} |

## Notes

{{Tout le reste qui n'entre pas dans les sections ci-dessus. Liens vers research/, contexte client, etc.}}

---

*Spec conforme à ADR-001 (knowledge-store-pattern). Lue à la demande depuis `core/specs/INDEX.md`.*
