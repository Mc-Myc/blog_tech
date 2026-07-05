---
name: optimisation-scenes
description: Diagnostic et optimisation de performances d'une scène Three.js — mesurer d'abord (draw calls, tris, VRAM), optimiser le vrai goulot ensuite.
when_to_use: Scène qui rame ; préparation mobile ; scène qui grossit (data viz volumineuse, configurateur riche) ; budget de perf à tenir.
---

# Skill : optimisation-scenes

## Mesurer AVANT d'optimiser

`renderer.info` est le point de départ : `render.calls` (draw calls),
`render.triangles`, `memory.geometries/textures`. Compléter avec stats.js (FPS,
frame time) et l'onglet Performance du navigateur. **Optimiser sans mesure =
deviner** — même règle que partout dans le scaffold : diagnostic d'abord.

Identifier le goulot : CPU (trop de draw calls, trop d'objets à traverser) vs
GPU (trop de fragments : overdraw, shaders lourds, résolution) vs mémoire
(textures). Chaque goulot a ses remèdes — appliquer les remèdes de l'autre ne
sert à rien.

## Remèdes par goulot

**CPU / draw calls (le cas le plus fréquent — viser < ~200 calls) :**
- `InstancedMesh` pour N objets de même géométrie (1000 arbres = 1 draw call). LE levier majeur des data viz.
- Fusion de géométries statiques (`BufferGeometryUtils.mergeGeometries`).
- Partage de matériaux (chaque matériau unique casse le batching).
- `frustumCulled` actif, objets hors champ retirés du graphe s'ils sont durablement invisibles.

**GPU / fragments :**
- Plafonner `setPixelRatio` (≤ 2, voire 1.5 mobile) — le levier le plus rentable sur écrans denses.
- Réduire l'overdraw (transparences empilées, particules géantes).
- Ombres : une seule lumière avec ombres si possible, shadow map ≤ 2048, `shadow.camera` resserrée sur la zone utile.
- Post-processing : chaque passe se paie plein écran — les cumuler consciemment.

**Mémoire :**
- KTX2 (skill `pipeline-assets`), tailles de textures honnêtes, `dispose()` systématique (skill `threejs-webgl`).

**Échelle (grosses scènes) :**
- LOD (`THREE.LOD`) sur les objets nombreux et lointains.
- Chargement progressif : l'essentiel d'abord, le décor ensuite.

## Procédure

1. Mesurer, identifier LE goulot. 2. Appliquer le remède le plus rentable de sa
catégorie. 3. Re-mesurer — chiffres avant/après dans le livrable. 4. Itérer
jusqu'au budget (60fps desktop / 30-60 mobile), puis **s'arrêter** : l'optimisation
au-delà du budget est de l'over-engineering.
