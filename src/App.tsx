import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider }   from "./context/AuthContext";
import Navbar             from "./components/Navbar";
import Hero               from "./components/Hero";
import Footer             from "./components/Footer";
import Boutique           from "./components/Boutique";
import AdminDashboard     from "./components/AdminDashboard";
import AdminLogin         from "./components/AdminLogin";
import ProtectedRoute     from "./components/ProtectedRoute";
import ServicesSimple     from "./components/Services";
import ServicesDetail     from "./components/ServicesAndValues";
import Apropos            from "./components/Apropos";
import Contact            from "./components/Contact.tsx";

// @ts-ignore
import { getProducts }    from "./api/api.js";

// Interface pour correspondre au typage attendu par le Dashboard et la Boutique
interface Produit {
  id: string | number;
  nom: string;
  prix: number;
  categorie: string;
  description: string;
  stock: boolean;
  img: string;
  images: string[];
  specs: Record<string, string>;
}

// Convertir format API → format frontend avec typage explicite de l'argument
const formatProduct = (p: any): Produit => ({
  id:          p._id,
  nom:         p.name,
  prix:        p.price,
  categorie:   p.category,
  description: p.description || "",
  stock:       Number(p.stock) > 0,
  img:         p.images?.[0] || "https://via.placeholder.com/600x400?text=Baol_Technologies",
  images:      p.images || [],
  specs:       p.specs || {},
});

export default function App() {
  const [listeProduits, setListeProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      if (response.success) {
        setListeProduits(response.products.map(formatProduct));
      }
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif", color:"#6B7280" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:40, height:40, border:"3px solid #E5E7EB", borderTopColor:"#1a6cff", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize:14 }}>Chargement des produits…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
          <Navbar />
          <main style={{ flexGrow:1, paddingTop:64 }}>
            <Routes>
              {/* ── Publiques ─────────────────────────────────────── */}
              <Route path="/"         element={<><Hero /><ServicesSimple /></>} />
              <Route path="/services" element={<ServicesDetail />} />
              <Route path="/boutique" element={<Boutique produits={listeProduits} />} />
              <Route path="/apropos" element={<Apropos />} />
              <Route path="/contact" element={<Contact />} />

              {/* ── Login admin ───────────────────────────────────── */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* ── Admin protégé ─────────────────────────────────── */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard
                      produits={listeProduits}
                      onRefresh={loadProducts}
                    />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}