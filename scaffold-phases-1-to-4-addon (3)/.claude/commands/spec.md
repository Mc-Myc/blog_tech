---
description: Wizard interactif spec-first — produit une spec structurée + un prompt plan avant tout codage. Archive dans core/specs/.
allowed_tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"]
argument-hint: "[titre-court]  — ex: /spec auth-stripe-checkout"
---

# /spec

Wizard *spec-first* : avant tout codage, on produit une spec structurée + un plan de prompts atomiques. Conforme à ADR-001 (knowledge-store-pattern). Le store cible est `core/specs/`.

## Pourquoi

Le bottleneck quand on code avec un agent n'est presque jamais le modèle — c'est la **spec**. Une demande floue produit un code flou. Le pattern documenté (Osmani 2026, sur 2500 configs d'agents analysées par GitHub) : *spec → prompt plan → exécution par chunks*. Cette commande automatise les deux premiers étages.

## Usage

```
/spec [titre-court]
```

Si le titre est absent, la première question le demande.

## Règle d'interactivité — non négociable

> ⚠️ Comme `/init-project` :
> - **UNE SEULE question à la fois**. Pas de batch dumpé.
> - Après chaque question, **STOP**. Attendre la réponse de l'utilisateur. Aucune supposition.
> - Numéroter la progression (`Question 4/9`).
> - L'utilisateur peut répondre `?` pour explication, `skip` pour passer, `stop` pour annuler.
> - Ne **jamais** pré-remplir depuis la mémoire sans confirmation explicite.

## Workflow

### Étape 1 — Cadrage (5 questions)

1. **Titre** : nom court kebab-case (si pas fourni en argument).
2. **Objectif en une phrase** : « cette feature doit permettre à <qui> de <faire quoi> ».
3. **Pourquoi maintenant** : déclencheur business/technique. Évite le travail sans raison.
4. **Périmètre — inclus** : 3-5 puces concrètes.
5. **Périmètre — exclus** : 2-4 puces de ce qui *n'est pas* couvert. Ce point seul évite la moitié des dérives.

### Étape 2 — Contraintes (3 questions)

6. **Conventions à respecter** : ADRs concernés (lister par id), patterns du projet à suivre, choix techno imposés.
7. **Contraintes négatives** (« ce qu'on ne fait *pas* ») : anti-patterns spécifiques au projet, bibliothèques bannies, approches déjà essayées et écartées. **Ce point est critique** : les contraintes négatives évitent les régressions silencieuses.
8. **Critères d'acceptation** : 3-6 conditions binaires mesurables. Chaque condition doit pouvoir être cochée objectivement.

### Étape 3 — Plan de prompts (1 question)

9. Confirmation pour générer le plan de prompts atomiques. À partir des réponses précédentes, proposer une séquence de **chunks** (≤ 1 prompt = 1 action testable) :
   - Étape 1 : préparer X (modèle de données, route, etc.)
   - Étape 2 : implémenter Y
   - Étape 3 : tester
   - …
   Chaque étape doit tenir dans une session courte. Si une étape semble dépasser 30 minutes, la subdiviser.

### Étape 4 — Production

1. Charger la skill `knowledge-store` (procédure d'écriture dans un store ADR-001).
2. Lire `core/specs/INDEX.md`, attribuer le prochain `id` (padding 3 chiffres).
3. Créer `core/specs/<id>-<titre-court>.md` à partir de `templates/_spec-template.md`, rempli avec les réponses.
4. Ajouter la ligne d'index dans `INDEX.md`, mettre à jour `current_tokens`.
5. Restituer au thread principal :
   - Le chemin de la spec créée.
   - Un résumé du plan de prompts (les chunks).
   - La suggestion : « Prêt à attaquer le chunk 1 ? Tu peux lancer `@architect` ou coder directement. »

## Garde-fous

- **Aucune spec sans critères d'acceptation mesurables.** Si l'utilisateur tente de répondre par du flou, redemander.
- **Aucune spec sans contraintes négatives.** Si l'utilisateur dit « je ne vois pas », proposer en lecture les ADRs récents et reformuler la question.
- Une spec qui dépasse 1500 tokens est probablement deux specs. Proposer le split.
- Le plan de prompts n'est **pas** un planning détaillé — c'est une séquence d'invocations. Pas d'estimations de temps.

## Lien avec les autres commandes

- `/spec` produit l'entrée. `@architect` consomme la spec pour proposer une ADR si une décision structurante émerge.
- `@evaluator` peut vérifier qu'une implémentation respecte les critères d'acceptation de la spec.
- `/eval` peut utiliser les critères d'acceptation comme dataset de référence.
