# Pattern : Mythos Triggers — quand le tier Escalade vaut son coût

> Ce document précise **ADR-004** (stratégie de routing par capacité). Il liste les situations où l'orchestration d'Opus 4.8 (chain-of-thought + evaluator-optimizer + voting + spec-first) ne suffit plus, et où le tier Escalade (Fable 5, classe Mythos publique) reste justifié malgré son surcoût en latence et en tokens.
>
> **Principe directeur** : l'escalade vers Mythos est un **acte conscient sur signal observable**, pas une précaution générale.

## Pourquoi ce document existe

Sans grille de détection explicite, deux dérives possibles :
- **Sous-utilisation** — on n'escalade jamais, même quand on devrait, par habitude ou par économie mal placée.
- **Sur-utilisation** — on escalade par précaution sur des cas où Opus 4.8 orchestré suffit largement. Le coût et la latence se paient sans gain réel.

La grille ci-dessous tranche.

## Les 7 domaines où Mythos garde un avantage réel

Ce ne sont pas des « domaines fonctionnels » (sécurité, perf, etc.) — c'est une classification par **mécanisme de supériorité**. C'est plus utile pour reconnaître un cas qui ne ressemble à rien de connu.

### 1. Raisonnement à long horizon cohérent

Tâches où la chaîne de raisonnement doit rester consistante sur N étapes interdépendantes.

**Pourquoi l'orchestration ne suffit pas** : chaque passe `@evaluator` redémarre le contexte, et la cohérence inter-étapes se perd. Le voting agrège mais ne maintient pas la mémoire de l'enchaînement.

**Exemples** : refacto multi-fichiers où chaque modif dépend des précédentes ; debug séquentiel d'un bug qui se révèle étape par étape ; conception d'un système où chaque module contraint le suivant.

### 2. Détection de défauts subtils non-évidents

Failles cachées, race conditions, fuites mémoire, bugs de concurrence, leaks de PII.

**Pourquoi l'orchestration ne suffit pas** : Opus peut **manquer systématiquement** la même chose subtile sur 3 passes. La redondance amplifie le miss au lieu de le corriger.

**Exemples** : audit code crypto, threading non trivial, sérialisation/désérialisation de données utilisateur, code touchant des secrets ou des données médicales.

### 3. Optimisation multi-contraintes en tension

Problèmes où 4-5 contraintes interagissent et où chaque solution candidate en casse une autre.

**Pourquoi l'orchestration ne suffit pas** : chaque passe satisfait un sous-ensemble de contraintes ; le voting ne réconcilie pas, il choisit la moins mauvaise sans nécessairement explorer l'espace complet.

**Exemples** : optimisation perf qui doit respecter sécu + retrocompat + RGPD ; choix architectural avec contraintes coût × latence × maintenabilité × équipe ; refonte de schéma BDD sous contraintes de migration.

### 4. Raisonnement formel / mathématique en profondeur

Preuves, analyse de complexité, vérification d'invariants, terminaison d'algorithmes.

**Pourquoi l'orchestration aide mais ne suffit pas** : chain-of-thought améliore Opus sensiblement sur ces tâches, mais sur des chaînes de déduction longues, la profondeur de raisonnement brute compte.

**Exemples** : prouver qu'une fonction respecte un invariant ; analyser la complexité d'un algo non-trivial ; vérification d'un protocole consensus.

### 5. Synthèse cross-domaine genuinement nouvelle

Appliquer un pattern d'un domaine A à un problème d'un domaine B sans précédent.

**Pourquoi l'orchestration ne suffit pas** : le voting converge vers le consensus mainstream, pas vers l'insight créatif. Les chains-of-thought tendent à reproduire des templates connus.

**Exemples** : appliquer un pattern de crypto à une UX ; ponts inattendus entre business et technique ; transfert d'un pattern ML à un problème système.

### 6. Décisions à haut enjeu, one-shot

Quand l'itération est interdite : production sans rollback, migration de schéma irréversible, déploiement critique.

**Pourquoi l'orchestration ne suffit pas** : l'evaluator-optimizer **suppose** qu'on peut itérer. Dans ce domaine, tu veux la meilleure réponse au premier coup parce qu'il n'y a pas de deuxième tour.

**Exemples** : générer une migration `DROP COLUMN` sur prod ; valider un patch de sécurité avant déploiement urgent ; choisir un schéma de chiffrement avant exposition de données utilisateur.

### 7. Problèmes véritablement novateurs

Situations sans précédent dans ton scaffold : pas d'ADR similaire, rien dans `research/wiki`, pas de spec template applicable.

**Pourquoi l'orchestration ne suffit pas** : voting et evaluator-optimizer s'appuient sur des templates implicites de « bonne réponse ». Sur du vraiment nouveau, la capacité brute d'extrapolation aide.

**Exemples** : exploration de paradigme inconnu ; intégration d'une techno émergente ; conception d'un workflow custom sans référence existante.

## Les 5 signaux observables (= ce qui déclenche réellement l'escalade)

Les 7 domaines sont des catégories ; les signaux ci-dessous sont **comment tu détectes que tu y es** dans la pratique. Au moins un signal présent = candidat sérieux pour Escalade.

### Signal A — Échec démontré de l'orchestration

`@evaluator` rend `FAIL` 3 fois consécutives sur le **même critère** lors d'une boucle evaluator-optimizer. Tu as la preuve directe que Opus 4.8 + discipline ne franchit pas la marche.

> **Signal le plus fort.** Quand il se déclenche, escalade sans hésiter.

### Signal B — Divergence persistante au voting

3 passes Opus produisent 3 réponses **fondamentalement différentes**, sans convergence — pas juste des reformulations, des stratégies opposées.

> Signal que le problème dépasse la capacité de jugement actuelle.

### Signal C — Recherche scaffold infructueuse

Aucun ADR similaire, aucune entrée pertinente dans `research/wiki`, aucun spec template applicable. Le `recall-misses.md` s'incrémente.

> Tu es probablement dans le domaine 7 (territoire vierge).

### Signal D — Drapeau explicite dans la spec

Une spec marque dans son frontmatter : `irreversible: true` ou `enjeu: critique`. Trigger automatique du tier Escalade.

> Force ton toi-futur à signaler **consciemment** quand tu es dans le domaine 6.

### Signal E — Tag de domaine sensible

Tâches taggées dans la spec : `crypto`, `concurrency`, `pii`, `formal-proof`, `migration-irreversible`. Pré-routage probable vers Escalade.

> Voir domaines 2, 4, 6.

## Flux de décision

```
Tâche entrante
   │
   ▼
Tâche interactive / sensible au temps ?
   │
   ├── OUI → JAMAIS Escalade (ADR-004). Workhorse ou Volume selon complexité. STOP.
   │
   └── NON
        │
        ▼
   Au moins un Signal D ou E présent ?  (déclaration explicite)
   │
   ├── OUI → Escalade direct (Fable 5). Stop.
   │
   └── NON
        │
        ▼
   Tâche complexe + async + enjeu élevé ?
   │
   ├── NON → Workhorse ou Volume selon profil. STOP.
   │
   └── OUI
        │
        ▼
   Lancer Workhorse (Opus 4.8) + chain-of-thought.
   Si critères d'acceptation non atteints :
        boucle evaluator-optimizer (max 3 itérations).
   │
   ├── PASS → archiver, STOP.
   │
   └── FAIL après 3 itérations (Signal A) → Escalade Fable 5.

   Si l'enjeu justifie de durcir la décision :
        voting Opus (3 passes).
   │
   ├── Convergence → adopter la réponse convergente, STOP.
   │
   └── Divergence persistante (Signal B) → Escalade Fable 5.
```

## Quand NE PAS escalader malgré la tentation

Trois pièges classiques :

**1. « C'est important donc je mets Mythos par sécurité. »** L'importance n'est pas un signal. Tu peux avoir un projet critique dont chaque tâche individuelle est triviale. Workhorse + orchestration suffit. Le critère est la **difficulté de la tâche**, pas l'enjeu du projet.

**2. « Je n'ai pas eu le temps d'écrire une bonne spec. »** Tentation classique : remplacer la qualité de la spec par la puissance du modèle. C'est l'inverse de la philosophie scaffold (Osmani : *« le bottleneck n'est pas le modèle, c'est la spec »*). Si tu n'as pas de spec, écris la spec. Mythos sur mauvaise spec produit une mauvaise réponse plus lentement.

**3. « Tout le monde sur le projet a accès à Mythos, autant l'utiliser. »** Disponibilité ≠ pertinence. La grille reste la même.

## Calibration par observation

Cette liste est **un point de départ basé sur des principes**, pas un benchmark mesuré. Pour la faire vivre :

- Tenir un compte dans `core/memory/lessons-learned.md` à chaque escalade : *qu'est-ce que Mythos a effectivement apporté que l'orchestration Opus n'aurait pas pu ?*
- Au bout de 10-15 escalades, faire un bilan : combien étaient justifiées ? Quels domaines/signaux étaient en cause ?
- Si un domaine ne s'est jamais avéré justifié à l'observation, le retirer de la grille via **ADR-005** (qui supersede partiellement ADR-004).
- Si un nouveau domaine émerge récurremment, l'ajouter de la même façon.

C'est la même posture que `recall-misses.md` pour ADR-002 : la décision est posée, les signaux sont définis, l'observation calibre.

## Lien avec le reste

- **ADR-004** : stratégie de routing à 3 tiers. Ce doc précise quand activer le tier Escalade.
- **`@architect`, `@auditor`, `@evaluator`** : tous trois embarquent désormais une **discipline de raisonnement chain-of-thought** qui ferme une partie du gap Opus → Mythos. C'est ce qui rend la grille ci-dessus moins souvent activée qu'elle ne le serait sans cette discipline.
- **Pattern Voting** (`agent-workflows.md`) : reste non implémenté en standard. À déclencher manuellement (3 sessions parallèles sur la même question) quand le Signal B est suspecté.
- **`lessons-learned.md`** : tient le journal des escalades effectives pour calibration future.
