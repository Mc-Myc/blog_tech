# Judges — prompts LLM-as-judge

Prompts versionnés utilisés par `@evaluator` pour les critères qualitatifs. Chaque judge correspond à un critère subjectif d'un dataset.

## Format

```markdown
# Judge : <nom>-v<N>

- **Critère évalué** : <description du critère>
- **Dataset associé** : <nom du dataset>
- **Version** : v1, v2, …

## Prompt système

> Tu es <rôle expert>. Tu reçois une sortie d'agent et tu dois trancher :
> <critère précis>. Réponds par PASS ou FAIL + critique de 3-5 lignes.

## Few-shot examples (critique shadowing)

### Exemple 1 (PASS)
**Entrée** : <verbatim de la sortie évaluée>
**Verdict** : PASS
**Critique** : <critique écrite par l'expert humain>

### Exemple 2 (FAIL)
**Entrée** : <verbatim>
**Verdict** : FAIL
**Critique** : <ce qui manque, pourquoi, action corrective>

### Exemple 3 (FAIL, cas limite)
...
```

## Pourquoi cette structure

- Le **prompt système** définit la posture.
- Les **few-shot examples** ancrent le jugement sur des cas réels validés humainement.
- 3-5 exemples suffisent généralement (2 PASS + 2 FAIL + 1 cas limite).
- Le judge s'aligne progressivement sur ton jugement à mesure que tu enrichis les exemples.

## Quand mettre à jour un judge

- Quand tu repères un faux positif/négatif récurrent → ajouter un exemple correctif.
- Quand le critère évolue (durcissement / clarification) → nouvelle version `vN+1`.

## Convention

- Nommage : `<critère>-v<N>.md`
- Pas de modification silencieuse : versionner.
