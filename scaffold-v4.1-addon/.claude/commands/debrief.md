---
description: Consolidation de fin de session — 3 questions, alimente lessons-learned.md. Optionnel par design — la capture des événements est déjà faite au fil de l'eau (write-ahead, ADR-005) ; le debrief ajoute ce que la machine ne voit pas.
allowed_tools: ["Read", "Write", "Edit", "Bash", "Grep"]
argument-hint: "(aucun argument)"
---

# /debrief

Trois questions, une à la fois (règle wizard habituelle), réponses courtes acceptées :

1. **Qu'est-ce qui t'a surpris** dans cette session ? (bon ou mauvais)
2. **Qu'est-ce qu'on refera** — un choix, une méthode, un enchaînement qui a bien marché ?
3. **Qu'est-ce qu'on ne refera pas** ?

`skip` pour passer une question, `stop` pour annuler. Une session sans rien à
dire est une réponse valide : ne pas forcer des leçons artificielles.

## Production

1. Lire les événements auto-journalisés de la session (FAIL, escalades, hypothèses) s'ils existent — les montrer en rappel avant la question 1.
2. Chaque réponse non vide devient une entrée dans `core/memory/lessons-learned.md` :

```markdown
- [YYYY-MM-DD] [manuel] [tags] <leçon en une phrase> (contexte : <spec/chunk/session>)
```

3. Si une leçon concerne **le scaffold lui-même** (wizard, grille de routing, structure) et non le projet : tag `scaffold`. C'est le marqueur de remontée vers le repo scaffold (learning-loop, promotion validée — jamais de sync auto).
4. Rappeler le compteur : si `distill-lessons` n'a pas tourné depuis 15+ entrées, le proposer (une question, pas d'exécution silencieuse).

## Ce que /debrief n'est PAS

- Pas la capture principale — elle est faite au fil de l'eau par /eval, /lint, /run-spec.
- Pas un rituel obligatoire — le sauter ne perd aucun événement machine.
- Pas un rapport de session — trois phrases valent mieux qu'une page.
