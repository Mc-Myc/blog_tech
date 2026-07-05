# ADR-005 : Modes d'exécution (supervised/batch) + politique de capture des leçons

- **Date** : 2026-07-03
- **Statut** : Accepté
- **Décideurs** : Marcel
- **Contexte technique** : orchestration de l'exécution des specs, autonomie contrôlée, boucle d'apprentissage
- **ADRs liées** : ADR-001 (knowledge stores), ADR-002 (mémoire différée), ADR-004 (routing)

## Contexte

Deux constats d'usage :

1. **Les questions pendant l'exécution cassent le flux.** La règle « une question à la fois » est excellente pour les wizards (l'amont, où l'investissement humain construit la spec) mais contre-productive pendant l'exécution d'un plan de prompts déjà validé. Une fois la spec verrouillée, l'exécution n'a plus de raison structurelle d'interrompre — logique Osmani poussée au bout : tout l'investissement humain est dans la spec.
2. **La capture des leçons « en fin de session » ne se fait pas.** Les sessions s'interrompent avant la fin ; une discipline qui repose sur un rituel final perd tout ce qui précède l'interruption.

## Décision

### 1. Deux modes d'exécution pour /run-spec

- **supervised** (défaut) : validation humaine à chaque chunk. Comportement historique.
- **batch** : zéro question pendant l'exécution. Info manquante = **hypothèse explicite journalisée** (assumptions log, write-ahead), on continue.

La règle « une question à la fois » n'est **pas** contredite : elle est délimitée.
Elle gouverne l'amont (wizards) ; le mode batch gouverne l'aval (exécution d'une
spec verrouillée).

### 2. Gate de review à chaque fin de chunk (les deux modes)

- **Tests concrets** : critères code-based du chunk (tests, build, schema-check). Déterministe.
- **Tests virtuels** : `@evaluator` en contexte isolé contre le critère de fin du chunk. Boucle evaluator-optimizer (max 3) sur FAIL.

Aucun chunk n'est validé au feeling, dans aucun mode.

### 3. Checkpoints volontaires en batch

`checkpoint_every: N` dans le frontmatter de la spec (défaut **3**, overridable
par `--checkpoint`). Tous les N chunks : arrêt, rapport (chunks faits, verdicts,
hypothèses posées), validation ou réorientation humaine.

### 4. Trois arrêts forcés en batch — non négociables, court-circuitent N

1. **FAIL persistant** après la boucle (3 itérations) — c'est aussi un Signal A.
2. **Action irréversible imminente** (Signal D) — l'humain valide, toujours.
3. **Hypothèse touchant une contrainte explicite de la spec** — l'agent ne tranche jamais contre la spec.

### 5. Politique de capture des leçons : write-ahead, pas fin de session

- La capture est faite **au fil de l'eau, à chaque événement** : FAIL d'evaluator, fin de chunk, escalade de tier, ERROR de /lint. Append immédiat dans le store concerné, au moment où l'événement se produit. Une session interrompue ne perd rien.
- `/debrief` devient une **consolidation optionnelle** : il capture ce que la machine ne voit pas (surprises, intuitions), pas les événements.
- **Stockage** : markdown + INDEX (ADR-001). Pas de vectoriel — ADR-002 s'applique telle quelle ; ses critères de réouverture couvrent ce cas. Les FAIL alimentent les **datasets d'eval** (flywheel Husain) ; le dataset est la destination d'une catégorie de leçons, pas un format de stockage.
- **Localisation** : par projet, par défaut. Les leçons taguées `scaffold` remontent vers le repo scaffold via promotion validée — jamais de sync automatique.
- **Promotion** : capture automatique, **promotion validée**. Seuil de récurrence 3 (skill `distill-lessons`), validation humaine, et `/eval` obligatoire avant merge de tout agent modifié — le test de non-régression du processus d'apprentissage lui-même.

## Justification

Le partage humain/machine devient : l'humain investit dans la spec et tranche aux
checkpoints ; la machine exécute, vérifie chaque pas, et documente ses hypothèses
au lieu de demander. Les arrêts forcés bornent l'autonomie exactement là où le
coût d'une erreur dépasse le coût d'une interruption.

Côté apprentissage, le write-ahead résout le problème réel (sessions interrompues)
sans infrastructure nouvelle : tout est append markdown dans des stores ADR-001
existants ou créés ici (escalations.md).

## Conséquences

**Positives** : exécution longue sans baby-sitting ; traçabilité complète (journal
d'exécution, assumptions log) ; le système s'améliore à l'usage sans dérive
silencieuse (promotion verrouillée par validation + eval).

**Négatives / risques** :
- Le mode batch sur une spec médiocre produit des hypothèses en cascade. Mitigation : les gates FAIL vite, et l'arrêt forcé n°3 protège les contraintes.
- La boucle d'apprentissage ne vaut que si le débit d'usage existe. Avec une session/semaine elle tourne à vide — l'investissement paie sur les projets actifs.
- `checkpoint_every: 3` est un a priori. À calibrer par observation, comme le reste.

## Réversibilité

Totale : ne pas passer `--batch` = comportement v3. Les stores créés sont append-only et inertes s'ils ne sont pas alimentés.
