# Patrons de création — le geste : PRODUIRE ⚙ (argile)

Fournissent des mécanismes de création d'objets qui augmentent la flexibilité
et la réutilisation. Leurs formes sont des **machines**.

---

## Singleton

**Intention** : garantir qu'une classe n'a qu'une seule instance et fournir un
point d'accès global à celle-ci.
**Forme 3D** : *l'anneau orbital* — le code s'enroule en anneau autour du noyau
« instance unique » ; deux anneaux inclinés + satellite lumineux.
**Démo « aha »** : la bille d'exécution fait deux tours — 1ᵉʳ tour lent qui passe
par `super().__new__` (elle CRÉE), tours suivants éclair qui sautent au
`return` (elle RÉUTILISE).
**Quand** : config globale, pool de connexions DB, logger unique — tout ce qui
doit exister en un exemplaire.
**Pièges** : état global qui casse les tests, dépendance cachée par l'import,
couplage invisible. Souvent l'injection de dépendances est meilleure
(cf. l'article « Le singleton que Claude refusait d'écrire »).
**Exemple minimal** (python) :
```python
class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```
**À ne pas confondre avec** : Fabrique (produit *plusieurs* objets),
variable globale (aucune garantie d'unicité ni d'initialisation paresseuse).

---

## Fabrique (Factory Method)

**Intention** : définir une interface de création dans la classe mère, mais
déléguer le choix du type d'objet concret aux sous-classes.
**Forme 3D** : *le tapis roulant* — la machine (classe mère) en haut, le tapis
en bas, les produits qui en sortent ; chaque sous-classe change le moule.
**Démo** : le tapis roule, une boîte sort ; on change la sous-classe → la même
machine sort un produit différent.
**Quand** : le code doit créer des objets sans connaître leur classe exacte
(plugins, connecteurs, notifications multi-canal).
**Pièges** : sur-ingénierie quand un simple constructeur suffit ; hiérarchies
parallèles qui gonflent.
**Exemple minimal** (python) :
```python
class Notifier(ABC):
    @abstractmethod
    def create_channel(self): ...

    def send(self, msg):
        return self.create_channel().push(msg)

class SmsNotifier(Notifier):
    def create_channel(self): return SmsChannel()
```
**À ne pas confondre avec** : Fabrique abstraite (des *familles* de produits),
Monteur (construction *par étapes*).

---

## Fabrique abstraite (Abstract Factory)

**Intention** : produire des familles entières d'objets liés, garantis
compatibles entre eux, sans préciser leurs classes concrètes.
**Forme 3D** : *l'usine à deux tapis* — deux lignes de production parallèles ;
changer d'usine change TOUTE la famille d'un coup.
**Démo** : bascule « usine claire / usine sombre » → boutons + champs + menus
changent ensemble, jamais dépareillés.
**Quand** : thèmes UI (clair/sombre), familles de drivers (Postgres/MySQL),
kits multi-plateformes (Mac/Windows).
**Pièges** : beaucoup d'interfaces pour peu de variantes ; ajouter un nouveau
*produit* à la famille oblige à toucher toutes les usines.
**Exemple minimal** (python) :
```python
class UIFactory(ABC):
    @abstractmethod
    def button(self): ...
    @abstractmethod
    def input(self): ...

class DarkUI(UIFactory):
    def button(self): return DarkButton()
    def input(self):  return DarkInput()
```
**À ne pas confondre avec** : Fabrique (un seul produit), Monteur (un seul
objet complexe).

---

## Monteur (Builder)

**Intention** : construire un objet complexe étape par étape, et pouvoir
produire des représentations différentes avec le même processus.
**Forme 3D** : *l'échafaudage qui monte* — les étages se posent l'un sur
l'autre ; la grue (le directeur) enchaîne les étapes.
**Démo** : les étages s'empilent un à un ; deux séquences d'étapes différentes
→ deux bâtiments différents.
**Quand** : objets à nombreux paramètres optionnels (requêtes SQL, configs,
documents), éviter le constructeur télescopique à 10 arguments.
**Pièges** : verbosité pour des objets simples ; objets mutables à moitié
construits si on oublie `build()`.
**Exemple minimal** (python) :
```python
q = (QueryBuilder()
     .table("articles")
     .where(kind="code_3d")
     .order_by("-published_at")
     .limit(10)
     .build())
```
**À ne pas confondre avec** : Fabrique abstraite (familles d'objets),
chaînage fluide simple (un Builder a une étape finale `build`).

---

## Prototype

**Intention** : créer de nouveaux objets en copiant un exemplaire existant,
sans dépendre de sa classe.
**Forme 3D** : *le tampon-cloneur* — l'objet plein, une flèche, son double en
pointillés qui se matérialise.
**Démo** : le tampon presse l'objet → la copie apparaît en pointillés puis se
solidifie, état inclus.
**Quand** : objets coûteux à initialiser (chargements, calculs), copies
préconfigurées (gabarits de documents), éviter une hiérarchie de fabriques.
**Pièges** : copie profonde vs superficielle (les références partagées !),
objets avec ressources externes (sockets, fichiers).
**Exemple minimal** (python) :
```python
import copy

class SceneTemplate:
    def clone(self):
        return copy.deepcopy(self)

article_scene = base_scene.clone()
```
**À ne pas confondre avec** : Mémento (sauvegarde l'*état* pour y revenir,
pas pour créer un nouvel objet indépendant).
