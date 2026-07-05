# Pack : data-ia

Rôles et skills pour la donnée et l'IA. Couvre les casquettes ingénieur IA,
data engineer / data miner, CDO, développeur data IA, responsable éthique IA.

| Élément | Type | Couvre |
|---|---|---|
| `roles/ingenieur-ia.md` | rôle | ingénieur IA, dev data IA |
| `roles/data-engineer.md` | rôle | data engineer, data miner, gouvernance (CDO) |
| `roles/ethique-ia.md` | rôle | responsable éthique IA |
| `skills/qualite-donnees/` | skill | profilage, validation, contrats de données |
| `skills/model-cards/` | skill | documentation de modèles et systèmes IA |
| `skills/conformite-rgpd-ai-act/` | skill | check-lists RGPD + AI Act pour projets data/IA |

## Raccords scaffold

- Le rôle `ethique-ia` fournit un **axe d'attaque supplémentaire à `@critic`** (biais, usage détourné, conformité) — il s'invoque en complément sur les specs taguées `pii` ou touchant un système IA.
- Le tag `pii` (Signal E, mythos-triggers) déclenche la skill `conformite-rgpd-ai-act` en pré-vol de /run-spec.
- Cohérence avec la préférence self-hosted du scaffold : les skills privilégient les traitements locaux (cf. ADR-002).
