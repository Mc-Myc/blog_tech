# Patrons structurels — le geste : ASSEMBLER ⌂ (bleu)

Expliquent comment assembler objets et classes en structures plus grandes,
flexibles et efficaces. Leurs formes sont des **constructions**.

---

## Adaptateur (Adapter)

**Intention** : faire collaborer deux interfaces incompatibles via une pièce
intermédiaire qui traduit les appels.
**Forme 3D** : *la prise + son adaptateur* — une fiche ronde, une prise carrée,
et la pièce qui épouse les deux.
**Démo** : la fiche ronde s'approche de la prise carrée → refus ; l'adaptateur
se glisse entre → connexion, le courant (données) passe.
**Quand** : intégrer une lib tierce au format différent, faire vivre du legacy
avec du neuf, normaliser des sources hétérogènes (les 2 datasets du notebook !).
**Pièges** : empiler des adaptateurs sur des adaptateurs ; adapter quand on
pourrait corriger l'interface source.
**Exemple minimal** (python) :
```python
class LegacyPayment:
    def make_payment(self, amount_cents): ...

class PaymentAdapter(PaymentPort):
    def __init__(self, legacy): self.legacy = legacy
    def pay(self, euros):
        return self.legacy.make_payment(int(euros * 100))
```
**À ne pas confondre avec** : Façade (simplifie, n'adapte pas un contrat),
Décorateur (même interface, comportement enrichi).

---

## Pont (Bridge)

**Intention** : séparer une abstraction de son implémentation pour qu'elles
évoluent indépendamment.
**Forme 3D** : *le pont entre deux rives* — la rive « abstractions » et la rive
« implémentations », reliées par un tablier ; chaque rive grandit sans toucher
l'autre.
**Démo** : ajouter une pile côté abstraction (nouvelle télécommande) ou côté
implémentation (nouvelle TV) — le pont tient sans reconstruction.
**Quand** : deux dimensions de variation (formes × moteurs de rendu,
notifications × canaux), éviter l'explosion combinatoire de sous-classes.
**Pièges** : abstraction prématurée — le pont ne se justifie qu'à partir de
2 × 2 variantes réelles.
**Exemple minimal** (python) :
```python
class Renderer(ABC):
    @abstractmethod
    def draw_ring(self): ...

class Scene:                    # l'abstraction tient UNE référence
    def __init__(self, renderer: Renderer):
        self.renderer = renderer
    def singleton(self): self.renderer.draw_ring()
```
**À ne pas confondre avec** : Adaptateur (répare un existant ; le Pont se
conçoit *avant*), Stratégie (change un algorithme, pas une implémentation entière).

---

## Composite

**Intention** : composer les objets en arbres et traiter un élément seul et un
groupe exactement de la même façon.
**Forme 3D** : *l'arbre* — racine, branches, feuilles, tous du même bleu :
même interface du haut en bas.
**Démo** : un appel `render()` touche la racine et ruisselle jusqu'aux
feuilles ; on déplace une branche entière comme une seule feuille.
**Quand** : hiérarchies (dossiers/fichiers, menus, scènes 3D, organisations),
dès qu'on veut « appliquer à tout le sous-arbre ».
**Pièges** : interfaces trop grosses pour les feuilles (add/remove sur une
feuille ?) ; parcours coûteux non mémoïsés.
**Exemple minimal** (python) :
```python
class Node(ABC):
    @abstractmethod
    def size(self): ...

class File(Node):
    def size(self): return self.bytes

class Folder(Node):
    def size(self): return sum(c.size() for c in self.children)
```
**À ne pas confondre avec** : Décorateur (un seul enfant, enrichit),
Visiteur (opère *sur* l'arbre sans en faire partie).

---

## Décorateur (Decorator)

**Intention** : ajouter dynamiquement des comportements à un objet en
l'emballant dans des couches qui partagent son interface.
**Forme 3D** : *les anneaux gigognes* — le noyau au centre, chaque anneau
ajoute un pouvoir sans toucher le noyau (les poupées russes, en orbites).
**Démo** : les anneaux s'ajoutent un à un autour du noyau — compression, puis
chiffrement, puis log — et l'appel traverse toutes les couches.
**Quand** : combinaisons d'options à la carte (flux : buffer+gzip+chiffré),
middlewares, enrichir sans hériter.
**Pièges** : pile de couches difficile à déboguer ; l'ordre des anneaux compte
(chiffrer puis compresser ≠ compresser puis chiffrer).
**Exemple minimal** (python) :
```python
class Gzip(Stream):
    def __init__(self, inner: Stream): self.inner = inner
    def write(self, data):
        self.inner.write(gzip.compress(data))

stream = Gzip(Encrypted(FileStream("out.bin")))
```
**À ne pas confondre avec** : Procuration (contrôle l'accès, n'ajoute pas de
comportement métier), Adaptateur (change l'interface).

---

## Façade (Facade)

**Intention** : offrir une porte d'entrée simple à un sous-système complexe.
**Forme 3D** : *la façade + le dédale caché* — un mur propre avec UNE porte ;
derrière, en pointillés, le labyrinthe des sous-systèmes.
**Démo** : l'appel frappe à la porte → derrière, le dédale s'illumine en
cascade (5 sous-appels), mais le visiteur n'a vu qu'une porte.
**Quand** : simplifier une lib complexe (ffmpeg, paiement), point d'entrée
d'un module (les use cases de l'hexagonal sont des façades !).
**Pièges** : la façade-Dieu qui aspire toute la logique ; masquer si bien
qu'on ne peut plus accéder aux réglages fins.
**Exemple minimal** (python) :
```python
class VideoExporter:                     # la porte unique
    def export(self, path):
        raw = Loader(path).load()
        buf = Codec("h264").encode(raw)
        return Muxer("mp4").mux(buf, AudioMix(raw).mix())
```
**À ne pas confondre avec** : Adaptateur (traduit un contrat), Médiateur
(les objets se parlent *via* lui ; la façade ne fait que simplifier l'entrée).

---

## Poids mouche (Flyweight)

**Intention** : partager l'état commun entre une multitude d'objets pour tenir
en mémoire.
**Forme 3D** : *la ruche au motif partagé* — des cellules hexagonales ; le
motif (état partagé) pulse au centre, réutilisé par toutes les cellules.
**Démo** : 10 000 cellules apparaissent mais UNE seule texture pulse — le
compteur mémoire reste plat.
**Quand** : particules, caractères d'un éditeur, tuiles de carte, icônes —
beaucoup d'objets, peu d'états intrinsèques distincts.
**Pièges** : la séparation intrinsèque/extrinsèque complexifie le code ;
inutile sans volumétrie réelle.
**Exemple minimal** (python) :
```python
class GlyphFactory:
    _cache = {}
    def get(self, char, font):
        key = (char, font)
        if key not in self._cache:
            self._cache[key] = Glyph(char, font)   # partagé
        return self._cache[key]
```
**À ne pas confondre avec** : Singleton (UNE instance ; le poids mouche en a
peu mais plusieurs), cache applicatif (le flyweight partage l'*identité*).

---

## Procuration (Proxy)

**Intention** : fournir un remplaçant qui contrôle l'accès à l'objet réel.
**Forme 3D** : *le portier devant l'original* — une silhouette pleine (petite)
devant la grande silhouette (l'objet réel), reliées en pointillés.
**Démo** : l'appel frappe le portier ; selon le cas il répond seul (cache),
refuse (droits), ou réveille le géant endormi (lazy loading).
**Quand** : lazy loading d'objets lourds, contrôle d'accès, cache, client
distant (le `PaymentFraudAIService` est un proxy distant du service Python !).
**Pièges** : latence cachée qui surprend ; proxys empilés illisibles.
**Exemple minimal** (python) :
```python
class LazyModel:
    _real = None
    def predict(self, x):
        if self._real is None:
            self._real = load_model("bert.bin")   # réveil tardif
        return self._real.predict(x)
```
**À ne pas confondre avec** : Décorateur (ajoute du comportement ; le proxy
contrôle l'*accès*), Façade (simplifie plusieurs objets, pas un seul).
