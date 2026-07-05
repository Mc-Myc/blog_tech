# Pattern : LLM-as-Compiler

## Idée centrale

Toutes les commandes et sous-agents productifs du scaffold suivent **un seul pattern** : ils prennent des **fichiers d'entrée structurés** et produisent des **fichiers de sortie structurés**, exactement comme un compilateur traditionnel.

```
   ENTRÉES (immuables)        →   COMPILATEUR (LLM + skill + agent)  →   SORTIES (structurées)
   ──────────────────────         ──────────────────────────────────       ──────────────────────
   code source                    /audit + @auditor                       rapport d'audit priorisé
   sources brutes (raw/)          /compile-wiki                            pages wiki interlinkées
   spec en chunks                 /spec + Claude                           plan de prompts atomiques
   contexte projet                /feasibility + @architect                étude comparée signée
   store actuel                   /compact                                 store réduit + archive
   store actuel                   /lint                                    rapport de santé
   sortie + critères              /eval + @evaluator                       verdict + critique
   commits récents                /update-memory + @memory-keeper          compressed-context.md à jour
```

## Pourquoi cette métaphore

Trois bénéfices concrets, pas philosophiques :

**1. Cohérence d'écriture.** Quand tu crées une nouvelle commande, tu ne pars pas de zéro. Tu instancies le pattern : qu'est-ce qui rentre (immuable) ? Qu'est-ce qui sort (structuré) ? Qui compile ? Le moule mental est déjà là.

**2. Cohérence de lecture.** Pour Claude qui ouvre la session, comprendre une commande revient à comprendre 3 choses (entrée, compilation, sortie) plutôt que d'apprendre N commandes hétérogènes. Le scaffold passe de zoo à langage.

**3. Cohérence d'évaluation.** Un compilateur a un comportement déterministe attendu. Si on lui donne les mêmes entrées, il produit la même sortie (à la stochasticité du LLM près). Ça rend les commandes **évaluables** : `/eval` peut mesurer si le « compilateur » produit toujours du bon output sur des entrées de référence.

## Anatomie d'une commande conforme au pattern

Toute commande qui suit ce pattern doit pouvoir répondre à 5 questions :

1. **Quelles sont les entrées ?** Fichiers, paramètres, état du store. Si possible, immuables.
2. **Quelle est l'opération de compilation ?** Quelle skill, quel agent, quel raisonnement.
3. **Quelle est la sortie attendue ?** Format imposé, validé par une skill ou un template.
4. **Comment archive-t-on ?** Dans quel store, conforme à ADR-001.
5. **Comment évalue-t-on la sortie ?** Critères vérifiables — code-based + LLM-as-judge.

Une commande qui ne peut pas répondre à ces 5 questions n'est pas conforme. C'est probablement plusieurs commandes mélangées.

## Mapping des commandes actuelles

| Commande | Entrées | Compilateur | Sorties | Store |
|----------|---------|-------------|---------|-------|
| `/audit` | code projet + scope | `@auditor` + skill `<type>-audit` | rapport priorisé | `packs/<pack>/audits/` |
| `/feasibility` | question + contexte | `@architect` + critères | étude comparée | `packs/feasibility/studies/` |
| `/spec` | demande + conventions projet | wizard interactif | spec + prompt plan | `core/specs/` |
| `/eval` | cible + dataset | `@evaluator` + skill `evaluator-optimizer` | verdict + critique | `packs/evals/results/` |
| `/compact` | store actif | skill `knowledge-store` | store réduit + archive | (auto-modifie le store) |
| `/lint` | store | skill `health-check` | rapport de santé | (pas d'écriture) |
| `/update-memory` | commits + état du projet | `@memory-keeper` | memory store à jour | `core/memory/` |
| (skill) `compile-wiki` | `raw/` | LLM-as-compiler direct | `wiki/<entité>.md` | `packs/research/wiki/` |

Aucune commande du scaffold n'échappe au pattern. C'est intentionnel.

## Anti-patterns à reconnaître

- **Commande qui modifie ses propres entrées.** Un compilateur ne touche pas au source. Si une commande modifie `raw/` ou `core/specs/<existant>`, c'est cassé.
- **Sortie au format flou.** Pas de format = pas évaluable = pas mesurable.
- **Compilation cachée dans plusieurs commandes.** Si deux commandes font « presque » la même chose, c'est qu'il manque un paramètre, pas qu'il faut deux commandes.
- **Pas de store pour la sortie.** Une commande qui produit sans archiver ne s'inscrit pas dans la mémoire du projet.

## Lien avec les autres patterns

- **`agent-workflows.md`** : les 5 patterns canoniques (chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer) décrivent **comment** la compilation se fait dans des cas non triviaux.
- **`agent-antipatterns.md`** : ce qu'il faut éviter quand on instancie le pattern (monolithique, over-planned, sans observabilité).
- **ADR-001** : tous les stores de sortie suivent le knowledge-store pattern. Les deux patterns sont compatibles **par conception**.

## Quand créer une nouvelle commande

Avant d'inventer une nouvelle commande, vérifier :

1. **L'opération est-elle déjà une compilation existante avec un paramètre différent ?** Si oui, ajouter le paramètre, pas la commande.
2. **L'opération produit-elle un fichier structuré nouveau ?** Si non, c'est une utility, pas une commande LLM-as-compiler. Mettre dans `scripts/`.
3. **Les 5 questions ci-dessus ont-elles toutes une réponse claire ?** Si non, l'idée n'est pas mûre. Affiner avant d'écrire.

Une nouvelle commande conforme = une instance de plus du pattern, pas un cas particulier de plus à mémoriser.
