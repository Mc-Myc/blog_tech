# Pack : Evals

Évaluation systématique des **agents, skills et commandes** du scaffold. Méthode adaptée du framework Hamel Husain (analyse d'erreurs → critique shadowing → code-based + LLM-as-judge).

## Quand activer ce pack

Dès qu'un sub-agent ou une skill custom est créé pour le projet. Désactiver pour : projets purement scriptés sans agent custom.

## Contenu

```
evals/
├── README.md
├── datasets/             ← jeux de critères + cas de test, versionnés
│   ├── README.md
│   └── <nom-cible>-<version>.md
├── judges/               ← prompts LLM-as-judge versionnés
│   └── README.md
├── results/              ← rapports d'eval archivés (knowledge store)
│   └── README.md
└── error-analysis/       ← analyses manuelles de modes d'échec
    └── README.md
```

## Workflow

1. **Première fois** : analyse d'erreurs manuelle (`error-analysis/`). 20-50 sorties réelles, identifier 3-5 modes d'échec.
2. **Dataset** : formaliser les critères dans `datasets/<cible>-v1.md`.
3. **Eval run** : `/eval <cible>` produit un rapport dans `results/`.
4. **Itération** : si pass rate trop élevé, durcir le dataset (v2, v3...). Si trop bas, corriger la cible.

## Principes (méthode Husain)

- **Analyse d'erreurs AVANT infrastructure.** 30 min de revue manuelle valent 10 jours de dashboard.
- **Verdict binaire**, jamais 1-5.
- **Critique shadowing** : un expert humain (toi) écrit la critique de référence ; le LLM judge l'imite.
- **Code-based pour le déterministe, LLM-as-judge pour le subjectif.** Pas l'inverse.
- **« Benevolent dictator »** : un seul expert tranche par cible, pour la cohérence.
- **Un eval qui passe à 100% ne stresse rien.** Viser un dataset qui révèle 20-30% de cas problématiques.

## Lien avec le reste du scaffold

- Le sub-agent `@evaluator` est invoqué par `/eval` (et par toute commande qui veut une boucle qualité).
- La skill `evaluator-optimizer` est le pattern de référence pour les boucles génération → jugement.
- Les critères d'acceptation d'une spec (`core/specs/`) peuvent alimenter directement un dataset d'eval.
- Les rapports `results/` sont un knowledge store conforme à ADR-001.
