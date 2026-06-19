import { useState, useEffect } from "react";

import waveLogo       from '../assets/wave.png';
import orangeMoneyLogo from '../assets/OrangeMoney.png';
import freeMoneyLogo  from '../assets/free-money.png';

// ═══════════════════════════════════════════════════════════════════
//   CONFIGURATION
// ═══════════════════════════════════════════════════════════════════
const WHATSAPP_NUMBER = "221779300909";
const CART_KEY        = "baol_cart_v3";
const ORDERS_KEY      = "baol_orders_history_v1";
const API_URL         = "http://localhost:5000/api/orders"; // À adapter avec votre route backend Node.js

const formatPrix = (p: number | string) => {
  const n = typeof p === "number" ? p : Number(p) || 0;
  return n.toLocaleString("fr-FR") + " FCFA";
};

const genOrderId = () =>
  "BT-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 5).toUpperCase();

const CATEGORIES = ["Tous", "Ordinateurs", "IoT", "Réseaux", "Sécurité", "Stockage", "Logiciels"];

const PAYMENT_METHODS = [
  { id: "wave",         label: "Wave",                    icon: waveLogo,        color: "#1a85e8" },
  { id: "orange_money", label: "Orange Money",            icon: orangeMoneyLogo, color: "#ff6600" },
  { id: "free_money",   label: "Free Money",              icon: freeMoneyLogo,   color: "#00b050" },
  { id: "livraison",    label: "Paiement à la livraison", icon: "🚚",            color: "#6b7280" },
];

function getProductImage(product: any): string {
  if (typeof product.img === "string" && product.img.trim() && product.img !== "undefined") {
    return product.img.trim();
  }
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    const url = typeof first === "string" ? first : (first?.url || "");
    if (url.trim()) return url.trim();
  }
  return "/no-image.png";
}

// ═══════════════════════════════════════════════════════════════════
//   COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function BTStore({ produits = [] }: { produits: any[] }) {
  const [cart, setCart] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
  });
  
  const [ordersHistory, setOrdersHistory] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(ORDERS_KEY, JSON.stringify(ordersHistory)); }, [ordersHistory]);

  const [page,            setPage]            = useState("boutique");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartOpen,        setCartOpen]        = useState(false);
  const [toast,           setToast]           = useState<{ message: string; type: string } | null>(null);
  const [checkoutForm,    setCheckoutForm]    = useState({ nom: "", email: "", telephone: "", adresse: "" });
  const [paymentMethod,   setPaymentMethod]   = useState("");
  const [loading,         setLoading]         = useState(false);

  const showToast = (message: string, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.nom} ajouté au panier`);
  };

  const removeFromCart = (id: string | number) => setCart(prev => prev.filter(item => item.id !== id));

  const updateQuantity = (id: string | number, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const newQty = item.qty + delta;
        return newQty <= 0 ? null : { ...item, qty: newQty };
      }).filter((item): item is any => item !== null)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.prix) || 0) * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) { showToast("Votre panier est vide", "error"); return; }
    setPage("checkout");
    setCartOpen(false);
  };

  const submitOrder = async () => {
    if (!checkoutForm.nom || !checkoutForm.telephone || !checkoutForm.adresse) {
      showToast("Veuillez remplir tous les champs obligatoires", "error"); return;
    }
    if (!paymentMethod) {
      showToast("Veuillez choisir un moyen de paiement", "error"); return;
    }

    setLoading(true);
    const orderId = genOrderId();
    const pm      = PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label || paymentMethod;

    const orderData = {
      orderId,
      client: checkoutForm,
      produits: cart.map(item => ({
        id: item.id,
        nom: item.nom,
        prix: item.prix,
        qty: item.qty
      })),
      total: cartTotal,
      methodePaiement: pm,
      statut: "En attente",
      date: new Date().toISOString()
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Erreur serveur lors de l'enregistrement");

      setOrdersHistory(prev => [orderData, ...prev]);

      const lignes  = cart.map(item => `• ${item.nom} ×${item.qty} = ${formatPrix(Number(item.prix) * item.qty)}`).join("\n");
      const message =
        `🛒 *NOUVELLE COMMANDE — Baol Technologies*\n\n` +
        `📋 Référence: ${orderId}\n` +
        `👤 Client: ${checkoutForm.nom}\n` +
        `📞 Tél: ${checkoutForm.telephone}\n` +
        `📍 Adresse: ${checkoutForm.adresse}\n` +
        `💳 Paiement: ${pm}\n\n` +
        `📦 *Produits:*\n${lignes}\n\n` +
        `💰 *Total: ${formatPrix(cartTotal)}*`;

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
      
      setCart([]);
      setPage("success");
      setCheckoutForm({ nom: "", email: "", telephone: "", adresse: "" });
      setPaymentMethod("");
    } catch (err) {
      console.error(err);
      showToast("Impossible d'enregistrer la commande en BDD. Tentative WhatsApp...", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!produits.length) return;
    setCart(prev => prev.filter(item => {
      const found = produits.find(p => p.id === item.id);
      return found && found.stock;
    }));
  }, [produits]);

  return (
    <div style={{ background: "#f5f4f0", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {page !== "success" && (
        <Navbar setPage={setPage} setSelectedProduct={setSelectedProduct} setCartOpen={setCartOpen} cartCount={cartCount} />
      )}

      {page === "boutique" && (
        <BoutiquePage
          produits={produits}
          cart={cart}
          updateQuantity={updateQuantity}
          addToCart={addToCart}
          setSelectedProduct={setSelectedProduct}
          setPage={setPage}
        />
      )}
      {page === "detail" && selectedProduct && (
        <DetailPage
          selectedProduct={selectedProduct}
          setPage={setPage}
          addToCart={addToCart}
          cart={cart}
        />
      )}
      {page === "checkout" && (
        <CheckoutPage
          checkoutForm={checkoutForm}
          setCheckoutForm={setCheckoutForm}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          cartTotal={cartTotal}
          submitOrder={submitOrder}
          loading={loading}
        />
      )}
      {page === "orders" && (
        <OrdersHistoryPage orders={ordersHistory} setPage={setPage} />
      )}
      {page === "success" && <SuccessPage setPage={setPage} />}

      <CartDrawer
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        cart={cart}
        cartCount={cartCount}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        cartTotal={cartTotal}
        handleCheckout={handleCheckout}
      />

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour Baol Technologies 👋")}`}
        target="_blank"
        rel="noreferrer"
        style={{ position: "fixed", bottom: 16, left: 16, width: 48, height: 48, background: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", zIndex: 40 }}
      >
        <svg viewBox="0 0 32 32" width="20" height="20" fill="white">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.49 2.027 7.8L0 32l8.418-2.004A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.07 22.426c-.334.94-1.948 1.796-2.67 1.906-.683.104-1.543.148-2.489-.157-.574-.183-1.31-.427-2.253-.835-3.967-1.713-6.554-5.71-6.752-5.977-.197-.268-1.608-2.14-1.608-4.08 0-1.941 1.017-2.895 1.378-3.29.361-.394.786-.493 1.048-.493.262 0 .524.002.754.014.241.013.566-.092.885.675.334.8 1.134 2.763 1.233 2.963.099.2.165.434.033.7-.132.267-.198.433-.395.667-.197.233-.415.521-.592.7-.197.197-.402.41-.173.805.23.394 1.02 1.681 2.19 2.722 1.503 1.34 2.77 1.754 3.163 1.953.394.198.624.165.854-.1.23-.263.987-1.15 1.25-1.544.263-.394.526-.329.886-.197.361.131 2.294 1.082 2.687 1.278.394.197.657.296.754.46.099.165.099.955-.234 1.894z" />
        </svg>
      </a>

      {toast && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: toast.type === "error" ? "#ef4444" : "#10b981", color: "#fff", padding: "10px 20px", borderRadius: 50, zIndex: 1000, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   NAVBAR
// ═══════════════════════════════════════════════════════════════════
function Navbar({ setPage, setSelectedProduct, setCartOpen, cartCount }: any) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,244,240,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e5e7eb", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
      <button onClick={() => { setPage("boutique"); setSelectedProduct(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 800, color: "#0f1623" }}>
        BT_<span style={{ color: "#1e40af" }}>STORE</span>
      </button>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setPage("orders")} style={{ background: "transparent", border: "1px solid #d1d5db", borderRadius: 50, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
          📦 Mes commandes
        </button>
        <button onClick={() => setCartOpen(true)} style={{ position: "relative", background: "#0f1623", color: "#fff", border: "none", borderRadius: 50, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          🛒
          {cartCount > 0 && (
            <span style={{ background: "#1e40af", borderRadius: 50, minWidth: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{cartCount}</span>
          )}
        </button>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   PRODUCT CARD
// ═══════════════════════════════════════════════════════════════════
function ProductCard({ product, cart, updateQuantity, addToCart, setSelectedProduct, setPage }: any) {
  const cartItem = cart.find((item: any) => item.id === product.id);
  const imgSrc = getProductImage(product);

  return (
    <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ height: 160, overflow: "hidden", position: "relative", background: "#f3f4f6", cursor: "pointer" }} onClick={() => { setSelectedProduct(product); setPage("detail"); }}>
        <img src={imgSrc} alt={product.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {!product.stock && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#dc2626", fontWeight: 700, fontSize: 11 }}>Rupture</span>
          </div>
        )}
        <span style={{ position: "absolute", top: 8, left: 8, background: "#1e40af", color: "white", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 50 }}>
          {product.categorie}
        </span>
      </div>

      <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <h3 style={{ fontWeight: 700, fontSize: 13, color: "#0f1623", margin: 0, lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", cursor: "pointer" }} onClick={() => { setSelectedProduct(product); setPage("detail"); }}>
          {product.nom}
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: "#1e40af" }}>{formatPrix(product.prix)}</span>
          {cartItem ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f3f4f6", borderRadius: 50, padding: "2px 4px" }}>
              <button onClick={() => updateQuantity(product.id, -1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "#fff", fontWeight: "bold" }}>−</button>
              <span style={{ fontWeight: 700, fontSize: 12 }}>{cartItem.qty}</span>
              <button onClick={() => updateQuantity(product.id, 1)}  style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "#0f1623", color: "#fff", fontWeight: "bold" }}>+</button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product)}
              disabled={!product.stock}
              style={{ width: "100%", padding: "8px", borderRadius: 50, border: "none", background: product.stock ? "#0f1623" : "#d1d5db", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              + Ajouter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   BOUTIQUE PAGE
// ═══════════════════════════════════════════════════════════════════
function BoutiquePage({ produits, cart, updateQuantity, addToCart, setSelectedProduct, setPage }: any) {
  const [categorie, setCategorie] = useState("Tous");
  const [search,    setSearch]    = useState("");

  const filtered = produits.filter((p: any) =>
    (categorie === "Tous" || p.categorie === categorie) &&
    (search === "" || p.nom.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: "16px 12px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ textShadow: "none", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f1623", margin: "0 0 4px" }}>
          Infrastructure <span style={{ color: "#1e40af" }}>Baol Tech</span>
        </h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Qualité et solutions pros clé en main.</p>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Rechercher un équipement..."
        style={{ width: "100%", boxSizing: "border-box", padding: "12px 16px", borderRadius: 50, border: "1.5px solid #e5e7eb", outline: "none", fontSize: 14, marginBottom: 16 }}
      />

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 16, width: "100%", WebkitOverflowScrolling: "touch" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategorie(c)}
            style={{ padding: "6px 14px", borderRadius: 50, fontSize: 12, fontWeight: 600, border: "1.5px solid", background: categorie === c ? "#0f1623" : "#fff", color: categorie === c ? "#fff" : "#374151", borderColor: categorie === c ? "#0f1623" : "#e5e7eb", whiteSpace: "nowrap", cursor: "pointer" }}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>Aucun résultat.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))", gap: 12 }}>
          {filtered.map((product: any) => (
            <ProductCard key={product.id} product={product} cart={cart} updateQuantity={updateQuantity} addToCart={addToCart} setSelectedProduct={setSelectedProduct} setPage={setPage} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════
function DetailPage({ selectedProduct: p, setPage, addToCart, cart }: any) {
  const displayImages = p.images && p.images.length > 0 ? p.images : [getProductImage(p)];
  const cartItem = cart.find((item: any) => item.id === p.id);

  return (
    <div style={{ padding: "16px 12px", maxWidth: 800, margin: "0 auto" }}>
      <button onClick={() => setPage("boutique")} style={{ background: "none", border: "none", color: "#6b7280", marginBottom: 16, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        ← Boutique
      </button>

      <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ height: 240, background: "#f3f4f6", borderRadius: 12, overflow: "hidden" }}>
          <img src={displayImages[0]} alt={p.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ background: "#EEF2FF", color: "#1e40af", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 50, width: "fit-content" }}>{p.categorie}</span>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0f1623", margin: 0 }}>{p.nom}</h1>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#1e40af" }}>{formatPrix(p.prix)}</span>
          <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.5, margin: 0 }}>{p.description}</p>
          
          {cartItem ? (
            <div style={{ padding: 12, background: "#d1fae5", color: "#059669", borderRadius: 8, textAlign: "center", fontWeight: 700, fontSize: 13 }}>
              ✓ {cartItem.qty} unité(s) au panier
            </div>
          ) : (
            <button onClick={() => addToCart(p)} disabled={!p.stock} style={{ width: "100%", padding: "12px", background: p.stock ? "#0f1623" : "#d1d5db", color: "#fff", border: "none", borderRadius: 50, fontWeight: 600, fontSize: 14 }}>
              {p.stock ? "Ajouter au panier" : "Rupture de stock"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   CHECKOUT PAGE
// ═══════════════════════════════════════════════════════════════════
function CheckoutPage({ checkoutForm, setCheckoutForm, paymentMethod, setPaymentMethod, cartTotal, submitOrder, loading }: any) {
  const set = (k: string, v: any) => setCheckoutForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div style={{ padding: "16px 12px", maxWidth: 500, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Finaliser la commande</h2>
      
      <div style={{ background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Nom complet *" value={checkoutForm.nom} onChange={e => set("nom", e.target.value)} style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        <input placeholder="Téléphone *" value={checkoutForm.telephone} onChange={e => set("telephone", e.target.value)} style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        <input placeholder="Adresse de livraison *" value={checkoutForm.adresse} onChange={e => set("adresse", e.target.value)} style={{ padding: 12, borderRadius: 8, border: "1px solid #cbd5e1" }} />
        
        <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>Moyen de paiement</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {PAYMENT_METHODS.map(m => (
            <div key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ border: `2px solid ${paymentMethod === m.id ? m.color : "#e5e7eb"}`, padding: 10, borderRadius: 8, textAlign: "center", cursor: "pointer", background: paymentMethod === m.id ? `${m.color}10` : "#fff" }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, marginBottom: 12 }}>
            <span>Total :</span>
            <span>{formatPrix(cartTotal)}</span>
          </div>
          <button onClick={submitOrder} disabled={loading} style={{ width: "100%", padding: 14, background: "#1e40af", color: "#fff", border: "none", borderRadius: 50, fontWeight: 700, fontSize: 14 }}>
            {loading ? "Traitement..." : "Confirmer et Commander"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   HISTORIQUE DES COMMANDES CLIENT
// ═══════════════════════════════════════════════════════════════════
function OrdersHistoryPage({ orders, setPage }: { orders: any[]; setPage: (p: string) => void }) {
  return (
    <div style={{ padding: "16px 12px", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Historique de commandes</h2>
        <button onClick={() => setPage("boutique")} style={{ background: "none", border: "none", color: "#1e40af", fontWeight: 600, fontSize: 13 }}>Retour boutique</button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textShadow: "none", textAlign: "center", background: "#fff", padding: 32, borderRadius: 12, border: "1px solid #e5e7eb", color: "#6b7280" }}>
          Vous n'avez pas encore passé de commande.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((o, idx) => (
            <div key={idx} style={{ background: "#fff", padding: 14, borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: 6 }}>
                <span style={{ color: "#1e40af" }}>{o.orderId}</span>
                <span style={{ background: "#fef3c7", color: "#d97706", padding: "2px 8px", borderRadius: 50, fontSize: 11 }}>{o.statut}</span>
              </div>
              <p style={{ color: "#6b7280", margin: "2px 0" }}>Date : {new Date(o.date).toLocaleDateString("fr-FR")}</p>
              <div style={{ margin: "8px 0", borderTop: "1px dashed #e5e7eb", paddingTop: 6 }}>
                {o.produits.map((p: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", color: "#374151" }}>
                    <span>{p.nom} (x{p.qty})</span>
                    <span>{formatPrix(p.prix * p.qty)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: 4, fontSize: 14, color: "#0f1623" }}>
                <span>Total payé :</span>
                <span>{formatPrix(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   CART DRAWER
// ═══════════════════════════════════════════════════════════════════
function CartDrawer({ cartOpen, setCartOpen, cart, cartCount, updateQuantity, removeFromCart, cartTotal, handleCheckout }: any) {
  return (
    <>
      {cartOpen && <div onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 150 }} />}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: 380, background: "#fff", zIndex: 200, display: "flex", flexDirection: "column", transform: cartOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.25s ease" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f1623", color: "#fff" }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Panier ({cartCount})</span>
          <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 40, color: "#9ca3af" }}>Votre panier est vide</div>
          ) : cart.map((item: any) => (
            <div key={item.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{item.nom}</p>
                <span style={{ fontSize: 12, color: "#1e40af", fontWeight: 700 }}>{formatPrix(item.prix)}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <button onClick={() => updateQuantity(item.id, -1)} style={{ width: 22, height: 22 }}>-</button>
                  <span style={{ fontSize: 12 }}>{item.qty}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} style={{ width: 22, height: 22 }}>+</button>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none" }}>🗑️</button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: "16px", borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: "#1e40af" }}>{formatPrix(cartTotal)}</span>
            </div>
            <button onClick={handleCheckout} style={{ width: "100%", padding: "12px", background: "#0f1623", color: "#fff", border: "none", borderRadius: 50, fontWeight: 600 }}>
              Passer la commande
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SuccessPage({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div style={{ padding: "40px 16px", textAlign: "center" }}>
      <h2 style={{ color: "#10b981", fontSize: 24, fontWeight: 800 }}>Commande enregistrée ! 🎉</h2>
      <p style={{ color: "#4b5563", fontSize: 14, margin: "8px 0 24px" }}>Votre commande a été traitée en base de données et l'onglet de confirmation WhatsApp a été initié.</p>
      <button onClick={() => setPage("boutique")} style={{ padding: "12px 24px", background: "#0f1623", color: "#fff", border: "none", borderRadius: 50, fontWeight: 600 }}>Retourner à l'accueil</button>
    </div>
  );
}