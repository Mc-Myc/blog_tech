#!/usr/bin/env bash
# merge.sh — applique les patches manuels de l'add-on v4 sur un scaffold existant.
# Idempotent : relançable sans dupliquer. À lancer DEPUIS la racine du scaffold,
# APRÈS avoir dézippé l'add-on (unzip -o scaffold-v4-addon.zip).
set -euo pipefail

err=0
note() { printf '  %s\n' "$1"; }
fail() { printf 'ERREUR : %s\n' "$1"; err=1; }

echo "== 1/4 Prérequis (dépendances du scaffold de base) =="
for f in \
  "CLAUDE.md" \
  ".claude/agents/README.md" \
  ".claude/skills/README.md" \
  ".claude/agents/architect.md" \
  ".claude/agents/auditor.md" \
  ".claude/skills/knowledge-store/SKILL.md" \
  ".claude/commands/compact.md" \
  ".claude/core/memory/lessons-learned.md" \
  ".claude/core/memory/recall-misses.md"
do
  [ -e "$f" ] && note "OK  $f" || fail "manquant : $f"
done
if [ "$err" -ne 0 ]; then
  echo "Scaffold de base incomplet — corriger avant de merger (échec bruyant > échec silencieux)."
  exit 1
fi

echo "== 2/4 Patch CLAUDE.md (append si absent) =="
# v4.1 : purge de l'ancien bloc 3 tiers (v4) s'il existe, avant d'écrire le bloc 4 niveaux
if grep -q "Routing modèle (ADR-004)" CLAUDE.md; then
  python3 - << 'PYCLEAN'
s = open("CLAUDE.md").read()
start = s.find("## Routing modèle (ADR-004)")
if start != -1:
    nxt = s.find("\n## ", start + 5)
    s = s[:start] + (s[nxt+1:] if nxt != -1 else "")
    open("CLAUDE.md", "w").write(s)
PYCLEAN
  note "ancien bloc routing v4 retiré"
fi
if ! grep -q "Routing modèle (ADR-006)" CLAUDE.md; then
cat >> CLAUDE.md << 'EOF'

## Routing modèle (ADR-006)

| Niveau | Modèle | Expert de |
|---|---|---|
| mecanique | Haiku 4.5 | volume, mécanique : extraction, formatage, checks |
| courant | Sonnet 5 | dev courant, interactif, wizards, gates @evaluator |
| jugement | Opus 4.8 | conception, jugement, @architect/@auditor/@critic — défaut |
| escalade | Fable 5 | signaux A-E uniquement, jamais par défaut, jamais interactif |

> Sources de vérité : `core/config/models.yaml` (opérationnel), ADR-006 (politique),
> `mythos-triggers.md` (signaux d'escalade). Ne pas dupliquer la règle ici.
EOF
note "bloc routing 4 niveaux ajouté"
else note "bloc routing 4 niveaux déjà présent"; fi

if ! grep -q "/run-spec" CLAUDE.md; then
cat >> CLAUDE.md << 'EOF'

## Slash commands ajoutées (add-on v4)
- `/spec [titre]` — Wizard spec-first v2 (routing pré-calculé, leçons, dataset généré)
- `/eval <cible>` — Eval suite (méthode Husain) + journalisation auto
- `/lint <chemin>` — Health-check d'un knowledge store + journalisation auto
- `/run-spec <id> [--batch] [--checkpoint N]` — Orchestrateur d'exécution (ADR-005)
- `/debrief` — Consolidation de fin de session (3 questions)

## Sous-agents ajoutés (add-on v4)
- `@evaluator` — Juge une sortie contre des critères, verdict binaire + critique
- `@critic` — Red-team sans critères prédéfinis (hypothèses implicites, cas limites)
EOF
note "commandes/agents ajoutés"
else note "commandes déjà référencées"; fi

echo "== 3/4 Patch agents (section chain-of-thought → skill partagée) =="
python3 << 'PYEOF'
import io, sys
section = """
## Discipline de raisonnement (chain-of-thought)

Charge la skill `reasoning-discipline` et applique la variante de ton rôle
(2-3 angles, passe sous chacun, tranche en justifiant). Passe interne par
défaut — voir la skill pour les règles complètes.
"""
for path in [".claude/agents/architect.md", ".claude/agents/auditor.md"]:
    s = open(path).read()
    if "reasoning-discipline" in s:
        print(f"  déjà patché : {path}"); continue
    if "## Discipline de raisonnement" in s:
        # ancienne section v3 verbeuse -> remplacer jusqu'au prochain titre
        start = s.find("## Discipline de raisonnement")
        nxt = s.find("\n## ", start + 5)
        s = s[:start] + section.strip() + "\n\n" + (s[nxt+1:] if nxt != -1 else "")
    else:
        anchor = "## Règles intangibles"
        if anchor in s:
            s = s.replace(anchor, section.strip() + "\n\n" + anchor, 1)
        else:
            s = s.rstrip() + "\n" + section
    open(path, "w").write(s)
    print(f"  patché : {path}")
PYEOF

echo "== patch frontmatter model: des agents du scaffold de base =="
python3 << 'PYMODEL'
for path, model in [(".claude/agents/architect.md", "claude-opus-4-8"),
                    (".claude/agents/auditor.md", "claude-opus-4-8")]:
    s = open(path).read()
    parts = s.split("---")
    if len(parts) >= 3 and "model:" not in parts[1]:
        parts[1] = parts[1].rstrip("\n") + "\nmodel: " + model + "   # niveau ADR-006 — source: core/config/models.yaml\n"
        open(path, "w").write("---".join(parts))
        print(f"  model ajouté : {path}")
    else:
        print(f"  déjà présent ou pas de frontmatter : {path}")
PYMODEL

echo "== patch tables agents/skills README =="
grep -q "evaluator" .claude/agents/README.md || cat >> .claude/agents/README.md << 'EOF'
| `evaluator` | Juge sorties contre critères, pattern evaluator-optimizer | /eval, validation d'ADR/audit/spec avant acceptation |
EOF
grep -q "critic" .claude/agents/README.md || cat >> .claude/agents/README.md << 'EOF'
| `critic` | Red-team sans critères prédéfinis — hypothèses implicites, cas limites | specs enjeu critique, ADRs avant acceptation |
EOF
grep -q "evaluator-optimizer" .claude/skills/README.md || cat >> .claude/skills/README.md << 'EOF'
| `evaluator-optimizer` | Boucle générer→évaluer→raffiner (pattern Anthropic) | @evaluator + producteur |
| `compile-wiki` | Compilation raw/ → wiki/ (pattern Karpathy) | packs/research/ |
| `health-check` | Diagnostic santé d'un knowledge store | /lint |
| `reasoning-discipline` | Chain-of-thought partagé des agents | @architect, @auditor, @evaluator, @critic |
| `voting` | 3 passes isolées, détection Signal B | décisions à durcir |
| `pre-mortem` | Projection d'échec, obligatoire sur enjeu critique | /spec, Signal D |
| `distill-lessons` | Consolidation des leçons, promotion validée | learning-loop |
| `model-dispatch` | Résolution tâche → niveau → modèle + fallback journalisé | /run-spec, ADR-006 |
EOF
note "tables mises à jour"

echo "== 4/4 Vérification =="
v() { printf '  %-58s %s\n' "$1" "$2"; }
v "commandes .claude/commands/"        "$(ls .claude/commands/*.md 2>/dev/null | wc -l) fichiers"
v "skills .claude/skills/"             "$(ls -d .claude/skills/*/ 2>/dev/null | wc -l) dossiers"
v "agents .md"                         "$(ls .claude/agents/*.md 2>/dev/null | grep -vc README || true)"
v "ADRs"                               "$(ls .claude/core/architecture/decisions/adr-*.md 2>/dev/null | wc -l)"
v "agents chargeant reasoning-discipline" "$(grep -l 'reasoning-discipline' .claude/agents/*.md 2>/dev/null | wc -l) (attendu : 4)"
v "INDEX datasets"                     "$([ -f .claude/packs/evals/datasets/INDEX.md ] && echo OK || echo MANQUANT)"
v "INDEX results"                      "$([ -f .claude/packs/evals/results/INDEX.md ] && echo OK || echo MANQUANT)"
v "store escalations"                  "$([ -f .claude/core/memory/escalations.md ] && echo OK || echo MANQUANT)"
v "registre models.yaml"                "$([ -f .claude/core/config/models.yaml ] && echo OK || echo MANQUANT)"
v "ADR-006"                            "$([ -f .claude/core/architecture/decisions/adr-006-model-ladder-and-dispatch.md ] && echo OK || echo MANQUANT)"
v "agents avec model: (frontmatter)"   "$(grep -l '^model:' .claude/agents/*.md 2>/dev/null | wc -l) (attendu : 4)"
v "packs métier"                       "$(ls -d .claude/packs/{produit,marketing,data-ia,3d} 2>/dev/null | wc -l)/4"
echo "Merge terminé. Suggestion : /lint core/architecture/decisions pour valider, puis /spec pour tester le wizard v2."
