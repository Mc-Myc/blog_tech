# ADR-006 : Échelle de modèles Claude à 4 niveaux + dispatch par tâche

- **Date** : 2026-07-04
- **Statut** : Accepté
- **Décideurs** : Marcel
- **Contexte technique** : routing opérationnel des modèles, orchestration /run-spec
- **ADRs liées** : ADR-004 (politique de routing — partiellement supersédée), ADR-005 (modes d'exécution)

## Contexte

ADR-004 a posé la politique (3 critères → 3 tiers) mais pas la mécanique : rien
ne dit *comment* un chunk atterrit sur un modèle précis. Par ailleurs son tier
« Volume » reposait sur des modèles locaux que Claude Code ne route pas
nativement — un pont à câbler qui n'a jamais été construit.

Constat d'usage : le travail se fait avec Claude. Claude Code route nativement
par modèle (frontmatter `model:` des agents, modèle par invocation). Et la gamme
Claude couvre elle-même tout le spectre volume → escalade. Principe retenu :
**on ne prend pas un architecte pour construire une cabane** — chaque modèle a
les tâches où il est expert.

## Décision

### 1. Échelle Claude-native à 4 niveaux (remplace les 3 tiers d'ADR-004)

| Niveau | Modèle (vérifié 2026-07-03) | Expert de |
|---|---|---|
| **mecanique** | Haiku 4.5 | volume, rapide, mécanique : extraction, classification, formatage, checks |
| **courant** | Sonnet 5 | courant, interactif : chunks standards, wizards, premiers jets |
| **jugement** | Opus 4.8 | complexe, jugement : @architect/@auditor/@critic, specs, chunks difficiles |
| **escalade** | Fable 5 | signaux A-E de mythos-triggers uniquement — inchangé depuis ADR-004 |

Ce qu'ADR-004 garde : les 3 critères d'évaluation (complexité × latence × coût),
les signaux A-E et toute la discipline d'escalade (mythos-triggers reste la
source de vérité du niveau `escalade`). Ce qui est supersédé : la table des
tiers (Volume/local disparaît du chemin nominal, l'échelle passe à 4 niveaux
Claude).

### 2. Source de vérité opérationnelle : `core/config/models.yaml`

IDs de modèles, chaînes de fallback, affectation des agents. Les documents
(CLAUDE.md, agents, commands) référencent des **niveaux** (`jugement`), jamais
des IDs — un changement de modèle = une ligne dans models.yaml.

### 3. Granularité tâche : `tier:` par chunk

Le tier de la spec (frontmatter, pré-calculé par /spec) est le défaut ; chaque
chunk peut l'overrider (`tier: mecanique` sur un chunk d'extraction dans une
spec `jugement`). La skill `model-dispatch` résout : chunk → tier → modèle.

### 4. Fallback en cascade, journalisé

`escalade → jugement → courant`. Deux déclencheurs : indisponibilité, et — 
spécifique à Fable 5 — refus par classifieur (`stop_reason: refusal`), que l'API
gère en retombant sur Opus ; notre chaîne formalise le même comportement.
Chaque fallback = une ligne dans `core/memory/escalations.md` (le journal de
calibration existant). Un fallback silencieux est un bug.

### 5. Affectation des agents

architect / auditor / critic → `jugement` (l'économie de Sonnet ne vaut pas une
mauvaise décision structurante). evaluator → `courant` (les gates de /run-spec
sont fréquentes ; escalade automatique vers `jugement` quand la spec est
`enjeu: eleve|critique`). memory-keeper → `mecanique`.

### 6. Hors-Claude = pack d'extension

Modèles locaux (Mistral/Qwen/DeepSeek) et ChatGPT : pack `providers-externes`,
**désactivé par défaut**. La structure les accueille (pont d'invocation à câbler
le jour venu), rien n'en dépend.

## Points de calibration

- **Sonnet 5 est sorti le 2026-06-30** — 4 jours avant cette ADR. Le niveau `courant` est à valider sur les tâches réelles ; en cas de déception, repli documenté : `claude-sonnet-4-6` (une ligne dans models.yaml).
- L'affectation `evaluator → courant` se calibre avec le journal des evals : si le judge Sonnet diverge du jugement humain plus que le judge Opus (visible via le shadowing Husain), remonter evaluator à `jugement`.
- Bilan à 10-15 entrées d'escalations.md, comme prévu par ADR-005.

## Conséquences

**Positives** : dispatch enfin mécanique et pas seulement politique ; coût maîtrisé
(le mécanique ne paie plus le prix du jugement) ; un seul fichier à toucher quand
la gamme évolue ; zéro pont exotique à maintenir.

**Négatives / risques** : dépendance mono-fournisseur assumée (mitigée par le pack
d'extension) ; Sonnet 5 très récent (repli documenté) ; une échelle à 4 niveaux
demande la discipline de descendre les tâches simples — le réflexe « tout sur
Opus » annule le bénéfice.

## Réversibilité

Totale : models.yaml éditable à tout moment ; supprimer les `tier:` de chunks
redonne le comportement v4 ; ADR-004 reste la référence de la politique d'escalade.
