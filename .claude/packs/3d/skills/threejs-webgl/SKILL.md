---
name: threejs-webgl
description: Fondamentaux et conventions Three.js pour la 3D web temps réel — structure de scène, boucle de rendu, matériaux, caméras, interactions.
when_to_use: Tout développement Three.js/WebGL — visualisation de données, configurateur produit, expérience immersive, outil interactif 3D.
---

# Skill : threejs-webgl

## Structure de base non négociable

- **Scene / Camera / Renderer** séparés du code métier. La scène est un graphe : penser en groupes (`Group`) dès le départ, pas en objets plats.
- **Boucle de rendu** : `renderer.setAnimationLoop` (compatible WebXR) ; toute animation basée sur le **delta time** (`clock.getDelta()`), jamais sur le compte de frames.
- **Redimensionnement** : gérer `resize` (camera.aspect + updateProjectionMatrix + renderer.setSize) dès le squelette — l'oublier est le bug n°1 des démos.
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` : au-delà de 2, coût quadratique pour un gain invisible.

## Choix par défaut raisonnables

| Sujet | Défaut | Quand dévier |
|---|---|---|
| Matériau | `MeshStandardMaterial` (PBR) | `MeshBasicMaterial` si pas d'éclairage (data viz), matériaux custom/shader si besoin précis |
| Lumières | 1 directionnelle + 1 ambiante/hémisphère | HDRI (`RGBELoader` + environment) pour du réalisme produit |
| Caméra | `PerspectiveCamera` + `OrbitControls` (avec damping) | Orthographique pour la data viz / les vues techniques |
| Couleurs | `outputColorSpace = SRGBColorSpace`, tone mapping ACES | — |
| Interaction | `Raycaster` sur pointer events | GPU picking si milliers d'objets cliquables |

## Hygiène mémoire

Three.js ne libère rien tout seul : à la destruction d'un objet, `geometry.dispose()`,
`material.dispose()`, `texture.dispose()`. Dans un SPA (React/Vue), le cleanup du
composant EST le endroit du dispose — sinon fuite garantie à chaque navigation.

## Règles

- Réutiliser géométries et matériaux partagés (une seule instance pour N meshes identiques) — prérequis de l'instancing (skill `optimisation-scenes`).
- Charger via `GLTFLoader` + Draco/Meshopt (skill `pipeline-assets`) ; les autres formats se convertissent en amont, pas au runtime.
- Prototyper la scène AVANT de brancher le métier : une scène qui tourne à vide à 60fps est le point de départ, pas l'objectif.
