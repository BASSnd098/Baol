import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Boutique from "./components/Boutique";
import AdminDashboard from "./components/AdminDashboard";
import ServicesSimple from "./components/Services";
import ServicesDetail from "./components/ServicesAndValues";

// 1. Tes produits par défaut (ceux que tu verras au début)
const produitsInitiaux = [
  { 
    id: 1, 
    nom: "Dell XPS 15 7590", 
    prix: 750000, 
    categorie: "Ordinateurs", 
    img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
    stock: true 
  },
  { 
    id: 2, 
    nom: "Raspberry Pi 4", 
    prix: 65000, 
    categorie: "IoT", 
    img: "https://images.unsplash.com/photo-1555617766-c94804975da3?w=400",
    stock: true 
  }
];

export default function App() {
  // 2. Gestion de la mémoire (LocalStorage)
  const [listeProduits, setListeProduits] = useState(() => {
    const saved = localStorage.getItem("baol_tech_stock");
    return saved ? JSON.parse(saved) : produitsInitiaux;
  });

  // 3. Sauvegarde automatique dès qu'un produit est ajouté/modifié
  useEffect(() => {
    localStorage.setItem("baol_tech_stock", JSON.stringify(listeProduits));
  }, [listeProduits]);

  return (
    <Router>
      <div data-theme="business" className="min-h-screen bg-base-200 flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<><Hero /><ServicesSimple /></>} />
            <Route path="/services" element={<ServicesDetail />} />

            {/* 4. ON ENVOIE LES PRODUITS À LA BOUTIQUE */}
            <Route path="/boutique" element={<Boutique produits={listeProduits} />} />

            {/* 5. ON ENVOIE LES PRODUITS ET LA FONCTION DE MISE À JOUR À L'ADMIN */}
            <Route 
              path="/admin" 
              element={<AdminDashboard produits={listeProduits} setProduits={setListeProduits} />} 
            />

            <Route path="/contact" element={<div className="py-20 text-center font-bold">+221 78 463 41 65</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}