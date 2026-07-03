# ADR-004 : Stratégie de routing par capacité — grille complexité × latence × coût

- **Date** : 2026-06-13
- **Statut** : Accepté
- **Décideurs** : Marcel
- **Contexte technique** : orchestration multi-modèle, choix du modèle par tâche, arbitrage coût/latence/qualité

## Contexte

Le pattern **Routing** (n°2 de `agent-workflows.md`) est documenté depuis le départ mais explicitement **non imposé** au niveau scaffold — ADR-003 le range dans « patterns adoptés ad-hoc projet par projet », sous la forme caricaturale *easy → Haiku / hard → Opus*.

Deux constats poussent à formaliser une stratégie réutilisable plutôt que de réinventer la règle à chaque projet :

1. Le palier de modèles **classe Mythos** se situe au-dessus d'Opus en capacité. Le gain se paie : un modèle de palier supérieur fait plus de raisonnement par tâche, donc **plus de latence et de coût**. Observation terrain — le tier Mythos prend nettement plus de temps sur une tâche donnée.
2. La règle binaire « plus dur = plus gros modèle » est insuffisante. Une tâche difficile *mais sensible au temps* (boucle interactive dans l'IDE, wizard `/spec` qui attend une réponse humaine) ne doit **pas** partir sur le tier lent, même si elle est complexe.

La capacité n'est donc pas le seul axe de décision. Il faut une grille.

## Décision

Adopter une stratégie de routing à **trois tiers**, arbitrée sur **trois critères** (et non le seul critère de complexité).

### Les trois critères de classification

1. **Complexité** — la tâche demande-t-elle un raisonnement profond, multi-étapes, à fort enjeu de justesse ?
2. **Tolérance à la latence** — la tâche est-elle dans une boucle interactive (réponse attendue par un humain ou par l'étape suivante) ou async (batch, tâche de fond) ?
3. **Coût** — volume d'invocations, budget du projet, criticité économique de la tâche.

### Les trois tiers

| Tier            | Modèle cible                              | Profil                                            |
|-----------------|-------------------------------------------|---------------------------------------------------|
| **Volume**      | Modèles locaux (Mistral / Qwen / DeepSeek) | Tâches courantes, volumineuses, classification, pré-traitement. Coût quasi nul, latence maîtrisée, données qui restent self-hosted. |
| **Workhorse**   | **Claude Opus 4.8**                       | Défaut raisonnable pour les tâches complexes. Le tier par défaut quand on hésite. |
| **Escalade**    | **Claude Fable 5** (classe Mythos, public, `claude-fable-5`) | Escalade *consciente* : difficulté qui justifie le palier supérieur **et** latence tolérée. Jamais par défaut. |

### Règle de décision

```
1. Tâche sensible au temps (interactive) ?
   → JAMAIS le tier Escalade, quelle que soit la complexité.
     Volume si simple, Workhorse (Opus 4.8) si complexe.

2. Tâche async + volumineuse + faible enjeu de justesse ?
   → Volume (local).

3. Tâche complexe, async, enjeu de justesse élevé ?
   → Workhorse (Opus 4.8) par défaut.
   → Escalade (Fable 5) seulement si Opus 4.8 a échoué le critère
     d'acceptation OU si l'enjeu justifie explicitement le surcoût/latence.

4. Dans le doute → Workhorse (Opus 4.8).
```

L'escalade vers le tier Mythos est un **acte explicite**, pas un défaut. On monte d'un tier quand le tier inférieur a démontré son insuffisance (ex : `@evaluator` rend `FAIL` de façon répétée), pas par précaution.

### Périmètre du tier Escalade

- Cible **publique** = **Claude Fable 5** (classe Mythos, mesures de sécurité permettant l'accès public).
- **Claude Mythos Preview / Mythos 5** : accès restreint (projet Glasswing), **hors périmètre** d'un workflow général. Ne pas l'inscrire comme cible de routing tant qu'on n'y a pas accès.

## Justification

Cette ADR transforme un pattern « connu mais ad-hoc » en **grille de décision documentée**, conforme à la posture d'ADR-003 (adopter consciemment, pas par cargo-culting).

Le point non trivial — et la raison d'être de l'ADR — est d'ajouter **la latence comme critère de premier rang**, au même titre que la complexité. C'est ce qui évite l'erreur classique : envoyer une tâche interactive sur le plus gros modèle « parce qu'elle est difficile » et dégrader l'expérience par une latence inacceptable.

Opus 4.8 comme défaut, plutôt que comme plafond, reflète que la majorité des tâches complexes du scaffold n'ont pas besoin du palier au-dessus — et que ce palier se paie en temps.

## Conséquences

**Positives**
- Règle réutilisable inter-projets, plutôt qu'une décision reprise à zéro à chaque fois.
- La latence devient un critère explicite → moins de mauvaises surprises côté expérience interactive.
- Le tier Volume (local) garde les données sensibles self-hosted, cohérent avec la préférence self-hosted stricte du scaffold.
- L'escalade consciente évite la dérive de coût (« on met du gros modèle partout par sécurité »).

**Négatives**
- Une logique de classification doit vivre quelque part (règles dans `CLAUDE.md`, ou commande dédiée). Coût de plomberie initial.
- La grille demande un jugement à l'instanciation ; elle n'automatise pas le choix, elle le cadre.

**Neutres**
- Le tier Escalade pointe aujourd'hui sur Fable 5 ; si l'accès aux modèles Mythos restreints change, la cible se met à jour par **nouvelle ADR** (append-only).

## Plan d'implémentation

- [x] ADR-004 rédigée
- [ ] Ajout à l'INDEX des décisions (entrée 004)
- [ ] Encoder la règle de décision dans `CLAUDE.md` (section routing) OU créer une commande `/route` si le choix devient du travail cognitif récurrent
- [ ] Pattern **Voting** (n°3b, `agent-workflows.md`) noté « non implémenté » — à ajouter ad-hoc si la décision de routing elle-même devient bruitée

## Suivi

- À ré-évaluer si : nouvel accès à un palier Mythos restreint (mise à jour des cibles), ou apparition d'un nouveau tier de modèle.
- Emprunt de pattern : **Routing** (Anthropic, *Building Effective Agents*) + idée multi-modèle (Osmani) — cf. **ADR-003** pour l'attribution et la grille de décision d'adoption.
- ADRs liées : ADR-003 (patterns praticiens, qui listait ce routing comme « non imposé » — cette ADR fait évoluer ce statut au niveau scaffold).
