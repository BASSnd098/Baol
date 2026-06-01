import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════
//   CONFIGURATION
// ═══════════════════════════════════════════════════════════════════
const WHATSAPP_NUMBER = "221784634165";
const CART_KEY = "baol_cart_v3";

const formatPrix = (p: number | string) => {
  const n = typeof p === "number" ? p : Number(p) || 0;
  return n.toLocaleString("fr-FR") + " FCFA";
};

const genOrderId = () =>
  "BT-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 5).toUpperCase();

const CATEGORIES = ["Tous", "Ordinateurs", "IoT", "Réseaux", "Sécurité", "Stockage", "Logiciels"];

const PAYMENT_METHODS = [
  { id: "wave", label: "Wave", icon: "💙", color: "#1a85e8" },
  { id: "orange_money", label: "Orange Money", icon: "🟠", color: "#ff6600" },
  { id: "free_money", label: "Free Money", icon: "💚", color: "#00b050" },
  { id: "livraison", label: "Paiement à la livraison", icon: "🚚", color: "#6b7280" },
];

// ═══════════════════════════════════════════════════════════════════
//   COMPOSANT PRINCIPAL — reçoit `produits` depuis App.tsx
// ═══════════════════════════════════════════════════════════════════
export default function BTStore({ produits = [] }: { produits: any[] }) {
  // Panier persisté en localStorage
  const [cart, setCart] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const [page, setPage] = useState("boutique");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({ nom: "", email: "", telephone: "", adresse: "" });
  const [paymentMethod, setPaymentMethod] = useState("");

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
      }).filter((Boolean as any) as (value: any) => value is any)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.prix) || 0) * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) { showToast("Votre panier est vide", "error"); return; }
    setPage("checkout");
    setCartOpen(false);
  };

  const submitOrder = () => {
    if (!checkoutForm.nom || !checkoutForm.telephone || !checkoutForm.adresse) {
      showToast("Veuillez remplir tous les champs obligatoires", "error"); return;
    }
    if (!paymentMethod) {
      showToast("Veuillez choisir un moyen de paiement", "error"); return;
    }
    const orderId = genOrderId();
    const pm = PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label || paymentMethod;
    const lignes = cart.map(item => `• ${item.nom} ×${item.qty} = ${formatPrix(Number(item.prix) * item.qty)}`).join("\n");
    const message =
      `🛒 *NOUVELLE COMMANDE — Baol Technologies*\n\n` +
      `📋 Référence: ${orderId}\n` +
      `👤 Client: ${checkoutForm.nom}\n` +
      `📞 Tél: ${checkoutForm.telephone}\n` +
      `📧 Email: ${checkoutForm.email || "—"}\n` +
      `📍 Adresse: ${checkoutForm.adresse}\n` +
      `💳 Paiement: ${pm}\n\n` +
      `📦 *Produits:*\n${lignes}\n\n` +
      `💰 *Total: ${formatPrix(cartTotal)}*`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    setCart([]);
    setPage("success");
    setCheckoutForm({ nom: "", email: "", telephone: "", adresse: "" });
    setPaymentMethod("");
  };

  // Synchronisation du panier : si un produit a été supprimé ou mis en rupture par l'admin,
  // on nettoie automatiquement le panier au montage suivant.
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
          produits={produits}
          setPage={setPage}
          setSelectedProduct={setSelectedProduct}
          addToCart={addToCart}
          cart={cart}
        />
      )}
      {page === "checkout" && (
        <CheckoutPage
          setPage={setPage}
          checkoutForm={checkoutForm}
          setCheckoutForm={setCheckoutForm}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          cart={cart}
          cartTotal={cartTotal}
          submitOrder={submitOrder}
        />
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

      {/* WhatsApp flottant */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour Baol_Technologies 👋, j'aimerais avoir des informations sur vos solutions.")}`}
        target="_blank"
        rel="noreferrer"
        style={{ position: "fixed", bottom: 24, left: 24, width: 52, height: 52, background: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 40, transition: "transform 0.2s" }}
        title="Discuter sur WhatsApp"
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <svg viewBox="0 0 32 32" width="24" height="24" fill="white">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.49 2.027 7.8L0 32l8.418-2.004A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.07 22.426c-.334.94-1.948 1.796-2.67 1.906-.683.104-1.543.148-2.489-.157-.574-.183-1.31-.427-2.253-.835-3.967-1.713-6.554-5.71-6.752-5.977-.197-.268-1.608-2.14-1.608-4.08 0-1.941 1.017-2.895 1.378-3.29.361-.394.786-.493 1.048-.493.262 0 .524.002.754.014.241.013.566-.092.885.675.334.8 1.134 2.763 1.233 2.963.099.2.165.434.033.7-.132.267-.198.433-.395.667-.197.233-.415.521-.592.7-.197.197-.402.41-.173.805.23.394 1.02 1.681 2.19 2.722 1.503 1.34 2.77 1.754 3.163 1.953.394.198.624.165.854-.1.23-.263.987-1.15 1.25-1.544.263-.394.526-.329.886-.197.361.131 2.294 1.082 2.687 1.278.394.197.657.296.754.46.099.165.099.955-.234 1.894z" />
        </svg>
      </a>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: toast.type === "error" ? "#ef4444" : "#10b981", color: "#fff", padding: "10px 20px", borderRadius: 50, zIndex: 1000, fontSize: 14, fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", whiteSpace: "nowrap" }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   NAVBAR
// ═══════════════════════════════════════════════════════════════════
function Navbar({ setPage, setSelectedProduct, setCartOpen, cartCount }: { setPage: (p: string) => void; setSelectedProduct: (p: any) => void; setCartOpen: (o: boolean) => void; cartCount: number }) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(245,244,240,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e5e7eb", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
      <button onClick={() => { setPage("boutique"); setSelectedProduct(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, fontWeight: 800, color: "#0f1623" }}>
        BT_<span style={{ color: "#1e40af" }}>STORE</span>
      </button>
      <button onClick={() => setCartOpen(true)} style={{ position: "relative", background: "#0f1623", color: "#fff", border: "none", borderRadius: 50, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        🛒 Panier
        {cartCount > 0 && (
          <span style={{ background: "#1e40af", borderRadius: 50, minWidth: 20, height: 20, padding: "0 4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{cartCount}</span>
        )}
      </button>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   PRODUCT CARD
// ═══════════════════════════════════════════════════════════════════
function ProductCard({ product, cart, updateQuantity, addToCart, setSelectedProduct, setPage }: { product: any; cart: any[]; updateQuantity: (id: string | number, delta: number) => void; addToCart: (p: any) => void; setSelectedProduct: (p: any) => void; setPage: (p: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const cartItem = cart.find(item => item.id === product.id);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb", transition: "all 0.25s", transform: hovered ? "translateY(-4px)" : "none", boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}
    >
      <div style={{ height: 200, overflow: "hidden", position: "relative", cursor: "pointer", background: "#f3f4f6" }}
        onClick={() => { setSelectedProduct(product); setPage("detail"); }}>
        <img src={product.img || "https://via.placeholder.com/400x200?text=Baol+Technologies"} alt={product.nom}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s", transform: hovered ? "scale(1.06)" : "scale(1)" }} />
        {!product.stock && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#dc2626", fontWeight: 700, fontSize: 13 }}>Rupture de stock</span>
          </div>
        )}
        {/* Badge catégorie */}
        <span style={{ position: "absolute", top: 10, left: 10, background: "#1e40af", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 50, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {product.categorie}
        </span>
      </div>

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: "#0f1623", margin: 0, cursor: "pointer", lineHeight: 1.3 }}
            onClick={() => { setSelectedProduct(product); setPage("detail"); }}>
            {product.nom}
          </h3>
          {product.description && (
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>
              {product.description}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#0f1623" }}>{formatPrix(product.prix)}</span>
          {cartItem ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => updateQuantity(product.id, -1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 15 }}>−</button>
              <span style={{ fontWeight: 700, minWidth: 16, textAlign: "center" }}>{cartItem.qty}</span>
              <button onClick={() => updateQuantity(product.id, 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#0f1623", color: "#fff", cursor: "pointer", fontSize: 15 }}>+</button>
            </div>
          ) : (
            <button onClick={() => addToCart(product)} disabled={!product.stock}
              style={{ padding: "8px 16px", borderRadius: 50, border: "none", background: product.stock ? "#0f1623" : "#d1d5db", color: "#fff", fontSize: 12, fontWeight: 600, cursor: product.stock ? "pointer" : "not-allowed", transition: "background 0.15s" }}>
              + Ajouter
            </button>
          )}
        </div>

        {/* Bouton voir détails */}
        <button onClick={() => { setSelectedProduct(product); setPage("detail"); }}
          style={{ width: "100%", padding: "7px", background: "transparent", border: "1px solid #e5e7eb", borderRadius: 50, fontSize: 12, fontWeight: 500, color: "#6b7280", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "#1e40af"; (e.target as HTMLElement).style.color = "#1e40af"; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "#e5e7eb"; (e.target as HTMLElement).style.color = "#6b7280"; }}>
          Voir les détails →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   BOUTIQUE PAGE
// ═══════════════════════════════════════════════════════════════════
function BoutiquePage({ produits, cart, updateQuantity, addToCart, setSelectedProduct, setPage }: { produits: any[]; cart: any[]; updateQuantity: (id: string | number, delta: number) => void; addToCart: (p: any) => void; setSelectedProduct: (p: any) => void; setPage: (p: string) => void }) {
  const [categorie, setCategorie] = useState("Tous");
  const [search, setSearch] = useState("");

  const filtered = produits.filter(p =>
    (categorie === "Tous" || p.categorie === categorie) &&
    (search === "" || p.nom.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,42px)", fontWeight: 800, marginBottom: 12, color: "#0f1623", letterSpacing: "-0.02em" }}>
          Équipez votre <span style={{ color: "#1e40af" }}>infrastructure</span>
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15 }}>Informatique, IoT, Réseaux, Sécurité — Qualité professionnelle</p>
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategorie(c)}
              style={{ padding: "7px 16px", borderRadius: 50, fontSize: 13, fontWeight: 600, border: "1.5px solid", background: categorie === c ? "#0f1623" : "#fff", color: categorie === c ? "#fff" : "#374151", borderColor: categorie === c ? "#0f1623" : "#e5e7eb", cursor: "pointer", transition: "all 0.15s" }}>
              {c}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..."
          style={{ padding: "9px 16px", borderRadius: 50, border: "1.5px solid #e5e7eb", outline: "none", width: 220, fontSize: 14 }} />
      </div>

      {/* Résultats */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>📭</p>
          <p style={{ fontSize: 15 }}>{produits.length === 0 ? "Aucun produit dans le catalogue." : "Aucun résultat pour cette recherche."}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
          {filtered.map(product => (
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
function DetailPage({ selectedProduct: p, produits, setPage, setSelectedProduct, addToCart, cart }: { selectedProduct: any; produits: any[]; setPage: (page: string) => void; setSelectedProduct: (p: any) => void; addToCart: (p: any) => void; cart: any[] }) {
  const [activeImg, setActiveImg] = useState(0);
  const images = (p.images && p.images.length > 0) ? p.images : [p.img].filter(Boolean);
  const cartItem = cart.find(item => item.id === p.id);
  const similaires = produits.filter(x => x.categorie === p.categorie && x.id !== p.id).slice(0, 4);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <button onClick={() => { setPage("boutique"); setSelectedProduct(null); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", marginBottom: 28, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
        ← Retour à la boutique
      </button>

      <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 40 }}>
        {/* Galerie */}
        <div>
          <div style={{ borderRadius: 14, overflow: "hidden", background: "#f3f4f6", height: 340, marginBottom: 12, cursor: "zoom-in" }}>
            <img src={images[activeImg] || "https://via.placeholder.com/600x400"} alt={p.nom}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.transform = "scale(1.06)"}
              onMouseLeave={e => (e.target as HTMLElement).style.transform = "scale(1)"} />
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {images.map((img: string, i: number) => (
                <div key={i} onClick={() => setActiveImg(i)}
                  style={{ width: 66, height: 58, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: `2px solid ${activeImg === i ? "#1e40af" : "transparent"}`, opacity: activeImg === i ? 1 : 0.55, transition: "all 0.15s" }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ background: "#EEF2FF", color: "#1e40af", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 50, textTransform: "uppercase", letterSpacing: "0.08em", alignSelf: "flex-start" }}>{p.categorie}</span>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f1623", lineHeight: 1.2, letterSpacing: "-0.02em" }}>{p.nom}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: "#1e40af" }}>{formatPrix(p.prix)}</span>
            <span style={{ fontSize: 11, color: p.stock ? "#059669" : "#ef4444", background: p.stock ? "#d1fae5" : "#fee2e2", padding: "3px 10px", borderRadius: 50, fontWeight: 700 }}>
              {p.stock ? "✓ En stock" : "✕ Rupture"}
            </span>
          </div>
          <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7 }}>{p.descriptionComplete || p.description}</p>

          {/* Specs */}
          {p.specs && Object.keys(p.specs).length > 0 && (
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Caractéristiques</p>
              {Object.entries(p.specs).map(([k, v]: [string, any]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #e5e7eb", fontSize: 13 }}>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>{k}</span>
                  <span style={{ color: "#0f1623", fontWeight: 600, textAlign: "right", maxWidth: "55%" }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {cartItem ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#059669", fontWeight: 600, fontSize: 13 }}>✓ {cartItem.qty} dans le panier</span>
            </div>
          ) : (
            <button onClick={() => addToCart(p)} disabled={!p.stock}
              style={{ padding: "13px 28px", background: p.stock ? "#0f1623" : "#d1d5db", color: "#fff", border: "none", borderRadius: 50, fontSize: 15, fontWeight: 600, cursor: p.stock ? "pointer" : "not-allowed", width: "100%", transition: "background 0.15s" }}>
              {p.stock ? "Ajouter au panier" : "Rupture de stock"}
            </button>
          )}
        </div>
      </div>

      {/* Produits similaires */}
      {similaires.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "#0f1623" }}>Produits similaires</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
            {similaires.map(s => (
              <ProductCard key={s.id} product={s} cart={cart}
                updateQuantity={() => {}} addToCart={addToCart}
                setSelectedProduct={setSelectedProduct} setPage={setPage} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   CART DRAWER
// ═══════════════════════════════════════════════════════════════════
function CartDrawer({ cartOpen, setCartOpen, cart, cartCount, updateQuantity, removeFromCart, cartTotal, handleCheckout }: { cartOpen: boolean; setCartOpen: (o: boolean) => void; cart: any[]; cartCount: number; updateQuantity: (id: string | number, delta: number) => void; removeFromCart: (id: string | number) => void; cartTotal: number; handleCheckout: () => void }) {
  return (
    <>
      {cartOpen && <div onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 150 }} />}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: 420, background: "#fff", zIndex: 200, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", transform: cartOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s ease" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f1623", color: "#fff" }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>🛒 Panier ({cartCount})</span>
          <button onClick={() => setCartOpen(false)} style={{ background: "none", backgroundColor: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>🛒</p>
              <p style={{ fontSize: 14 }}>Votre panier est vide</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
              <img src={item.img || "https://via.placeholder.com/60"} alt={item.nom} style={{ width: 56, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: "#0f1623", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nom}</p>
                <p style={{ fontSize: 12, color: "#1e40af", fontWeight: 600, margin: "2px 0 6px" }}>{formatPrix(item.prix)}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => updateQuantity(item.id, -1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>−</button>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{item.qty}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "#0f1623", color: "#fff", cursor: "pointer" }}>+</button>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{formatPrix(Number(item.prix) * item.qty)}</span>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>🗑️</button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontWeight: 700 }}>
              <span style={{ color: "#374151" }}>Total</span>
              <span style={{ fontSize: 18, color: "#1e40af" }}>{formatPrix(cartTotal)}</span>
            </div>
            <button onClick={handleCheckout} style={{ width: "100%", padding: "12px", background: "#0f1623", color: "#fff", border: "none", borderRadius: 50, fontWeight: 600, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 12px rgba(15,22,35,0.15)" }}>
              Commander →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   CHECKOUT PAGE
// ═══════════════════════════════════════════════════════════════════
function CheckoutPage({ setPage, checkoutForm, setCheckoutForm, paymentMethod, setPaymentMethod, cart, cartTotal, submitOrder }: { setPage: (p: string) => void; checkoutForm: any; setCheckoutForm: React.Dispatch<React.SetStateAction<any>>; paymentMethod: string; setPaymentMethod: (m: string) => void; cart: any[]; cartTotal: number; submitOrder: () => void }) {
  const set = (k: string, v: any) => setCheckoutForm((f: any) => ({ ...f, [k]: v }));
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      <button onClick={() => setPage("boutique")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", marginBottom: 28, fontWeight: 600, fontSize: 14 }}>← Retour</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 32, color: "#0f1623" }}>Finaliser la commande</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
        <div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18, color: "#0f1623", fontSize: 15 }}>Informations de livraison</h3>
            {[
              { key: "nom", label: "Nom complet *", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "telephone", label: "Téléphone *", type: "tel" },
            ].map((f: any) => (
              <input key={f.key} type={f.type} placeholder={f.label} value={checkoutForm[f.key]}
                onChange={e => set(f.key, e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 12, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            ))}
            <textarea placeholder="Adresse de livraison *" value={checkoutForm.adresse} onChange={e => set("adresse", e.target.value)} rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18, color: "#0f1623", fontSize: 15 }}>Moyen de paiement</h3>
            {PAYMENT_METHODS.map(pm => (
              <div key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                style={{ padding: "13px 16px", borderRadius: 12, cursor: "pointer", border: `2px solid ${paymentMethod === pm.id ? pm.color : "#e5e7eb"}`, background: paymentMethod === pm.id ? pm.color + "10" : "#fff", marginBottom: 10, display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
                <span style={{ fontSize: 20 }}>{pm.icon}</span>
                <span style={{ fontWeight: 600, color: "#374151", fontSize: 14 }}>{pm.label}</span>
                {paymentMethod === pm.id && <span style={{ marginLeft: "auto", color: pm.color, fontWeight: 700 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, border: "1px solid #e5e7eb", alignSelf: "start", position: "sticky", top: 80 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: "#0f1623", fontSize: 15 }}>Récapitulatif</h3>
          {cart.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: "#374151" }}>{item.nom} ×{item.qty}</span>
              <span style={{ fontWeight: 600 }}>{formatPrix(Number(item.prix) * item.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: "#1e40af", fontSize: 17 }}>{formatPrix(cartTotal)}</span>
          </div>
          <button onClick={submitOrder}
            style={{ width: "100%", marginTop: 18, padding: "13px", background: "#0f1623", color: "#fff", border: "none", borderRadius: 50, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            Confirmer via WhatsApp 📲
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//   SUCCESS PAGE
// ═══════════════════════════════════════════════════════════════════
function SuccessPage({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, background: "#d1fae5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>✓</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12, color: "#0f1623" }}>Commande confirmée !</h1>
      <p style={{ color: "#6b7280", marginBottom: 32, lineHeight: 1.5 }}>Merci pour votre commande.</p>
    </div>
  );
}