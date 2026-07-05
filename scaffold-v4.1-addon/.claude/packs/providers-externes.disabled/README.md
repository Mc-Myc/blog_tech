# Pack : providers-externes (DÉSACTIVÉ par défaut)

Extension du dispatch (ADR-006) vers des modèles hors-Claude : locaux
(Mistral/Qwen/DeepSeek via Ollama/vLLM, API OpenAI-compatible) et/ou ChatGPT.

**Rien dans le scaffold ne dépend de ce pack.** L'échelle Claude-native couvre
le chemin nominal. Activer ce pack seulement avec un besoin concret (coût sur
très gros volume, confidentialité stricte on-premise, comparaison croisée).

## Pour activer (le jour venu)

1. Renommer le dossier sans `.disabled`.
2. Étendre `core/config/models.yaml` : un niveau `local-volume` (endpoint, modèle,
   fallback → `mecanique`) — le fallback remonte TOUJOURS vers l'échelle Claude.
3. Câbler le pont d'invocation : Claude Code ne route pas nativement hors-Claude ;
   le pont est un appel Bash vers l'endpoint local OpenAI-compatible, ou un MCP.
   C'est le vrai travail de ce pack — non construit tant qu'il n'y a pas de besoin.
4. Documenter par ADR (007+) : quel provider, pour quelles tâches, avec quelles evals.

## Garde-fou

Un provider externe entre dans le dispatch aux mêmes conditions que les modèles
Claude : tâches où il est expert, evals à l'appui (`/eval`), fallback journalisé.
Pas de routing au feeling.
