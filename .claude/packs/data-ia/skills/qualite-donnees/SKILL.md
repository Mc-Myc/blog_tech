---
name: qualite-donnees
description: Profilage, validation et contrats de données — la qualité se contrôle à l'ingestion, pas dans le dashboard.
when_to_use: Nouvelle source de données ; pipeline qui produit des résultats douteux ; avant d'entraîner/évaluer sur un dataset ; mise en place d'un contrat entre deux systèmes.
---

# Skill : qualite-donnees

## Les 6 dimensions à vérifier

1. **Complétude** — taux de nulls par colonne ; les nulls sont-ils légitimes ou des trous ?
2. **Validité** — chaque valeur respecte son type, format, domaine (email valide, date plausible, enum fermée).
3. **Unicité** — doublons exacts ET quasi-doublons (même entité, graphies différentes).
4. **Cohérence** — les invariants inter-colonnes tiennent (date_fin ≥ date_debut, total = somme des lignes).
5. **Fraîcheur** — la donnée arrive dans les délais attendus ; détection de sources qui se sont tues.
6. **Représentativité** (pour l'IA) — la distribution couvre-t-elle les cas que le système servira ? Biais d'échantillonnage ?

## Procédure

1. **Profiler d'abord, à la main** : 30 minutes sur un échantillon (distributions, valeurs extrêmes, nulls, exemples réels) avant toute industrialisation — même posture que l'analyse d'erreurs Husain, et pour la même raison.
2. **Écrire le contrat** : schéma versionné (types, contraintes, invariants) à la frontière du flux. Le contrat est un knowledge store : INDEX, versions, jamais modifié en place.
3. **Valider à l'ingestion** : chaque lot passe le contrat. Rejet ou quarantaine explicite — jamais d'insertion silencieuse de données invalides.
4. **Monitorer les dérives** : les 6 dimensions en continu sur les flux critiques ; une distribution qui bouge est un signal, pas un détail.

## Règles

- Une règle de qualité sans action définie en cas d'échec (rejet ? alerte ? quarantaine ?) est décorative.
- Auto-hébergeable de bout en bout (profilage pandas/DuckDB, validation type Great Expectations/pandera) — cohérent avec la préférence self-hosted du scaffold.
- Les échecs de validation récurrents sont des leçons : journaliser, distiller, corriger à la source.
