# Datasets d'évaluation

Un dataset = une **liste de critères** + des **cas de test** pour évaluer une cible (sub-agent, skill, commande).

## Format

```markdown
# Dataset : <cible>-v<N>

- **Cible** : @auditor / @architect / skill knowledge-store / commande /audit / …
- **Version** : v1, v2, …
- **Date** : YYYY-MM-DD
- **Auteur** : qui a défini ces critères

## Critères

### Code-based (vérifiables par script)
- [ ] Le rapport contient une section `## Synthèse`
- [ ] Le rapport classe les findings en 🔴/🟠/🟡/🟢
- [ ] Chaque finding référence un fichier:ligne

### LLM-as-judge (vérifiables par jugement)
- [ ] La priorisation des findings est cohérente avec leur impact réel
- [ ] Chaque finding a une recommandation actionnable (pas de "à améliorer" vague)
- [ ] Le rapport reste dans le périmètre du type d'audit demandé

## Cas de test

### Cas 1 : <titre>
- **Entrée** : <description ou fichier>
- **Sortie attendue (critères de réussite)** : <ce qui doit être vrai>
- **Critique de référence** : <critique écrite par l'expert humain — sert de few-shot pour le judge LLM>

### Cas 2 : <titre>
...
```

## Versioning

- Datasets versionnés `v1`, `v2`… Jamais d'écrasement silencieux.
- Un nouveau dataset = un nouveau fichier. Ne **pas** modifier un dataset après une exécution officielle.
- Quand un dataset est trop facile (pass rate 100%) → créer v2 plus dur.

## Convention

- Nommage : `<cible>-v<N>.md`
- Critères **mesurables**. Pas de "doit être bien".
- 5-15 critères par dataset. Au-delà c'est ingérable.
- 10-30 cas de test. Au-delà, scinder en plusieurs datasets thématiques.
