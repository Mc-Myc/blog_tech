---
name: knowledge-store
description: Conventions des stores de connaissance (INDEX, entrées datées, tags) — à charger avant d'écrire dans core/memory/ ou packs/.
---

# Skill : knowledge-store

Conventions communes à tous les stores markdown du scaffold.

## Structure d'un store

- Un dossier = un store ; `INDEX.md` obligatoire à la racine (une ligne par entrée).
- Une entrée = un bloc daté : `## AAAA-MM-JJ — titre court` + corps + `tags:`.
- Les entrées automatiques sont préfixées `[auto]` dans le titre.

## Règles

1. Toute écriture passe par l'INDEX : ajouter la ligne au même commit.
2. Jamais de suppression silencieuse — barrer (`~~…~~`) avec raison et date.
3. Les références croisées utilisent le chemin relatif du store.
4. À ~15 entrées non consolidées : lancer `distill-lessons` (ou `/compact`).
