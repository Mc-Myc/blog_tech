# Patrons comportementaux — le geste : DIALOGUER ⇄ (jaune)

Mettent en place une communication efficace et répartissent les
responsabilités entre les objets. Leurs formes sont des **flux**.

---

## Chaîne de responsabilité (Chain of Responsibility)

**Intention** : faire passer une requête le long d'une chaîne de maillons
jusqu'à ce que l'un d'eux la traite.
**Forme 3D** : *la chaîne de maillons* — des maillons ovales reliés ; la
requête (bille) entre par la gauche et avance.
**Démo** : la bille traverse maillon 1 (passe), maillon 2 (passe), s'arrête au
maillon 3 qui s'illumine — traité.
**Quand** : middlewares HTTP, validation en étapes, escalade de support,
gestion d'événements UI (bubbling).
**Pièges** : requête jamais traitée si aucun maillon ne la prend (prévoir un
maillon terminal) ; débogage du chemin.
**Exemple minimal** (python) :
```python
class Handler:
    def __init__(self, next=None): self.next = next
    def handle(self, req):
        if self.next: return self.next.handle(req)

pipeline = Auth(RateLimit(Validate(Process())))
```
**À ne pas confondre avec** : Décorateur (toutes les couches agissent ; ici UN
maillon traite), Commande (l'ordre lui-même est un objet).

---

## Commande (Command)

**Intention** : transformer une action en objet autonome — on peut la ranger,
la mettre en file, l'annuler, la rejouer.
**Forme 3D** : *l'ordre sous enveloppe* — un bouton presse, une enveloppe se
scelle et part dans une pile.
**Démo** : trois clics → trois enveloppes empilées ; « undo » dépile la
dernière et l'action se rejoue à l'envers.
**Quand** : undo/redo, files de tâches, macros, boutons configurables,
transactions.
**Pièges** : une classe par action = beaucoup de classes ; l'undo exige de
stocker l'état inverse.
**Exemple minimal** (python) :
```python
class PublishArticle:
    def __init__(self, repo, slug): self.repo, self.slug = repo, slug
    def execute(self): self.repo.publish(self.slug)
    def undo(self):    self.repo.unpublish(self.slug)

history.push(cmd); cmd.execute()
```
**À ne pas confondre avec** : Stratégie (choisit COMMENT faire ; la commande
encapsule QUOI faire et quand), Mémento (sauve l'état, pas l'action).

---

## Itérateur (Iterator)

**Intention** : parcourir les éléments d'une collection sans exposer sa
structure interne.
**Forme 3D** : *le curseur sur rail* — un rail horizontal, des billes-éléments,
un curseur qui descend et avance.
**Démo** : le curseur saute d'élément en élément ; on remplace la collection
(liste → arbre) : le rail reste identique pour le visiteur.
**Quand** : toute collection custom, parcours paresseux (générateurs), flux
paginés d'API.
**Pièges** : mutation de la collection pendant le parcours ; itérateurs
épuisés réutilisés.
**Exemple minimal** (python) :
```python
class Serie:
    def __init__(self, articles): self._items = articles
    def __iter__(self):
        return iter(sorted(self._items, key=lambda a: a.ordre))

for article in serie: ...
```
**À ne pas confondre avec** : Visiteur (l'opération se déplace ; l'itérateur ne
fait qu'avancer), curseur DB (implémentation, pas pattern).

---

## Médiateur (Mediator)

**Intention** : supprimer les liens directs entre objets — tous parlent à une
tour de contrôle qui orchestre.
**Forme 3D** : *la tour de contrôle* — la tour au centre, les avions autour,
des liens pointillés UNIQUEMENT vers la tour.
**Démo** : un avion émet → la tour reçoit → la tour redistribue aux deux
concernés ; jamais de trait d'avion à avion.
**Quand** : formulaires complexes (champs interdépendants), chat rooms,
orchestration de composants UI.
**Pièges** : le médiateur-Dieu qui concentre toute la logique ; préférer
plusieurs petits médiateurs.
**Exemple minimal** (python) :
```python
class EditorMediator:
    def notify(self, sender, event):
        if event == "pattern_choisi":
            self.preview.recalcule_forme()
            self.json_panel.regenere()
```
**À ne pas confondre avec** : Observateur (diffusion 1→N sans logique ; le
médiateur DÉCIDE qui reçoit quoi), Façade (simplifie, n'orchestre pas les
échanges internes).

---

## Mémento (Memento)

**Intention** : photographier l'état interne d'un objet pour pouvoir le
restaurer, sans violer son encapsulation.
**Forme 3D** : *la pile de polaroïds* — des instantanés empilés de biais,
le plus récent sur le dessus.
**Démo** : l'objet change trois fois → trois polaroïds s'empilent ; « restore »
prend celui du dessus et l'objet reprend cette pose.
**Quand** : undo profond (éditeurs), snapshots de transactions, sauvegardes
de parties (jeux).
**Pièges** : mémoire (snapshots volumineux → combiner avec des deltas) ;
sérialiser des références externes.
**Exemple minimal** (python) :
```python
class SceneEditor:
    def snapshot(self):
        return {"scene": copy.deepcopy(self.scene)}   # le polaroïd
    def restore(self, memento):
        self.scene = memento["scene"]
```
**À ne pas confondre avec** : Prototype (copie pour créer un NOUVEL objet ;
le mémento restaure le MÊME), Commande (l'undo par action inverse).

---

## Observateur (Observer)

**Intention** : notifier automatiquement tous les abonnés quand l'état du
sujet change.
**Forme 3D** : *l'étoile de diffusion* — le sujet au centre, les abonnés en
pointes d'étoile.
**Démo « aha »** : l'événement naît au centre et **allume les abonnés un à
un** en ondes successives ; un abonné se désinscrit → sa branche s'éteint.
**Quand** : événements UI, pub/sub, webhooks, signaux Django, reactive
programming.
**Pièges** : fuites mémoire (abonnés jamais désinscrits), cascades de
notifications imprévisibles, ordre non garanti.
**Exemple minimal** (python) :
```python
class ArticlePublished:
    def __init__(self): self.subs = []
    def subscribe(self, fn): self.subs.append(fn)
    def emit(self, article):
        for fn in self.subs: fn(article)

evt.subscribe(send_newsletter); evt.subscribe(purge_cache)
```
**À ne pas confondre avec** : Médiateur (logique centrale ; l'observer diffuse
bêtement), Chaîne (UN maillon traite ; ici TOUS reçoivent).

---

## État (State)

**Intention** : laisser un objet changer de comportement quand son état
interne change — comme s'il changeait de classe.
**Forme 3D** : *la roue à facettes* — un polyèdre dont la face avant est
l'état courant ; la transition fait tourner la roue.
**Démo** : `draft` face avant → événement `publish` → la roue tourne →
face `published` ; les actions disponibles changent avec la face.
**Quand** : workflows (draft→review→published, l'Article du blog !),
machines à états de jeux, protocoles de connexion.
**Pièges** : transitions cachées partout (les centraliser), explosion d'états
proches (les paramétrer).
**Exemple minimal** (python) :
```python
class Draft:
    def publish(self, article):
        article.state = Published()
class Published:
    def publish(self, article):
        raise DejaPublie()

article.state.publish(article)
```
**À ne pas confondre avec** : Stratégie (le CLIENT choisit l'algo ; l'état
change TOUT SEUL), enum + if (tient jusqu'à ~3 états, après ça déborde).

---

## Stratégie (Strategy)

**Intention** : définir une famille d'algorithmes interchangeables et laisser
le client choisir lequel brancher.
**Forme 3D** : *la boîte à outils* — un socle avec une fente ; au-dessus,
trois outils prêts à s'enficher.
**Démo** : l'outil A s'enfiche → le socle travaille d'une façon ; on l'éjecte,
l'outil B s'enfiche → même socle, autre résultat.
**Quand** : tri/scoring configurables, compression au choix, calculs de prix,
le scoring du backfill `/blog-capture` !
**Pièges** : le client doit connaître les stratégies (les nommer clairement) ;
une stratégie sans état = souvent une simple fonction suffit.
**Exemple minimal** (python) :
```python
def score_narratif(session): ...
def score_technique(session): ...

class Backfill:
    def __init__(self, score): self.score = score
    def run(self, sessions):
        return sorted(sessions, key=self.score, reverse=True)
```
**À ne pas confondre avec** : État (transitions internes), Patron de méthode
(le squelette est FIXE, seuls des trous varient ; la stratégie remplace TOUT
l'algorithme).

---

## Patron de méthode (Template Method)

**Intention** : la classe mère fixe le squelette de l'algorithme ; les
sous-classes remplissent certaines étapes sans toucher à la structure.
**Forme 3D** : *le pochoir* — un cadre en pointillés avec des bandes ; les
bandes pleines sont fixées par la mère, les bandes creuses attendent l'enfant.
**Démo** : le pochoir se pose ; l'enfant peint UNIQUEMENT à travers les trous ;
le motif d'ensemble reste garanti.
**Quand** : pipelines à étapes surchargeables (le
`AbstractPythonServiceClient` de NutriChain !), hooks de frameworks, tests
avec setup/teardown.
**Pièges** : hiérarchies rigides (préférer la composition au-delà de 2
niveaux) ; trop de trous = plus de squelette du tout.
**Exemple minimal** (python) :
```python
class Importer(ABC):
    def run(self, path):          # le squelette, fixe
        raw = self.read(path)     # trou 1
        rows = self.parse(raw)    # trou 2
        self.save(rows)           # fixe

class NotebookImporter(Importer):
    def read(self, path): ...
    def parse(self, raw): ...
```
**À ne pas confondre avec** : Stratégie (remplace tout l'algo par
composition), Fabrique (un patron de méthode spécialisé dans la création).

---

## Visiteur (Visitor)

**Intention** : ajouter une opération nouvelle à toute une famille d'objets
sans modifier leurs classes.
**Forme 3D** : *la tournée du visiteur* — trois salles (les classes), un
chemin pointillé qui les traverse, le visiteur qui fait sa tournée.
**Démo** : le visiteur « export PDF » entre dans chaque salle et y fait son
travail ; on change de visiteur (« stats ») → même tournée, autre travail.
**Quand** : opérations sur des AST (le Détecteur de patterns !), exports
multi-formats d'une hiérarchie, calculs transverses sur un Composite.
**Pièges** : ajouter une CLASSE devient coûteux (tous les visiteurs à
mettre à jour) — le visiteur aime les hiérarchies stables ; double dispatch
peu naturel dans certains langages.
**Exemple minimal** (python) :
```python
class PatternDetector:               # le visiteur du Détecteur
    def visit_classdef(self, node):
        if node.bases and node.decorators: self.check_template(node)
    def visit_call(self, node): ...

ast_walk(tree, PatternDetector())
```
**À ne pas confondre avec** : Itérateur (avance sans opérer), Stratégie
(un algo à la fois ; le visiteur se démultiplie par type de nœud).
