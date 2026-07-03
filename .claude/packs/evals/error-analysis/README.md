# Error analysis — analyse manuelle de modes d'échec

Avant tout dataset formel, on commence par regarder ce qui foire en vrai.

## Pourquoi

Husain : *« Passer 30 minutes à revoir manuellement 20-50 sorties LLM dès qu'on fait un changement significatif. »*

L'analyse d'erreurs précède l'infrastructure. Sans elle, tu construis un dataset basé sur ce que tu **imagines** comme problèmes, pas sur les vrais.

## Workflow

1. **Collecter** 20-50 sorties réelles de la cible (depuis `packs/<pack>/audits/`, `core/architecture/decisions/`, etc.).
2. **Lire chacune en 1-2 minutes.** Pas d'analyse profonde — première impression.
3. **Étiqueter** chaque sortie : `OK` / `défaut mineur` / `défaut majeur` + une étiquette de mode d'échec en kebab-case.
4. **Regrouper** par mode d'échec. Compter les occurrences.
5. **Conclure** : top 3-5 modes d'échec deviennent les critères d'un dataset.

## Format d'une analyse

```markdown
# Analyse d'erreurs — <cible> — <date>

## Échantillon
- N sorties analysées
- Source : <chemin où elles ont été trouvées>

## Modes d'échec identifiés

| Mode | Occurrences | Exemple (chemin du fichier) | Action proposée |
|------|-------------|------------------------------|-------------------|
| critique-trop-vague | 12/30 | audits/2026-04-12-security.md | clarifier "actionnable" dans le prompt @auditor |
| priorisation-incohérente | 8/30 | audits/2026-04-15-perf.md | ajouter critère explicite dans skill security-audit |
| format-non-respecté | 3/30 | audits/2026-04-20-data.md | renforcer le format dans la skill |

## Conclusion
- Modes principaux à intégrer au dataset v1 : critique-trop-vague, priorisation-incohérente.
- Modes mineurs (< 10% des cas) à surveiller mais pas prioritaires.

## Suite
- [ ] Créer `datasets/<cible>-v1.md` avec ces critères
- [ ] Modifier le prompt @<cible> sur les modes critiques
- [ ] Re-faire une analyse dans 1 mois pour vérifier l'amélioration
```

## Quand refaire une analyse

- Après une modification significative de prompt/skill.
- Au moins une fois tous les 3 mois si la cible est en usage actif.
- Quand le pass rate du dataset semble dériver sans qu'on sache pourquoi.
