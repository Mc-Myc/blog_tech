---
name: distill-lessons
description: >
  Consolidation périodique de lessons-learned.md : détecte les récurrences,
  compile les leçons brutes en règles actionnables, propose les promotions
  (seuil : 3 occurrences du même pattern). Variante du pattern LLM-as-compiler
  appliquée au journal de leçons. Ne modifie jamais les agents lui-même.
when_to_use: >
  Tous les 15+ nouvelles entrées dans lessons-learned.md, ou avant de démarrer
  un gros projet (pour charger les règles à jour), ou sur demande.
---

# Skill : distill-lessons

## Principe

Vingt leçons brutes en vrac ne servent à rien — même problème que raw/ vs wiki/,
même solution : une couche brute immuable (le journal), une couche compilée
(les règles). La détection de **récurrence** est le cœur : une leçon isolée est
du bruit ; trois leçons qui disent la même chose sont une règle candidate.

## Procédure

### 1. Lire le journal
`core/memory/lessons-learned.md` en entier. Séparer :
- entrées `[auto]` (journalisées par /eval, /lint, /run-spec) ;
- entrées `[manuel]` (issues de /debrief) ;
- entrées déjà marquées `[distillée → règle NNN]` (à ignorer).

### 2. Regrouper par pattern
Regrouper les entrées qui décrivent le **même phénomène** sous des formulations
différentes (même lib qui pose problème, même type de critère qui FAIL, même
étape de wizard qui coince). C'est un jugement sémantique, pas un grep de mots-clés.

### 3. Classer chaque groupe
- **1-2 occurrences** → reste au journal, rien à faire.
- **3+ occurrences** → **candidate à promotion**. Formuler la règle en une phrase
  actionnable + sa destination :

| La règle concerne... | Destination proposée |
|---|---|
| une pratique projet (« ne pas utiliser X ») | suggestion permanente en contraintes négatives (/spec question 7) |
| le comportement d'un agent | patch du fichier agent — **validation + /eval obligatoires avant merge** |
| un critère qui FAIL souvent | cas de test ajouté au dataset de la cible (flywheel Husain) |
| le scaffold lui-même (tag `scaffold`) | remontée vers le repo scaffold, via ADR si structurant |

### 4. Restituer et attendre
Rapport : règles candidates, occurrences à l'appui, destination proposée pour
chacune. Puis UNE question : lesquelles promouvoir ? **Aucune promotion sans
validation** — capture automatique, promotion validée (learning-loop).

### 5. Appliquer les promotions validées
- Écrire la règle à sa destination.
- Marquer les entrées sources `[distillée → <destination>]` dans le journal (append d'un marqueur, pas de suppression — le journal reste append-only).
- Si la destination est un agent : rappeler la convention — `/eval <agent>` avant merge, c'est le test de non-régression du processus d'apprentissage lui-même.

## Garde-fous

- **Jamais de modification d'agent en direct.** La skill propose, l'utilisateur valide, l'eval verrouille.
- **Pas de sur-distillation.** Promouvoir une leçon vue une fois « parce qu'elle semble importante » = inférence, pas apprentissage. Le seuil de 3 est la règle ; l'utilisateur peut l'outrepasser explicitement, pas la skill.
- **Le journal est la source de vérité.** Les règles compilées peuvent être régénérées depuis le journal ; l'inverse est faux.

## Lien avec le reste

- Aval de la capture write-ahead (ADR-005) et de /debrief.
- Amont de /spec (les règles promues nourrissent la question 7) et des datasets d'eval.
- Même posture que compile-wiki : LLM-as-compiler, sources immuables, output régénérable.
