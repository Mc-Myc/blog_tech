# ADR-002 : Mémoire vectorielle — décision différée

- **Date** : 2026-05-28 (mise à jour 2026-05-29 : précision sur l'implémentation cible)
- **Statut** : Accepté (décision = différer)
- **Décideurs** : Marcel
- **Contexte technique** : architecture de la mémoire projet, scalabilité long terme

## Contexte

La question d'ajouter une mémoire vectorielle (MCP server avec base d'embeddings type Qdrant/Chroma, recall associatif `query → top-k chunks`) s'est posée pour permettre une mémoire « illimitée » au-delà de la fenêtre de contexte du LLM. Le besoin est réel à long terme mais pas immédiat.

Trois constats président à la décision :
1. Le pattern Knowledge Store défini en ADR-001 absorbe 80% du besoin pratique pour un volume modéré (recherche déterministe sur INDEX, lecture à la demande des items).
2. Sans modèle d'embeddings local (contrainte assumée), une implémentation vectorielle imposerait un appel cloud par chunk indexé — contradiction avec la préférence self-hosted, et coût récurrent non négligeable au scaling.
3. Le retrieval vectoriel introduit une **erreur silencieuse** (faux négatif : le bon chunk existe mais n'est pas remonté), difficile à diagnostiquer sans observabilité dédiée. À petit volume, c'est un risque sans contrepartie.

## Options considérées

### Option A : implémenter maintenant
- Pour : scalabilité prête, recall associatif disponible immédiatement.
- Contre : complexité prématurée, dépendance cloud ou modèle local, erreur silencieuse non observable.

### Option B : ne jamais implémenter
- Pour : simplicité maximale.
- Contre : à 18-24 mois, le grep sur INDEX ne suffira plus.

### Option C : différer, avec critère de réouverture défini
- Pour : on évite la complexité prématurée tout en gardant l'option ouverte. Le critère explicite empêche le report indéfini.
- Contre : un futur arbitrage à faire ; risque mineur de devoir reconstruire des INDEX si la structure des items évolue d'ici là.

## Décision

Adoption de l'**Option C** : la mémoire vectorielle n'est pas implémentée dans cette itération du scaffold. La décision sera réouverte explicitement quand **au moins un** des critères suivants sera atteint :

1. **Volume** : plus de 30 fichiers d'archive mensuelle cumulés (toutes catégories confondues : decisions, memory, audits, studies, post-mortems, specs).
2. **Friction** : trois occurrences documentées de recherche infructueuse par `grep` sur les INDEX (compteur dans `core/memory/recall-misses.md`).
3. **Cross-projet** : besoin avéré de retrouver des leçons partagées entre plusieurs projets de Marcel.

## Implémentation cible quand la décision sera rouverte

Quand l'un des critères de réouverture est atteint, l'implémentation par défaut sera :

- **qmd** (Tobi Lutke, Shopify) — moteur de recherche local pour fichiers markdown, recherche hybride BM25 + vectoriel + LLM re-ranking, entièrement on-device. CLI (pour invocation depuis bash) + serveur MCP (pour intégration native avec Claude). Embeddings via `node-llama-cpp`.
- **Pourquoi qmd** : self-hosted strict, hybride (les approches purement vectorielles ratent souvent les requêtes lexicales évidentes), interface MCP native, conçu spécifiquement pour le cas d'usage « base markdown ». Ces propriétés collent à nos contraintes.
- **Alternative** : si qmd est abandonné ou inadapté au moment de la réouverture, sélectionner un équivalent respectant les mêmes propriétés (self-hosted, hybride BM25+vecteur, interface MCP).
- **Embeddings model** : modèle ouvert local (nomic-embed-text ou équivalent au moment de la réouverture). Pas de dépendance cloud (OpenAI embeddings, Voyage, etc.).

Cette précision évite, le jour de la réouverture, de re-passer deux jours à comparer toutes les options du marché. La grille de sélection est posée maintenant.

## Justification

Différer est rarement neutre, mais ici les coûts de l'implémentation prématurée dépassent ses bénéfices : on paierait dès maintenant pour résoudre un problème qu'on n'a pas encore. Le pattern Knowledge Store (ADR-001) est compatible avec un passage ultérieur — les items individuels deviendront des chunks indexables, les INDEX serviront de filtres de premier niveau. Aucun travail ne sera perdu.

Le critère de réouverture est posé pour éviter le piège classique : « on verra plus tard » qui ne revient jamais sur la table. Trois déclencheurs, vérifiables, suffisent pour rouvrir le dossier.

## Conséquences

**Positives**
- Zéro infra supplémentaire à maintenir court terme.
- Pas d'erreur de retrieval silencieuse à diagnostiquer.
- Auditabilité maximale : tout est en clair, grep-able, versionné Git.
- Implémentation cible déjà identifiée (qmd) — décision préparée.

**Négatives**
- Recall associatif inexistant : il faut savoir ce qu'on cherche pour le trouver.
- Recherche cross-fichiers reste manuelle (grep + lecture).
- À horizon 12-24 mois, le pattern actuel atteindra ses limites — réouverture probable.

**Neutres**
- qmd peut être obsolète/abandonné au moment de la réouverture. L'inscription est « qmd ou équivalent au moment de la réouverture », pas un engagement aveugle.

## Plan d'implémentation

- [x] ADR rédigée et acceptée
- [x] Fichier `core/memory/recall-misses.md` créé pour compter les frictions
- [x] Implémentation cible (qmd) inscrite — gain de 2 jours d'arbitrage au moment de la réouverture
- [ ] Revoir cette ADR au prochain anniversaire du scaffold, ou dès qu'un critère de réouverture est atteint

## Suivi

- À ré-évaluer si : critère 1, 2 ou 3 ci-dessus atteint.
- ADRs liées : ADR-001 (knowledge-store-pattern), ADR-003 (patterns praticiens).
