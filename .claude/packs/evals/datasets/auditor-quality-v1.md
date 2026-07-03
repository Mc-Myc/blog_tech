# Dataset : auditor-quality-v1

- **Cible** : `@auditor` (toutes skills d'audit)
- **Version** : v1
- **Date** : 2026-05-29
- **Auteur** : Marcel
- **Statut** : exemple de départ — à enrichir avec des cas réels

## Contexte

Premier dataset pour `@auditor`. Construit avant toute analyse d'erreurs réelle (voir `error-analysis/` pour la méthode propre). Les critères ci-dessous sont les hypothèses initiales — à valider/corriger par une analyse d'erreurs sur les 20-50 premiers rapports d'audit réels.

## Critères

### Code-based (vérifiables par script)

- [ ] **C1** — Le rapport contient une section `## Synthèse` non vide.
- [ ] **C2** — Les findings sont classés en buckets de criticité visibles : `🔴 Critique`, `🟠 Élevé`, `🟡 Moyen`, `🟢 Faible`.
- [ ] **C3** — Chaque finding référence une localisation (`fichier:ligne`, ou chemin de module).
- [ ] **C4** — Chaque finding a une recommandation explicite (présence d'un `→` ou d'une formulation impérative).
- [ ] **C5** — Le rapport est archivé dans le bon pack (`packs/security/audits/`, `packs/quality/audits/`…) avec nommage `<YYYY-MM-DD>-<type>.md`.
- [ ] **C6** — Le rapport ne dépasse pas 4000 tokens (la synthèse doit être concise).

### LLM-as-judge (vérifiables par `@evaluator`)

- [ ] **J1** — La **priorisation** est cohérente avec l'impact réel décrit (un finding 🔴 décrit un risque exploitable, pas un détail cosmétique).
- [ ] **J2** — Chaque recommandation est **actionnable** : un développeur peut l'exécuter sans nouvelle clarification. Pas de « envisager d'améliorer la sécurité ».
- [ ] **J3** — Le rapport reste dans le **périmètre de la skill** invoquée (un `/audit security` ne dérive pas vers de la performance).
- [ ] **J4** — Les **quick wins** (< 1h) sont explicitement mis en évidence (Husain : « ce qui est visible est ce qui est traité »).
- [ ] **J5** — Aucun finding inventé ou non étayé. Tout finding doit pouvoir être vérifié par lecture du fichier référencé.

## Cas de test

### Cas 1 : audit sécurité sur un module d'auth

- **Entrée** : `/audit security src/auth/`
- **Pré-requis** : avoir au moins un fichier d'auth dans le projet.
- **Critères évalués** : tous (C1-C6 + J1-J5)
- **Critique de référence (PASS attendu)** :
  > Le rapport identifie 2 findings 🔴 (token JWT sans vérification d'expiration, mot de passe stocké en clair dans les logs), 3 🟠, et 4 🟡. Tous les findings référencent une ligne précise. Les recommandations sont concrètes (« remplacer `jwt.decode` par `jwt.verify` avec option `expiresIn` »). Quick wins listés : ajouter `httpOnly` aux cookies (5 min), masquer les mots de passe dans le formatter de logs (10 min).

### Cas 2 : audit performance sur un endpoint connu lent

- **Entrée** : `/audit performance src/api/search.py` (ou équivalent stack)
- **Critères évalués** : tous, avec accent sur J4 (mesures avant optim).
- **Critique de référence (PASS attendu)** :
  > Le rapport commence par les **mesures de référence** (p50, p95 actuels). Il identifie 1 finding 🔴 (requête N+1 sur la jointure produit/catégorie), 2 🟠 (index manquant, pas de cache). Chaque finding propose une action concrète (« ajouter `select_related('categorie')` ligne 47 »). Aucune optimisation suggérée sans donnée associée.

### Cas 3 : audit sur un scope sans problème évident

- **Entrée** : `/audit code-quality src/utils/` (utilitaires simples)
- **Critères évalués** : J5 (pas d'invention) prioritairement.
- **Critique de référence (PASS attendu)** :
  > Le rapport est court (< 1000 tokens), conclut « aucun finding critique, 2 améliorations mineures », et n'invente pas de problèmes pour justifier sa propre existence. C'est un audit qui dit « tout va bien » avec honnêteté.

### Cas 4 : audit dont le scope dérive (test J3)

- **Entrée** : `/audit security src/api/` avec un fichier qui contient aussi des soucis de perf.
- **Critère évalué** : J3 — le rapport doit **rester sécurité** et **renvoyer vers `/audit performance`** pour les soucis de perf, pas les mélanger.
- **Critique de référence (PASS attendu)** :
  > Le rapport traite uniquement la sécurité. Il mentionne en `## Notes` : « Plusieurs requêtes N+1 observées en lecture du code — hors périmètre sécu, pertinent pour un audit perf ». Pas de finding perf dans les buckets.

### Cas 5 : audit qui ne devrait pas avoir de finding critique (test J1)

- **Entrée** : `/audit security` sur un code propre.
- **Critère évalué** : J1 — pas de finding 🔴 forcé.
- **Critique de référence (PASS attendu)** :
  > Aucun finding 🔴. Quelques 🟡 et 🟢. Le rapport ne gonfle pas la criticité pour justifier son intérêt.

## Notes

- Ce dataset est délibérément **petit** (5 cas) pour démarrer. À enrichir au fur et à mesure des audits réels.
- Quand un cas réel révèle un mode d'échec non couvert → ajouter un cas correspondant (en v2).
- Pass rate cible pour ce dataset : entre 60 et 85%. Si trop haut, durcir. Si trop bas, le problème est probablement dans la skill `security-audit` ou dans le prompt de `@auditor`.

## Suite

- [ ] Lancer `/eval auditor` une première fois pour calibrer.
- [ ] Faire une analyse d'erreurs sur les 20 premiers vrais audits → produire un v2 basé sur les modes d'échec observés.
