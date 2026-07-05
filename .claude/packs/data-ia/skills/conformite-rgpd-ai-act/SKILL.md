---
name: conformite-rgpd-ai-act
description: Check-lists opérationnelles RGPD + AI Act pour projets data/IA — identifier les obligations applicables et les traduire en exigences de spec. Aide à la conformité, pas un avis juridique.
when_to_use: Spec taguée `pii` ; tout traitement de données personnelles ; tout système IA exposé à des utilisateurs européens ; avant un déploiement touchant des personnes.
---

# Skill : conformite-rgpd-ai-act

> ⚠️ Cette skill structure le travail de conformité et prépare les bonnes
> questions. Elle ne remplace pas un juriste/DPO sur les cas non triviaux —
> et le dire fait partie de ses sorties.

## Check-list RGPD (traitement de données personnelles)

- [ ] **Base légale** identifiée et documentée (consentement, contrat, intérêt légitime avec balance documentée...).
- [ ] **Minimisation** : chaque donnée collectée sert la finalité — le « au cas où » est non conforme par construction.
- [ ] **Rétention** définie par donnée, et appliquée (suppression effective, pas juste une politique écrite).
- [ ] **Droits des personnes** exécutables : accès, rectification, effacement, portabilité — avec une procédure qui marche vraiment.
- [ ] **Registre des traitements** à jour (store ADR-001 : finalité, données, base légale, rétention, destinataires).
- [ ] **Sous-traitants** : où vont les données ? Un appel API vers un modèle hors self-hosted EST un transfert — la préférence self-hosted du scaffold est aussi un choix de conformité.
- [ ] **AIPD** (analyse d'impact) si traitement à grande échelle, données sensibles, ou décision automatisée sur des personnes.

## Check-list AI Act (systèmes IA)

1. **Classifier le système** : pratique interdite (manipulation, scoring social...) / haut risque (annexe III : recrutement, crédit, éducation, biométrie...) / risque de transparence (chatbots, contenus générés) / risque minimal.
2. **Selon la classe** :
   - Haut risque → documentation technique (la model card en est la base), gestion des risques, gouvernance des données, supervision humaine, journalisation, robustesse.
   - Transparence → informer que l'utilisateur parle à une IA ; marquer les contenus générés le cas échéant.
   - Minimal → model card volontaire, bonnes pratiques.
3. **Fournisseur vs déployeur** : intégrer un modèle tiers dans un produit fait porter des obligations de déployeur — les identifier.

## Sortie type

Classification argumentée, obligations applicables, et leur traduction en
**exigences de spec** (critères d'acceptation + contraintes négatives) — la
conformité entre dans le circuit normal du scaffold, elle ne vit pas à côté.
Points nécessitant un avis juridique explicitement listés.
