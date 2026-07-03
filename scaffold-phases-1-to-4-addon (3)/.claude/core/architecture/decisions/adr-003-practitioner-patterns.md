# ADR-003 : Patterns praticiens — convergences et divergences conscientes

- **Date** : 2026-05-29
- **Statut** : Accepté
- **Décideurs** : Marcel
- **Contexte technique** : architecture du scaffold, attribution intellectuelle

## Contexte

Le scaffold accumule des patterns dont plusieurs sont **explicitement empruntés** à des praticiens publics. Sans attribution, on prête le flanc à deux risques :

1. Prétendre rétrospectivement avoir inventé des idées qu'on a en fait reprises (malhonnêteté intellectuelle, et risque de mal reproduire le pattern original par mauvaise compréhension).
2. **Cargo-culting** silencieux : adopter un pattern parce qu'il est populaire sans interroger s'il s'applique à notre contexte (problème inverse — la mode comme moteur de décision).

Cette ADR fait l'inventaire : ce qu'on a pris, à qui, pourquoi, et ce qu'on a délibérément **laissé** malgré la popularité.

## Décision

Documenter explicitement les patterns empruntés dans cette ADR, avec leur source, leur adaptation locale, et les divergences assumées. Cette ADR sert de **grille de décision** pour les futures propositions externes : on applique le même filtre (qu'est-ce qui colle à nos contraintes, qu'est-ce qu'on garde, qu'est-ce qu'on laisse) plutôt que de réagir au coup par coup.

## Patterns empruntés (avec adaptation)

### 1. Knowledge-store pattern — Karpathy (avril 2026)

**Source** : *LLM Knowledge Bases* (idea file publié sur GitHub Gist en avril 2026). Trois couches : raw immuable / wiki LLM-owned / schema CLAUDE.md.

**Ce qu'on a pris** :
- Le principe « LLM writes, you read » → adopté pour `@memory-keeper`, `@auditor`, `@architect`.
- L'idée d'un INDEX léger en RAM, items lus à la demande → formalisé dans ADR-001 (knowledge-store-pattern).
- Séparation `raw/` ⇆ `wiki/` → adoptée dans `packs/research/`.
- Opération `lint` distincte de la compaction → adoptée comme commande `/lint` + skill `health-check`.

**Ce qu'on a laissé** :
- **Obsidian comme dépendance** : le scaffold reste agnostique sur l'éditeur. Le markdown est lisible partout.
- **Idea file comme format de partage** : notre scaffold *est* le code, pas une idée. Convention inverse, délibérée.
- **80% délégation à des agents** : posture personnelle d'un chercheur. Le scaffold *permet* mais n'*impose* pas.

### 2. Spec-first workflow — Osmani (décembre 2025 + février 2026)

**Source** : *My LLM coding workflow going into 2026* (Medium, déc. 2025) + *How to Write a Good Spec for AI Agents* (O'Reilly Radar, fév. 2026).

**Ce qu'on a pris** :
- Le principe central : **le bottleneck n'est pas le modèle, c'est la spec**. Constat appuyé sur l'analyse GitHub de 2500 configs d'agents.
- **Chunks atomiques** : pas de gros bloc d'un coup, séquence de prompts courts. Adopté dans `/spec`.
- **Contraintes négatives explicites** : ce qu'on ne fait *pas*. Section obligatoire du template `_spec-template.md`.
- **Critères d'acceptation mesurables** avant l'écriture du premier prompt.
- Distinction `CLAUDE.md` pour le processus / `Skills` pour le contexte durable.

**Ce qu'on a laissé** :
- **Prompt plan généré automatiquement par un outil tiers** (Cursor, etc.) : notre `/spec` produit le plan dans le wizard, pas via un outil externe.
- **Multi-modèle systématique** (router Haiku / Sonnet / Opus) : on documente le pattern de routing (cf. `agent-workflows.md`) sans l'imposer.

### 3. Evals pragmatiques — Husain (2025-2026)

**Source** : *LLM Evals: Everything You Need to Know* (hamel.dev, juillet 2025), *Creating a LLM-as-a-Judge that drives business results* (juillet 2025), AI Evals course (Maven).

**Ce qu'on a pris** :
- **Analyse d'erreurs AVANT infrastructure** : 30 min de revue manuelle valent un dashboard sophistiqué. Adopté dans `packs/evals/error-analysis/`.
- **Verdict binaire, pas score 1-5.** Forme du `@evaluator`, format du dataset.
- **Critique shadowing** : un expert humain écrit la critique de référence, qui devient few-shot pour le LLM judge. Adopté dans `packs/evals/judges/`.
- **Code-based pour le déterministe, LLM-as-judge pour le subjectif.** Pas l'inverse. Format des datasets impose la distinction.
- **« Benevolent dictator »** : un seul expert tranche par cible.
- **Un eval qui passe à 100% ne stresse rien.** Cible 60-85% de pass rate, sinon durcir le dataset.

**Ce qu'on a laissé** :
- **Frameworks d'eval propriétaires** (Braintrust, LangSmith, etc.) : on reste sur du markdown + bash + sub-agents, conforme à la philosophie self-hosted du scaffold.

### 4. Five canonical workflows — Anthropic Engineering (décembre 2024)

**Source** : *Building Effective Agents* (anthropic.com/news, décembre 2024).

**Ce qu'on a pris** :
- Les **5 patterns** comme vocabulaire commun pour designer agents et commandes : Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer. Documentés dans `agent-workflows.md`.
- **Distinction workflow vs agent** : workflows = chemins prédéfinis ; agents = LLM qui dirige dynamiquement. Adopté pour catégoriser nos sub-agents.
- Les **3 anti-patterns** identifiés dans la littérature praticienne : monolithique, over-planned, sans observabilité. Documentés dans `agent-antipatterns.md` avec détecteurs concrets dans le scaffold.

**Ce qu'on a laissé** :
- **Tout réimplémenter en Spring AI / Laravel AI / autre SDK** : les patterns vivent dans nos sub-agents/skills/commands, pas dans une lib externe.

## Patterns publics qu'on a délibérément **NON** adoptés

### "Vibe coding" intégral (Karpathy, début 2025)

Posture qui consiste à laisser l'agent piloter sans plan préalable, sur la base d'instructions vagues. Inadaptée au scaffold : on est en *spec-first*. Le « vibe » est OK pour explorer un prototype jetable, pas pour un projet vivant.

### Mémoire vectorielle / RAG comme infrastructure obligatoire

Voir ADR-002. Décision **différée** avec critères de réouverture explicites. Pas un rejet, mais un pas-encore.

### Auto-research loop (Karpathy, février 2026)

Agents qui itèrent en boucle pour optimiser des hyperparamètres ML. Spécifique au contexte recherche ML. Pas une préoccupation transversale du scaffold ; à ranger dans `packs/ai/` pour des projets type Agent IDE Phase 3 si pertinent.

### Multi-modèle systématique avec routing par coût

Pattern *easy → Haiku / hard → Opus* pour optimiser coût/latence. Documenté dans `agent-workflows.md` comme option, **non imposé** au niveau scaffold. Adopté ad-hoc projet par projet.

## Justification

Cette ADR n'ajoute pas de plomberie. Elle ajoute de la **traçabilité** : dans 6 mois, quand Karpathy ou un autre publiera une nouvelle idée virale, l'instinct sera *« on l'intègre ? »*. La grille de décision documentée ici (qu'est-ce qui colle à nos contraintes ? qu'est-ce qu'on garde ? qu'est-ce qu'on laisse ?) sera applicable directement.

Honnêteté intellectuelle aussi : ces patterns ne sont pas tombés du ciel. Les attribuer, c'est respecter le travail public sur lequel le scaffold s'appuie.

## Conséquences

**Positives**
- Grille de décision réutilisable pour les futures propositions externes.
- Évite le cargo-culting (« on l'adopte parce que c'est populaire »).
- Évite la malhonnêteté inverse (« on a tout inventé »).
- Documente les **divergences conscientes** — précieux pour expliquer pourquoi on diffère d'un pattern populaire.

**Négatives**
- Ce document doit être tenu à jour quand on emprunte de nouveaux patterns. Sinon il devient obsolète.

**Neutres**
- Si quelqu'un d'autre reprend ce scaffold, il sait à qui doit quoi. Bénéfice ou coût selon les sensibilités.

## Plan d'implémentation

- [x] ADR-003 rédigée
- [x] Ajout à l'INDEX des décisions
- [ ] Convention : toute ADR future qui emprunte un pattern existant le mentionne et fait référence à ADR-003

## Suivi

- À ré-évaluer si : l'écosystème publie un pattern majeur qu'on décide d'adopter (mise à jour de la liste).
- ADRs liées : ADR-001 (knowledge-store), ADR-002 (vectoriel différé).
