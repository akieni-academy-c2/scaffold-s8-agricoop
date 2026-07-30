/* =====================================================================
   MAIN.JS  —  FICHIER PRÉ-ÉCRIT — NE PAS MODIFIER
   =====================================================================
   AgriCoop Connect — Coopérative COMAKI, Kintélé

   Ce fichier détecte sur quelle page il s'exécute et branche vos
   fonctions (functions.js) au bon endroit : appel de l'API Flask,
   lecture des formulaires, écriture dans le DOM. Vous n'avez rien à
   écrire ici.
   ===================================================================== */

const API_URL = "http://localhost:5000/api";

/* ---------- TABLEAU DE BORD (index.html) ------------------------------ */
async function initDashboard() {
  const cible = document.getElementById("dashboard-cartes");
  if (!cible) return;

  let data;
  try {
    const reponse = await fetch(`${API_URL}/dashboard`);
    data = await reponse.json();
    if (!reponse.ok) {
      // L'API a répondu mais avec une erreur (ex. fonction logic.py pas
      // encore implémentée). Le message vient directement du serveur.
      cible.innerHTML = data.erreur || "Le serveur a renvoyé une erreur.";
      return;
    }
  } catch (e) {
    // Ici, l'API est réellement injoignable (backend pas démarré, etc.)
    cible.innerHTML = "Impossible de joindre l'API. Vérifiez que le backend est démarré (python app.py).";
    console.error(e);
    return;
  }

  // Chaque section est indépendante : si l'une échoue (fonction JS pas
  // encore codée), les autres s'affichent quand même normalement.
  try {
    const ind = data.indicateurs;
    document.getElementById("carte-stock").textContent = ind.stock_total + " kg";
    document.getElementById("carte-montant-du").textContent = formaterMontant(ind.montant_du_total);
    document.getElementById("carte-membres").textContent = ind.nb_membres_actifs;
    document.getElementById("carte-livraisons").textContent = ind.nb_livraisons_mois;
  } catch (e) {
    cible.innerHTML = "Cartes indicateurs : vérifiez formaterMontant() dans functions.js.";
    console.error(e);
  }

  try {
    const joursActifs = document.getElementById("jours-actifs");
    if (joursActifs) {
      joursActifs.textContent = compterJoursActifs(data.livraisons_par_jour, 80) + " jour(s) à forte activité (> 80 kg)";
    }
  } catch (e) {
    console.error("Section jours-actifs :", e);
  }

  try {
    const graphique = document.getElementById("graphique-semaine");
    if (graphique) {
      graphique.innerHTML = Object.entries(data.livraisons_par_jour)
        .map(([date, qte]) => `<div class="barre" style="height:${qte}px" title="${formaterDate(date)} : ${qte} kg"></div>`)
        .join("");
    }
  } catch (e) {
    console.error("Section graphique-semaine :", e);
  }
}

/* ---------- MEMBRES (membres.html) ------------------------------------ */
let _membresCache = [];

async function initMembres() {
  const conteneur = document.getElementById("liste-membres");
  if (!conteneur) return;
  try {
    const reponse = await fetch(`${API_URL}/membres`);
    const data = await reponse.json();
    if (!reponse.ok) {
      conteneur.innerHTML = data.erreur || "Le serveur a renvoyé une erreur.";
      return;
    }
    _membresCache = data.membres;
    appliquerFiltresMembres();
  } catch (e) {
    conteneur.innerHTML = "Impossible de joindre l'API. Vérifiez que le backend est démarré (python app.py).";
    console.error(e);
  }
}

function appliquerFiltresMembres() {
  let membres = _membresCache;

  const filtre = document.getElementById("filtre-statut");
  if (filtre && filtre.value) {
    membres = filtrerMembresParStatut(membres, filtre.value);
  }

  const recherche = document.getElementById("champ-recherche-membre");
  if (recherche && recherche.value) {
    membres = rechercherMembreParNom(membres, recherche.value);
  }

  afficherMembres(membres);
}

function afficherMembres(membres) {
  const conteneur = document.getElementById("liste-membres");
  if (!membres || membres.length === 0) {
    conteneur.innerHTML = "Aucun membre trouvé.";
    return;
  }
  conteneur.innerHTML = membres
    .map((m) => {
      const classeStatut = m.statut_cotisation === "À jour" ? "ok" : "alerte";
      return `
      <article class="membre-ligne">
        <strong>${m.nom}</strong>
        <span class="badge ${classeStatut}">${m.statut_cotisation}</span>
        <span>${formaterMontant(m.solde)}</span>
      </article>`;
    })
    .join("");
}

function initFiltresMembres() {
  const filtre = document.getElementById("filtre-statut");
  const recherche = document.getElementById("champ-recherche-membre");
  if (filtre) filtre.addEventListener("change", appliquerFiltresMembres);
  if (recherche) recherche.addEventListener("input", appliquerFiltresMembres);
}

/* ---------- LIVRAISONS (livraisons.html) ------------------------------ */
let _livraisonsCache = [];
let _livraisonsTrieesParDate = false;

async function chargerLivraisons() {
  const conteneur = document.getElementById("liste-livraisons");
  if (!conteneur) return;
  try {
    const reponse = await fetch(`${API_URL}/livraisons`);
    const data = await reponse.json();
    if (!reponse.ok) {
      conteneur.innerHTML = `<tr><td colspan='4'>${data.erreur || "Le serveur a renvoyé une erreur."}</td></tr>`;
      return;
    }
    _livraisonsCache = data;
    afficherLivraisons(_livraisonsCache);
  } catch (e) {
    conteneur.innerHTML = "<tr><td colspan='4'>Impossible de joindre l'API. Vérifiez que le backend est démarré (python app.py).</td></tr>";
    console.error(e);
  }
}

function afficherLivraisons(livraisons) {
  const conteneur = document.getElementById("liste-livraisons");
  conteneur.innerHTML = livraisons
    .map(
      (l) => `
    <tr>
      <td>${l.membre_nom}</td>
      <td>${l.culture}</td>
      <td>${l.quantite} kg</td>
      <td>${formaterDate(l.date)}</td>
    </tr>`
    )
    .join("");
}

function initTriLivraisons() {
  const bouton = document.getElementById("btn-trier-livraisons");
  if (!bouton) return;
  bouton.addEventListener("click", () => {
    afficherLivraisons(trierLivraisonsParDate(_livraisonsCache));
  });
}

function initFormLivraison() {
  const form = document.getElementById("form-livraison");
  if (!form) return;

  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const donnees = {
      membre_id: Number(document.getElementById("f-membre").value),
      culture: document.getElementById("f-culture").value,
      quantite: document.getElementById("f-quantite").value,
    };

    const messageErreur = document.getElementById("message-erreur-livraison");
    const messageSucces = document.getElementById("message-succes-livraison");

    if (!validerFormulaireLivraison(donnees)) {
      messageErreur.hidden = false;
      messageSucces.hidden = true;
      return;
    }
    messageErreur.hidden = true;

    try {
      const reponse = await fetch(`${API_URL}/livraisons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...donnees, quantite: Number(donnees.quantite) }),
      });
      const resultat = await reponse.json();

      if (resultat.succes) {
        messageSucces.textContent = `Livraison enregistrée ! Nouveau solde : ${formaterMontant(resultat.solde)}`;
        messageSucces.hidden = false;
        form.reset();
        chargerLivraisons();
      } else {
        messageErreur.textContent = resultat.anomalies.join(" ");
        messageErreur.hidden = false;
      }
    } catch (e) {
      messageErreur.textContent = "Impossible de contacter le serveur.";
      messageErreur.hidden = false;
      console.error(e);
    }
  });
}

/* ---------- PAIEMENTS (paiements.html) --------------------------------- */
async function chargerPaiements() {
  const conteneur = document.getElementById("liste-paiements");
  if (!conteneur) return;
  try {
    const reponse = await fetch(`${API_URL}/paiements`);
    const data = await reponse.json();
    if (!reponse.ok) {
      conteneur.innerHTML = `<tr><td colspan='3'>${data.erreur || "Le serveur a renvoyé une erreur."}</td></tr>`;
      return;
    }

    conteneur.innerHTML = data.paiements
      .map(
        (p) => `
      <tr>
        <td>${p.membre_nom}</td>
        <td>${formaterMontant(p.montant)}</td>
        <td>${formaterDate(p.date)}</td>
      </tr>`
      )
      .join("");

    const totalCible = document.getElementById("total-paiements");
    if (totalCible) {
      totalCible.textContent = formaterMontant(calculerTotalPaiements(data.paiements));
    }
  } catch (e) {
    conteneur.innerHTML = "<tr><td colspan='3'>Impossible de joindre l'API. Vérifiez que le backend est démarré (python app.py).</td></tr>";
    console.error(e);
  }
}

function initFormPaiement() {
  const form = document.getElementById("form-paiement");
  if (!form) return;

  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const donnees = {
      membre_id: Number(document.getElementById("p-membre").value),
      montant: document.getElementById("p-montant").value,
    };

    const messageErreur = document.getElementById("message-erreur-paiement");
    const messageSucces = document.getElementById("message-succes-paiement");

    if (!validerFormulairePaiement(donnees)) {
      messageErreur.textContent = "Merci de vérifier les champs du formulaire.";
      messageErreur.hidden = false;
      messageSucces.hidden = true;
      return;
    }
    messageErreur.hidden = true;

    try {
      const reponse = await fetch(`${API_URL}/paiements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...donnees, montant: Number(donnees.montant) }),
      });
      const resultat = await reponse.json();

      if (resultat.succes) {
        messageSucces.textContent = `${resultat.recu} Nouveau solde : ${formaterMontant(resultat.nouveau_solde)}`;
        messageSucces.hidden = false;
        form.reset();
        chargerPaiements();
      } else {
        messageErreur.textContent = resultat.anomalies.join(" ");
        messageErreur.hidden = false;
      }
    } catch (e) {
      messageErreur.textContent = "Impossible de contacter le serveur.";
      messageErreur.hidden = false;
      console.error(e);
    }
  });
}

/* ---------- VENTES & STOCK (ventes.html) ------------------------------- */
async function initVentesStock() {
  const cible = document.getElementById("cartes-stock");
  if (!cible) return;

  let data;
  try {
    const reponse = await fetch(`${API_URL}/ventes-stock`);
    data = await reponse.json();
    if (!reponse.ok) {
      cible.innerHTML = data.erreur || "Le serveur a renvoyé une erreur.";
      return;
    }
  } catch (e) {
    cible.innerHTML = "Impossible de joindre l'API. Vérifiez que le backend est démarré (python app.py).";
    console.error(e);
    return;
  }

  try {
    const stockMax = Math.max(...Object.values(data.stock_disponible), 1);
    cible.innerHTML = Object.entries(data.stock_disponible)
      .map(([culture, qte]) => {
        const badge = getBadgeStock(qte);
        const pourcentage = Math.round((qte / stockMax) * 100);
        return `
        <div class="card" data-pourcentage="${pourcentage}">
          <h3>${culture}</h3>
          <p>${qte} kg disponible</p>
          <span class="badge">${badge}</span>
          <div class="barre-stock-fond">
            <div class="barre-stock-remplissage" style="width:${pourcentage}%"></div>
          </div>
        </div>`;
      })
      .join("");
  } catch (e) {
    cible.innerHTML = "Cartes de stock : vérifiez getBadgeStock() dans functions.js.";
    console.error(e);
  }

  try {
    const listeVentes = document.getElementById("liste-ventes");
    if (listeVentes) {
      listeVentes.innerHTML = data.ventes
        .map(
          (v) => `
        <tr>
          <td>${v.acheteur_nom}</td>
          <td>${v.culture}</td>
          <td>${v.quantite} kg</td>
          <td>${formaterMontant(v.prix_kg)}/kg</td>
        </tr>`
        )
        .join("");
    }
  } catch (e) {
    console.error("Section liste-ventes :", e);
  }
}

/* ---------- STATISTIQUES & RAPPORT BAILLEUR (statistiques.html) -------- */
async function initStatistiques() {
  const cible = document.getElementById("classement-membres");
  if (!cible) return;

  let data;
  try {
    const reponse = await fetch(`${API_URL}/statistiques`);
    data = await reponse.json();
    if (!reponse.ok) {
      cible.innerHTML = data.erreur || "Le serveur a renvoyé une erreur.";
      return;
    }
  } catch (e) {
    cible.innerHTML = "Impossible de joindre l'API. Vérifiez que le backend est démarré (python app.py).";
    console.error(e);
    return;
  }

  try {
    const classement = trierClassementParVolume(data.classement_membres);
    cible.innerHTML = classement
      .map((c) => `<li>${c.nom} — ${c.volume_total} kg</li>`)
      .join("");
  } catch (e) {
    cible.innerHTML = "Classement : vérifiez trierClassementParVolume() dans functions.js.";
    console.error(e);
  }

  try {
    const tableauCultures = document.getElementById("tableau-cultures");
    if (tableauCultures) {
      tableauCultures.innerHTML = Object.entries(data.statistiques_par_culture)
        .map(([culture, stats]) => `
        <tr>
          <td>${culture}</td>
          <td>${stats.volume_total} kg</td>
          <td>${formaterMontant(stats.valeur_totale)}</td>
        </tr>`)
        .join("");
    }
  } catch (e) {
    console.error("Section tableau-cultures :", e);
  }

  try {
    const topAcheteurCible = document.getElementById("top-acheteur");
    if (topAcheteurCible && data.top_acheteur && data.top_acheteur.acheteur_nom) {
      topAcheteurCible.textContent = `${data.top_acheteur.acheteur_nom} (${data.top_acheteur.volume_total} kg achetés)`;
    }
  } catch (e) {
    console.error("Section top-acheteur :", e);
  }
}

async function initRapportBailleur() {
  const cible = document.getElementById("rapport-bailleur-contenu");
  if (!cible) return;
  try {
    const reponse = await fetch(`${API_URL}/rapport-bailleur`);
    const r = await reponse.json();
    document.getElementById("rb-volume").textContent = r.volume_total_periode + " kg";
    document.getElementById("rb-montant").textContent = formaterMontant(r.montant_ventes_periode);
    document.getElementById("rb-taux").textContent = r.taux_regularite_paiements + " %";
    document.getElementById("rb-membres").textContent = r.nb_membres_actifs;
  } catch (e) {
    console.error(e);
  }
}

/* ---------- Démarrage automatique ------------------------------------ */
window.addEventListener("DOMContentLoaded", () => {
  initDashboard();
  initMembres();
  initFiltresMembres();
  chargerLivraisons();
  initFormLivraison();
  initTriLivraisons();
  chargerPaiements();
  initFormPaiement();
  initVentesStock();
  initStatistiques();
  initRapportBailleur();
});
