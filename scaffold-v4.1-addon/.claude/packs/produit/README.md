# Pack : produit

Rôles et skills pour le pilotage produit/projet. Activable/désactivable par
suffixe `.disabled` comme tout pack. Les rôles vivent DANS le pack (scoping à
l'activation) — divergence assumée avec `.claude/roles/` qui héberge les rôles
métier par défaut du scaffold.

| Élément | Type | Couvre |
|---|---|---|
| `roles/product-owner.md` | rôle | Product Owner |
| `roles/chef-de-projet.md` | rôle | chef de projet web, directeur stratégie digitale |
| `skills/priorisation/` | skill | RICE, MoSCoW, arbitrage backlog |
| `skills/user-stories/` | skill | découpage, critères INVEST, definition of done |

## Principe

Un rôle sans skill est un costume. La valeur est dans les procédures : les rôles
chargent les skills du pack, qui elles portent les méthodes. Besoin d'un rôle
plus niche (designer transport, etc.) : `/create-role`, c'est son travail.

## Raccords scaffold

- La priorisation produit alimente le « Pourquoi maintenant » des specs (/spec Q3).
- Les user-stories bien découpées sont des candidates directes au plan de chunks.
