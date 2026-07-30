# AgriCoop Connect — Coopérative COMAKI, Kintélé

Bienvenue dans votre startup. Ce dépôt est le **squelette** de l'application : un mini-site de 6 pages pour digitaliser le suivi des livraisons, paiements, ventes et stock de la coopérative COMAKI. La structure est déjà en place ; **votre équipe complète les fonctions manquantes et construit les pages**.

Vous avez **une semaine complète** pour ce projet.

## Lancer le projet en local

**1. Démarrer l'API (un seul terminal, à laisser ouvert)**

```bash
cd backend
pip install -r requirements.txt
python app.py
```

L'API tourne sur `http://localhost:5000`. Laissez ce terminal ouvert tout le temps où vous travaillez.

**2. Ouvrir le site**

**Si vous utilisez VS Code, l'extension Live Server fonctionne aussi très bien (clic droit sur le fichier HTML → "Open with Live Server").**

**C'est tout : un seul terminal pour l'API, et vous ouvrez vos pages HTML directement.** Tant que `python app.py` tourne, n'importe quelle page du site peut appeler l'API normalement.

### Si une page ne s'affiche pas comme attendu

- **Une carte ou une section reste vide** : c'est normal si la fonction

Python ou JavaScript correspondante n'est pas encore codée. Les autres   sections de la page continuent de s'afficher normalement — seule la   section concernée reste vide en attendant votre code.

- **Un message d'erreur apparaît sur la page** : lisez-le, il indique

quelle fonction regarder. Le détail technique complet (traceback   Python) est toujours visible dans le terminal où tourne `python app.py`.

- **Rien ne s'affiche du tout** : vérifiez d'abord que le terminal de

l'API est bien ouvert et actif (pas d'erreur affichée dedans). Si vous   venez de modifier `main.js` ou `functions.js`, faites un rafraîchissement   forcé de la page (Ctrl+Maj+R ou Cmd+Maj+R) — le navigateur met parfois   en cache l'ancienne version du fichier.

## Qui fait quoi

| Parcours | Effectif | Vous complétez | Vous ne touchez PAS |
| --- | --- | --- | --- |
| **Data Science** | 2 à 3 personnes | `backend/logic.py` (16 fonctions) | `app.py`, `controllers.py` |
| **Full Stack** | 5 personnes | *voir répartition ci-dessous* | `main.js` |

**Le nommage des champs est déjà fixé dans le code** (docstrings de `logic.py`, structure de `data/comaki.json`, IDs des éléments HTML). Vous n'avez pas à deviner ces noms — regardez les docstrings et le jeu de données pour comprendre le contrat technique attendu.

## Répartition Full Stack

Chaque page est dans son propre sous-dossier avec son fichier CSS dédié. L'essentiel de votre note porte sur vos **pages HTML/CSS** (structure sémantique, box model, Flexbox/Grid, responsive mobile/tablette/desktop). Chacun complète aussi **2 fonctions JS** dans `frontend/functions.js`.

| Qui | Dossier & page | Fonctions JS |
| --- | --- | --- |
| Dev FS1 | `frontend/dashboard/dashboard.html` + `dashboard.css` | `compterJoursActifs`, `formaterDate` |
| Dev FS2 | `frontend/membres/membres.html` + `membres.css` | `filtrerMembresParStatut`, `rechercherMembreParNom` |
| Dev FS3 | `frontend/livraisons/livraisons.html` + `livraisons.css` | `validerFormulaireLivraison`, `trierLivraisonsParDate` |
| Dev FS4 | `frontend/paiements/paiements.html` + `paiements.css` | `validerFormulairePaiement`, `calculerTotalPaiements` |
| Dev FS5<br><br>Dev FS6 | `frontend/ventes/ventes.html` + `ventes.css`  `frontend/statistiques/statistiques.html` + `statistiques.css` | `getBadgeStock`, `trierClassementParVolume` |

Chaque page contient des commentaires `<!-- TODO -->` indiquant le travail attendu, avec le layout, les éléments à construire et les classes déjà utilisées par `main.js` pour injecter le contenu dynamique. **Les éléments marqués "NE PAS MODIFIER" (IDs, scripts, formulaires) sont le câblage vers le backend — ne les changez pas, sinon les données ne s'afficheront plus.**

## Équipe Data Science — workflow

```bash
cd backend
pip install -r requirements.txt
python -m pytest -v        # ROUGE au départ (29 tests)
```

Complétez `backend/logic.py` (16 fonctions réparties en 3 zones — voir les commentaires de section dans le fichier ; répartissez les 3 zones entre vous selon que vous êtes 2 ou 3 dans l'équipe), relancez les tests jusqu'au **VERT**.

Pour vérifier vos résultats via l'API une fois les tests au vert, lancez `python app.py` (voir "Lancer le projet en local" ci-dessus) puis testez dans le navigateur :

```
http://localhost:5000/api/dashboard
http://localhost:5000/api/membres
http://localhost:5000/api/livraisons
http://localhost:5000/api/paiements
http://localhost:5000/api/ventes-stock
http://localhost:5000/api/statistiques
http://localhost:5000/api/rapport-bailleur
```

## Équipe Full Stack — workflow

1. Ouvrez `frontend/functions.test.html` dans le navigateur → **ROUGE au

départ** (19 tests, 2 par personne).

1. Complétez vos fonctions dans `frontend/functions.js`.
2. Construisez vos pages HTML/CSS dans votre sous-dossier.
3. Pour voir le rendu de votre page connectée aux vraies données, suivez

la section "Lancer le projet en local" ci-dessus (backend démarré,    puis ouvrez simplement votre fichier HTML).

## La règle d'or (JS)

Vous n'écrivez que des **fonctions pures** : des paramètres entrent, une valeur sort (`return`). Pas de réseau, pas de DOM — tout ça est déjà branché dans `main.js`. Votre note JS reste secondaire face à vos pages.

## Le jeu de données

`backend/data/comaki.json` contient 8 membres, 25 livraisons (avril-juillet 2026), 8 paiements, 3 acheteurs et 9 ventes. C'est la source unique de vérité : ne modifiez pas ce fichier, sinon vos résultats ne correspondront plus à ceux calculés par les autres personnes de l'équipe.

## Livrable & soutenance (Demo Day)

Votre équipe pitche son produit comme une vraie startup : démo live (navigation sur les 6 pages, enregistrement d'une vraie livraison et d'un vrai paiement), avec explication des règles métier respectées (paiement ne dépassant jamais le solde dû, vente ne dépassant jamais le stock disponible).

Bonne construction.