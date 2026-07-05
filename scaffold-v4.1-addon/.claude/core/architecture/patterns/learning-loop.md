# Pattern : Learning Loop — capture automatique, promotion validée

> Complète ADR-005 (qui fixe la politique). Ce doc décrit la boucle complète et
> ses garde-fous. Lucidité d'abord : un LLM n'apprend rien entre les sessions —
> les poids ne bougent pas. Tout « l'apprentissage » d'un scaffold est du
> **context engineering** : capturer de l'expérience en texte, la consolider,
> la réinjecter au bon moment.

## Les quatre étages

```
   ÉVÉNEMENTS                    JOURNAL BRUT                RÈGLES COMPILÉES            COMPORTEMENT FUTUR
(FAIL, escalade,     ──1──▶  lessons-learned.md   ──2──▶   distill-lessons     ──3──▶  /spec Q7 (contraintes nég.)
 ERROR lint,                 escalations.md                (récurrence ≥ 3,             datasets d'eval (flywheel)
 hypothèse batch,            assumptions logs               candidates à                 few-shot du judge
 debrief manuel)                                            promotion)                   patchs d'agents (validés)
                                                                 │
                                                            4. VALIDATION
                                                       (humain tranche + /eval
                                                        avant merge d'un agent)
```

### 1. Capture — automatique, write-ahead

Les commandes journalisent elles-mêmes, à l'instant de l'événement :

| Événement | Qui journalise | Où |
|---|---|---|
| FAIL d'un critère | /eval, /run-spec | lessons-learned.md, tag `[auto]` |
| ERROR structurel | /lint | lessons-learned.md, tag `[auto]` |
| Escalade de tier | /run-spec, skill voting | escalations.md |
| Hypothèse en mode batch | /run-spec | `core/specs/<id>-assumptions.log.md` |
| Surprise / intuition | /debrief (humain) | lessons-learned.md, tag `[manuel]` |

Jamais « en fin de session » : les sessions s'interrompent. L'append immédiat
garantit que rien ne dépend d'un rituel final.

### 2. Consolidation — skill distill-lessons

Périodique (15+ entrées). Regroupe par pattern sémantique. 1-2 occurrences =
bruit, reste au journal. **3+ = candidate à promotion.** Même logique que
raw/ → wiki/ : journal brut immuable, règles régénérables.

### 3. Application — chaque catégorie de règle a sa destination

- Pratique projet → suggestion en **contraintes négatives** du wizard /spec (le raccord le plus rentable : elles évitent la moitié des régressions et repartaient de zéro à chaque spec).
- Critère qui FAIL souvent → **cas de test dans le dataset** de la cible. L'échec d'aujourd'hui devient le test de régression de demain (flywheel Husain).
- Critique validée d'@evaluator → **few-shot du judge** (le judge s'aligne progressivement sur le jugement humain).
- Comportement d'agent → **patch du fichier agent** — voie la plus puissante et la plus dangereuse, d'où l'étage 4.
- Tag `scaffold` → remontée vers le repo scaffold, via ADR si structurant.

### 4. Validation — le garde-fou qui rend la boucle saine

**Le système ne modifie jamais ses propres prompts.** Il journalise et propose ;
l'humain tranche ; et la convention existante verrouille : tout changement à un
fichier de `agents/` ou `skills/` passe par `/eval` avant merge. L'eval est le
test de non-régression **du processus d'apprentissage lui-même**.

## Anti-patterns

- **Auto-modification silencieuse des agents.** La dérive exacte que le scaffold combat. Interdit sans exception.
- **Promotion d'une leçon vue une fois** « parce qu'elle semble importante ». C'est de l'inférence, pas de l'apprentissage.
- **Sync automatique projet → scaffold.** Une leçon locale généralisée à tort contamine tous les projets. Remontée consciente uniquement.
- **Boucle sans débit.** Sur un projet à une session/semaine, ne pas investir dans la calibration — elle demande du volume.

## Deux niveaux de leçons

- **Projet** (défaut) : `core/memory/` du projet. Contextuelles, ne polluent pas les autres projets.
- **Scaffold** (tag `scaffold`) : concernent le système lui-même — wizard, grille de routing, structure. Remontent par promotion validée vers le repo du scaffold. C'est le « besoin cross-projet » qu'ADR-002 liste parmi ses critères de réouverture : si ces remontées deviennent fréquentes et que le grep ne suit plus, la mémoire vectorielle (qmd) se rediscute là.
