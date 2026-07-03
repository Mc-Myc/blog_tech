# Pattern : Agent Anti-Patterns

Trois pièges classiques quand on construit un système agentique, identifiés dans la littérature praticienne (Anthropic Engineering, Husain, Osmani, retours de prod). Ce document liste les anti-patterns avec leurs **détecteurs concrets** dans le scaffold.

## Anti-pattern 1 — L'agent monolithique

### Description

Un seul agent qui « fait tout » : revue de code + génération + audit + mémoire + déploiement. Tentation classique : éviter la complexité de la modularité en bourrant un agent unique.

### Pourquoi c'est cassé

- **Pollution de contexte** : l'agent doit tout savoir, donc son prompt système gonfle, donc son budget de contexte fond.
- **Régression cachée** : modifier le prompt pour améliorer une compétence dégrade silencieusement les autres.
- **Évaluation impossible** : tu ne sais pas si « l'agent » fait bien son job, parce qu'il fait 12 jobs.
- **Pas de spécialisation** : un audit fait par un agent généraliste est moins bon qu'un audit fait par un `@auditor` spécialisé.

### Détecteurs dans le scaffold

- Un fichier `agents/*.md` dont la `description` couvre > 2 domaines distincts.
- Un fichier `agents/*.md` dont le contenu dépasse 200 lignes.
- Une commande qui invoque le même sub-agent pour des tâches sans rapport.
- Pas de `@evaluator`, pas de `@auditor`, pas de `@memory-keeper` distincts → un seul méta-agent.

### Correction

Scinder par responsabilité. Un sub-agent = une mission claire (résumable en une phrase). Si tu ne peux pas résumer en une phrase, c'est qu'il en faut deux.

## Anti-pattern 2 — Over-engineering du planning

### Description

3 heures de plan détaillé pour 30 minutes de code. Un agent qui passe la majorité de son temps à raisonner sur ce qu'il va faire plutôt que de le faire.

### Pourquoi c'est cassé

- **Coût disproportionné** : tu paies des tokens pour de la planification que tu jetteras parce que la réalité du code te fera dévier.
- **Faux sentiment de contrôle** : un long plan détaillé semble rassurant, mais il fige des hypothèses fausses tôt.
- **Délégation cassée** : un sub-agent qui reçoit un plan trop fin n'a plus de marge — autant écrire le code soi-même.

### Détecteurs dans le scaffold

- Une spec `core/specs/<id>-*.md` qui dépasse 2000 tokens.
- Un prompt plan avec > 8 chunks (probablement à scinder en plusieurs specs).
- Un ADR rédigé pour une décision qui aurait pu être un commentaire dans un commit.
- Un audit qui produit un rapport plus long que le code qu'il analyse.

### Correction

- **Spec courte, prompt plan court.** Si tu dépasses, scinder en deux specs.
- **Plan = orientation, pas exécution figée.** L'agent doit pouvoir adapter en cours.
- **ADR seulement pour les décisions structurantes** (cf. `core/architecture/decisions/README.md`). Pas pour chaque choix mineur.

Husain résume bien : *« start with error analysis, not infrastructure »*. Pareil pour le planning : commence par le travail, pas par sa cartographie.

## Anti-pattern 3 — Absence d'observabilité

### Description

L'agent fait son travail mais on n'a aucun moyen de voir **ce qu'il a fait**, **dans quel ordre**, **avec quelles décisions intermédiaires**. Le système devient une boîte noire.

### Pourquoi c'est cassé

- **Debug impossible.** Un sub-agent retourne un mauvais rapport, tu ne sais pas pourquoi.
- **Confiance non vérifiable.** Tu ne peux pas mesurer la qualité (cf. `packs/evals/`).
- **Pas d'amélioration possible.** Sans trace, pas d'analyse d'erreurs. Sans analyse d'erreurs, pas d'amélioration de prompt.

Husain insiste : *« L'investissement le plus rentable n'est pas un dashboard sophistiqué, c'est une interface customisée qui laisse n'importe qui examiner ce que l'IA fait réellement »*.

### Détecteurs dans le scaffold

- Un sub-agent qui n'**archive pas** sa sortie dans un store (`packs/<pack>/audits/`, `packs/evals/results/`, etc.).
- Une commande qui produit sans laisser de trace en disque (sortie uniquement en chat).
- Un sub-agent qui retourne son raisonnement intermédiaire mêlé à sa sortie finale (impossible de distinguer la prod du process).
- Pas de hook `PostToolUse` log pour les actions destructives.
- Pas de `error-analysis/` rempli dans `packs/evals/`.

### Correction

- **Tout sub-agent doit archiver sa sortie** dans un knowledge store (ADR-001).
- **La sortie au thread principal est CONDENSÉE** (≤ 2k tokens : synthèse + chemin de l'archive).
- **Hooks `PostToolUse`** loggent les actions destructives dans `.claude/local/destructive-actions.log`.
- **Analyse d'erreurs périodique** sur les sorties d'agents (cf. `packs/evals/error-analysis/`).

## Quoi faire avec ce document

Quand tu crées un nouveau sub-agent, une nouvelle skill, une nouvelle commande : **relis ces trois anti-patterns** et vérifie que tu n'es pas en train d'en commettre un. C'est un check rapide (5 min), qui économise des heures de debug plus tard.

Quand tu fais une revue de scaffold (trimestrielle par exemple) : faire la passe « détecteurs » sur tous les agents/commands et noter les écarts. Les écarts ne sont pas des urgences — ils sont des dettes à traiter avant qu'elles ne pourrissent.
