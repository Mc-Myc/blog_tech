---
name: pipeline-assets
description: Pipeline d'assets 3D pour le web — de l'outil de création (Blender & co) au glTF optimisé servi en production. Formats, compression, budgets.
when_to_use: Intégrer des modèles 3D dans une app web ; assets trop lourds ; préparer une chaîne reproductible création → web.
---

# Skill : pipeline-assets

## Le format cible : glTF/GLB, point final

**glTF 2.0** (`.glb` binaire de préférence) est le « JPEG de la 3D » : le seul
format pensé pour le runtime web. FBX, OBJ, STL, USD sont des formats d'échange
ou de création — on les convertit en amont, on ne les sert jamais au navigateur.

## Chaîne de référence

1. **Création (Blender/DCC)** : appliquer transformations et modificateurs, nommer proprement (les noms traversent jusqu'au code), Y-up à l'export, matériaux PBR (metallic/roughness).
2. **Export glTF** : un `.glb` par objet logique. Textures embarquées pour la simplicité, séparées si mutualisées entre modèles.
3. **Optimisation (gltf-transform / gltfpack — CLI, scriptable, self-hosted)** :
   - Géométrie : compression **Draco** ou **Meshopt**, soudure des vertices, suppression des attributs inutiles.
   - Textures : conversion **KTX2/Basis** (reste compressé en mémoire GPU — un PNG 2048² décompressé = ~16 Mo de VRAM, en KTX2 ~4×moins), resize aux dimensions réellement utiles.
   - `gltf-transform inspect` avant/après : le rapport chiffré est le livrable.
4. **Runtime** : `GLTFLoader` + `DRACOLoader`/`MeshoptDecoder` + `KTX2Loader` configurés une fois, centralisés.

## Budgets de départ (à calibrer par cible)

| Contexte | Poly par scène | Poids total assets | Textures |
|---|---|---|---|
| Mobile web | ≤ 100-200k tris | ≤ 5-10 Mo | ≤ 1024² majoritaires |
| Desktop web | ≤ 500k-1M tris | ≤ 15-25 Mo | ≤ 2048² |

Un budget dépassé se traite dans le pipeline (LOD, decimation, textures), pas
en espérant que ça passe.

## Règles

- Pipeline **scriptable et rejouable** (Makefile/npm script) : re-exporter un asset ne doit jamais être un rituel manuel — même logique que les fichiers vivants du scaffold.
- Versionner les sources (fichiers .blend) ET les .glb produits ; le .glb est un artefact de build.
- Toujours mesurer : poids réseau, temps de parse, VRAM. `inspect` avant toute discussion d'optimisation.
