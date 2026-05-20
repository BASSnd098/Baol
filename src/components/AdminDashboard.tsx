import React, { useState, useMemo } from "react";

// 1. Définition de la structure stricte d'un produit
export interface Produit {
  id: number;
  nom: string;
  prix: number;
  categorie: string;
  description: string;
  img: string;
  stock: boolean;
}

// 2. Définition des types attendus par les Props du composant
interface AdminDashboardProps {
  produits: Produit[];
  setProduits: React.Dispatch<React.SetStateAction<Produit[]>>;
}

export default function AdminDashboard({ produits, setProduits }: AdminDashboardProps) {
  const [form, setForm] = useState({
    nom: "",
    prix: "",
    categorie: "Ordinateurs",
    description: "",
    img: "",           // contiendra le base64 ou l'URL
  });

  const [preview, setPreview] = useState<string | null>(null); // Typer la preview comme string ou null
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("Tous");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Gestion de l'upload d'image avec typage de l'événement de changement
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Utilisation de l'optional chaining si files est null
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      // Sécurisation du type pour s'assurer que le résultat est bien une chaîne de caractères
      const base64 = event.target?.result as string;
      if (base64) {
        setPreview(base64);
        setForm({ ...form, img: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  // Ajouter / Modifier produit
  const handleSubmit = () => {
    if (!form.nom || !form.prix) {
      alert("Le nom et le prix sont obligatoires");
      return;
    }

    const nouveauProduit: Produit = {
      ...form,
      id: editingId || Date.now(),
      prix: Number(form.prix),
      img: form.img || "https://via.placeholder.com/300x200?text=Baol_Technologies",
      stock: true,
    };

    if (editingId) {
      setProduits(produits.map((p: Produit) => (p.id === editingId ? nouveauProduit : p)));
      setEditingId(null);
    } else {
      setProduits([nouveauProduit, ...produits]);
    }

    // Reset
    resetForm();
  };

  const resetForm = () => {
    setForm({
      nom: "",
      prix: "",
      categorie: "Ordinateurs",
      description: "",
      img: "",
    });
    setPreview(null);
    setEditingId(null);
  };

  const supprimer = (id: number) => {
    if (window.confirm("Supprimer ce produit ?")) {
      setProduits(produits.filter((p: Produit) => p.id !== id));
    }
  };

  const editProduit = (produit: Produit) => {
    setForm({
      nom: produit.nom,
      prix: String(produit.prix), // Conversion en string pour l'input
      categorie: produit.categorie,
      description: produit.description || "",
      img: produit.img || "",
    });
    setPreview(produit.img);
    setEditingId(produit.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStock = (id: number) => {
    setProduits(produits.map((p: Produit) => (p.id === id ? { ...p, stock: !p.stock } : p)));
  };

  // Filtrage
  const filteredProduits = useMemo(() => {
    return produits
      .filter((p: Produit) => {
        const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategorie === "Tous" || p.categorie === filterCategorie;
        return matchesSearch && matchesCategory;
      })
      .sort((a: Produit, b: Produit) => b.id - a.id); // Tri décroissant (les plus récents en premier)
  }, [produits, searchTerm, filterCategorie]);

  const categories = ["Tous", "Ordinateurs", "IoT", "Sécurité", "Réseaux", "Stockage"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black tracking-tight">
            ADMIN <span className="text-blue-600">PANEL</span>
          </h1>
          <p className="text-gray-500">{produits.length} produit{produits.length > 1 ? "s" : ""}</p>
        </div>

        {/* ==================== FORMULAIRE ==================== */}
        <div className="bg-white rounded-3xl shadow p-8 mb-10 text-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            {editingId ? "Modifier le produit" : "Ajouter un nouveau produit"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Zone Upload Image */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Image du produit</label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors">
                {preview ? (
                  <img src={preview} alt="Preview" className="mx-auto max-h-64 object-contain rounded-xl" />
                ) : (
                  <div className="py-10">
                    <span className="text-4xl mb-3 block">📷</span>
                    <p className="text-gray-500">Cliquez ou glissez une image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-4 file:btn file:btn-primary file:cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Format recommandé : JPG, PNG (max 5MB)</p>
            </div>

            {/* Champs du formulaire */}
            <div className="space-y-5">
              <input
                type="text"
                placeholder="Nom du produit"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />

              <input
                type="number"
                placeholder="Prix en FCFA"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm"
                value={form.prix}
                onChange={(e) => setForm({ ...form, prix: e.target.value })}
              />

              <select
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm"
                value={form.categorie}
                onChange={(e) => setForm({ ...form, categorie: e.target.value })}
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Description courte"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <div className="flex gap-4 pt-4">
                <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow">
                  {editingId ? "Mettre à jour" : "Ajouter le produit"}
                </button>

                {editingId && (
                  <button onClick={resetForm} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="🔍 Rechercher un produit..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm w-full sm:w-64"
            value={filterCategorie}
            onChange={(e) => setFilterCategorie(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Liste des produits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProduits.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100">
              <div className="relative">
                <img
                  src={p.img}
                  alt={p.nom}
                  className="w-full h-52 object-cover"
                />
                <button
                  onClick={() => toggleStock(p.id)}
                  className={`absolute top-4 right-4 px-4 py-1 text-xs font-bold rounded-full ${
                    p.stock ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {p.stock ? "EN STOCK" : "RUPTURE"}
                </button>
              </div>

              <div className="p-5 text-gray-800">
                <h3 className="font-bold text-lg mb-1 text-gray-900">{p.nom}</h3>
                <p className="text-blue-600 text-sm mb-3 font-semibold">{p.categorie}</p>
                {p.description && <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{p.description}</p>}

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <p className="text-xl font-black text-gray-900">
                    {p.prix.toLocaleString()} <span className="text-sm font-normal text-gray-400">FCFA</span>
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => editProduit(p)}
                      className="p-2 rounded-lg hover:bg-blue-5 text-sm transition-colors"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => supprimer(p.id)}
                      className="p-2 rounded-lg hover:bg-red-5 text-sm transition-colors"
                      title="Supprimer"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}