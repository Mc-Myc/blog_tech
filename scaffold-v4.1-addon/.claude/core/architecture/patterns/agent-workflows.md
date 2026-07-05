# Pattern : Agent Workflows — les 5 patterns canoniques

## D'où ça vient

Anthropic a publié en décembre 2024 (essai *Building Effective Agents*) cinq workflows composables qui sont devenus le vocabulaire commun de la profession. Ce document mappe chaque pattern aux primitives du scaffold pour qu'on choisisse le bon outil quand on instancie un nouvel agent ou une nouvelle commande.

## 1. Prompt Chaining — étapes séquentielles

**Définition** : décomposer une tâche en étapes, où la sortie de l'étape N devient l'entrée de l'étape N+1.

**Quand l'utiliser** : la tâche se découpe naturellement en étapes ordonnées, chaque étape a un output clair, et la qualité globale dépend de l'enchaînement.

**Exemples** : générer un rapport (plan → rédaction → relecture), traduire un document (transcription → traduction → relecture).

**Primitives scaffold** :
- **Plan mode** de Claude Code (pour designer la séquence).
- **Skills** comme étapes individuelles (chaque skill = une étape compilable).
- Le wizard `/spec` est un exemple : il enchaîne cadrage → contraintes → prompt plan, chaque étape s'appuie sur la précédente.

## 2. Routing — classifieur dirige

**Définition** : un LLM classifie l'entrée et dirige vers le handler spécialisé approprié.

**Quand l'utiliser** : tu as plusieurs handlers spécialisés et le choix du bon handler dépend du contenu, pas d'un argument explicite.

**Exemples** : router une question facile vers Haiku (rapide, peu cher), une question difficile vers Opus (puissant). Router une demande d'analyse vers le bon sub-agent (`@auditor` pour audit, `@architect` pour décision, `@evaluator` pour jugement).

**Primitives scaffold** :
- **Règles conditionnelles dans `CLAUDE.md`** (ex: « si la demande commence par 'audit', invoquer `@auditor` »).
- La commande `/audit <type>` est un mini-routeur : selon `<type>`, elle charge la bonne skill (`security-audit`, `performance-audit`, etc.).

**Quand créer un router explicite** : quand tu as > 5 sub-agents et que choisir lequel devient du travail cognitif. À 3-4 sub-agents, l'utilisateur appelle directement.

## 3. Parallelization — en parallèle

Deux variantes :

### 3a. Sectioning — sous-tâches indépendantes en parallèle

**Quand** : la tâche se décompose en parts indépendantes (ex: auditer 5 modules en parallèle).

**Primitives scaffold** :
- Plusieurs `@auditor` lancés en parallèle sur des scopes différents (via Task tool).
- Plusieurs sessions Claude Code en parallèle dans des terminaux différents, chacune sur son working file.

### 3b. Voting — même tâche N fois, agrégation

**Quand** : tu veux la diversité d'angles ou réduire la variance d'une sortie subjective.

**Exemple** : faire évaluer une ADR par 3 instances de `@evaluator`, ne retenir le `PASS` que si ≥ 2/3 votent `PASS`.

**Primitives scaffold** :
- Non implémenté en standard dans le scaffold actuel. À ajouter ad-hoc quand le besoin émerge (typiquement pour des decisions importantes où le verdict d'un seul évaluateur est trop bruité).

## 4. Orchestrator-Workers — décomposition dynamique

**Définition** : un LLM central décompose une tâche **dynamiquement** (sans plan figé), délègue à des workers, synthétise.

**Différence clé avec parallelization** : les sous-tâches ne sont **pas pré-définies**. L'orchestrateur les invente selon l'entrée.

**Quand l'utiliser** : tâche complexe dont on ne peut pas prédire la décomposition à l'avance (ex: modification de code qui touche un nombre variable de fichiers selon la complexité du bug).

**Exemples** : Claude Code utilise ce pattern via le **Task tool** — l'agent principal délègue dynamiquement à des sub-agents.

**Primitives scaffold** :
- **Sub-agents** invoqués via Task : `@architect`, `@auditor`, `@evaluator`, `@memory-keeper`.
- L'orchestrateur = Claude principal qui décide quoi déléguer.

**Coût** : selon Anthropic, ~15× le coût d'une conversation chat sur leur cas Claude Research. À considérer pour les budgets serrés.

## 5. Evaluator-Optimizer — boucle de raffinement

**Définition** : un LLM génère, un autre évalue, on itère jusqu'à acceptable.

**Quand l'utiliser** : critères de qualité explicites, sortie qui bénéficie de plusieurs passes, coût d'itération raisonnable.

**Primitives scaffold** :
- **`@evaluator`** + skill **`evaluator-optimizer`** + commande **`/eval`** — c'est exactement ce pattern.
- Voir `skills/evaluator-optimizer/SKILL.md` pour la procédure complète.

**Paramètres** : N max itérations (3 par défaut), critère d'arrêt (`PASS` ou `N` épuisé), pas de boucle silencieuse.

## Comment choisir

Quand tu conçois une nouvelle commande/agent, te poser ces questions dans l'ordre :

1. **La tâche a-t-elle des étapes ordonnées explicites ?** → Prompt Chaining.
2. **Plusieurs handlers spécialisés possibles, choix selon le contenu ?** → Routing.
3. **Tâche découpable en parts indépendantes ?** → Parallelization (sectioning).
4. **Besoin de réduire la variance d'une sortie subjective ?** → Parallelization (voting).
5. **Tâche complexe dont la décomposition n'est pas prévisible ?** → Orchestrator-Workers.
6. **Critères de qualité explicites, sortie raffinable par itération ?** → Evaluator-Optimizer.

Une commande peut combiner plusieurs patterns. Exemple : `/audit` utilise Routing (selon `<type>`) puis Orchestrator-Workers (l'auditor délègue dynamiquement).

## Lien avec `llm-as-compiler.md`

Ces 5 patterns décrivent **comment** la compilation se fait dans les cas non triviaux. Le pattern `llm-as-compiler` décrit **ce qu'est** la commande au global (entrée → compilation → sortie). Les deux se complètent : le compilateur **interne** d'une commande peut utiliser n'importe lequel des 5 patterns.
