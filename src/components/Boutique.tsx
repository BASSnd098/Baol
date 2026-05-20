import { useState } from "react";

// ============================================================
// 🔧 CONFIGURATION DU NUMÉRO WHATSAPP DE BAOL_TECHNOLOGIES
// ============================================================
const WHATSAPP_NUMBER = "221784634165";

// Format prix FCFA
const formatPrix = (p) => {
  const prixNum = typeof p === "number" ? p : Number(p) || 0;
  return prixNum.toLocaleString("fr-FR") + " FCFA";
};

// On reçoit "produits" depuis App.tsx pour que ce soit 100% dynamique
export default function Boutique({ produits }) {
  const [panier, setPanier] = useState([]);
  const [categorieActive, setCategorieActive] = useState("Tous");
  const [panierOuvert, setPanierOuvert] = useState(false);
  const [notification, setNotification] = useState("");

  // Catégories alignées avec ton Admin Panel
  const categories = ["Tous", "Ordinateurs", "IoT", "Réseaux", "Sécurité", "Stockage", "Logiciels"];

  // Sécurité si la liste est vide au chargement
  const listeProduits = produits || [];

  // Filtrage des produits de l'Admin
  const produitsFiltres =
    categorieActive === "Tous"
      ? listeProduits
      : listeProduits.filter((p) => p.categorie === categorieActive);

  const ajouterAuPanier = (produit) => {
    setPanier((prev) => {
      const exist = prev.find((p) => p.id === produit.id);
      if (exist) {
        return prev.map((p) =>
          p.id === produit.id ? { ...p, qte: p.qte + 1 } : p
        );
      }
      return [...prev, { ...produit, qte: 1 }];
    });
    setNotification(`✅ ${produit.nom} ajouté au panier`);
    setTimeout(() => setNotification(""), 2500);
  };

  const modifierQte = (id, delta) => {
    setPanier((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qte: p.qte + delta } : p))
        .filter((p) => p.qte > 0)
    );
  };

  const totalPanier = panier.reduce((acc, p) => acc + (Number(p.prix) || 0) * p.qte, 0);
  const nbArticles = panier.reduce((acc, p) => acc + p.qte, 0);

  const envoyerWhatsapp = () => {
    if (panier.length === 0) return;
    const lignes = panier
      .map((p) => `• ${p.nom} x${p.qte} — ${formatPrix(Number(p.prix) * p.qte)}`)
      .join("\n");
    
    const message = `Bonjour Baol_Technologies 👋\n\nJe souhaite commander du matériel :\n\n${lignes}\n\n*Total : ${formatPrix(totalPanier)}*\n\nMerci de me confirmer la disponibilité et la livraison.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-base-100 relative text-gray-800">
      {/* ── NOTIFICATION ── */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-2 rounded-full shadow-lg text-sm transition-all">
          {notification}
        </div>
      )}

      {/* ── HEADER BT_STORE ── */}
      <div className="bg-[#02101f] text-white py-12 px-6 text-center">
        <h1 className="text-4xl font-extrabold mb-2 italic">BT_<span className="text-blue-600">STORE</span></h1>
        <p className="text-white/70 text-base max-w-xl mx-auto font-medium">
          Matériel informatique premium & composants IoT — Sélectionnez vos articles et commandez directement via WhatsApp.
        </p>
      </div>

      {/* ── FILTRES CATÉGORIES ── */}
      <div className="flex justify-center gap-3 py-6 px-4 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategorieActive(cat)}
            className={`btn btn-sm rounded-full ${
              categorieActive === cat
                ? "btn-primary bg-blue-600 border-none text-white"
                : "btn-outline border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── GRILLE PRODUITS DYNAMIQUE ── */}
      {produitsFiltres.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto px-6 pb-32">
          {produitsFiltres.map((produit) => {
            const dansLePanier = panier.find((p) => p.id === produit.id);
            return (
              <div
                key={produit.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col border border-gray-100"
              >
                {/* Image */}
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={produit.img || "https://via.placeholder.com/300x200?text=Baol_Technologies"}
                    alt={produit.nom}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {!produit.stock && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-red-600 font-bold uppercase tracking-widest text-xs">Rupture</span>
                    </div>
                  )}
                </div>

                {/* Badge catégorie */}
                <div className="px-4 pt-3">
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                    {produit.categorie}
                  </span>
                </div>

                {/* Infos */}
                <div className="px-4 py-2 flex-1">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{produit.nom}</h3>
                  {produit.description && (
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{produit.description}</p>
                  )}
                </div>

                {/* Prix + bouton */}
                <div className="px-4 pb-4 flex items-center justify-between mt-2">
                  <span className="font-black text-gray-900 text-sm">{formatPrix(produit.prix)}</span>
                  
                  {dansLePanier ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => modifierQte(produit.id, -1)}
                        className="btn btn-xs btn-circle btn-outline border-gray-300"
                      >−</button>
                      <span className="text-sm font-bold w-4 text-center text-gray-800">{dansLePanier.qte}</span>
                      <button
                        onClick={() => modifierQte(produit.id, 1)}
                        className="btn btn-xs btn-circle btn-primary bg-blue-600 border-none"
                      >+</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => ajouterAuPanier(produit)}
                      disabled={!produit.stock}
                      className={`btn btn-xs rounded-full ${
                        produit.stock ? "btn-primary bg-black text-white hover:bg-blue-600 border-none" : "btn-disabled"
                      }`}
                    >
                      + Ajouter
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          Aucun équipement disponible pour le moment.
        </div>
      )}

      {/* ── BOUTON PANIER FLOTTANT ── */}
      {nbArticles > 0 && (
        <button
          onClick={() => setPanierOuvert(true)}
          className="fixed bottom-6 right-6 btn btn-primary bg-blue-600 border-none btn-lg rounded-full shadow-2xl z-40 gap-2 text-white"
        >
          🛒
          <span className="badge badge-sm bg-white text-blue-600 font-bold">{nbArticles}</span>
          {formatPrix(totalPanier)}
        </button>
      )}

      {/* ── BOUTON WHATSAPP RAPIDE FLOTTANT (FIXÉ À GAUCHE) ── */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour Baol_Technologies 👋, j'aimerais avoir des informations sur vos solutions de sécurité et matériels.")}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 left-6 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-2xl z-40 transition-all hover:scale-110"
        title="Discuter sur WhatsApp"
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.49 2.027 7.8L0 32l8.418-2.004A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.07 22.426c-.334.94-1.948 1.796-2.67 1.906-.683.104-1.543.148-2.489-.157-.574-.183-1.31-.427-2.253-.835-3.967-1.713-6.554-5.71-6.752-5.977-.197-.268-1.608-2.14-1.608-4.08 0-1.941 1.017-2.895 1.378-3.29.361-.394.786-.493 1.048-.493.262 0 .524.002.754.014.241.013.566-.092.885.675.334.8 1.134 2.763 1.233 2.963.099.2.165.434.033.7-.132.267-.198.433-.395.667-.197.233-.415.521-.592.7-.197.197-.402.41-.173.805.23.394 1.02 1.681 2.19 2.722 1.503 1.34 2.77 1.754 3.163 1.953.394.198.624.165.854-.1.23-.263.987-1.15 1.25-1.544.263-.394.526-.329.886-.197.361.131 2.294 1.082 2.687 1.278.394.197.657.296.754.46.099.165.099.955-.234 1.894z"/>
        </svg>
      </a>

      {/* ── DRAWER PANIER (OUVERTURE À DROITE) ── */}
      {panierOuvert && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPanierOuvert(false)} />
          <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl text-gray-800">
            
            {/* Header Panier */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-[#02101f] text-white">
              <h2 className="text-lg font-bold">🛒 Mon Panier ({nbArticles})</h2>
              <button onClick={() => setPanierOuvert(false)} className="btn btn-sm btn-circle btn-ghost text-white">✕</button>
            </div>

            {/* Articles */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {panier.length === 0 ? (
                <p className="text-gray-400 text-center mt-20">Votre panier est vide.</p>
              ) : (
                panier.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 border-b pb-4">
                    <img src={p.img || "https://via.placeholder.com/150"} alt={p.nom} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{p.nom}</p>
                      <p className="text-xs text-blue-600 font-semibold">{formatPrix(p.prix)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => modifierQte(p.id, -1)} className="btn btn-xs btn-circle btn-outline">−</button>
                      <span className="text-sm font-bold w-5 text-center">{p.qte}</span>
                      <button onClick={() => modifierQte(p.id, 1)} className="btn btn-xs btn-circle btn-primary bg-blue-600 border-none text-white">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Validation */}
            {panier.length > 0 && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex justify-between text-lg font-bold text-gray-800 mb-4">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrix(totalPanier)}</span>
                </div>
                <button
                  onClick={envoyerWhatsapp}
                  className="w-full btn bg-green-500 hover:bg-green-600 text-white border-none rounded-full gap-2 text-base font-bold shadow-md"
                >
                  Commander via WhatsApp
                </button>
                <button onClick={() => setPanier([])} className="w-full btn btn-ghost btn-sm text-gray-400 mt-2">
                  Vider le panier
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}