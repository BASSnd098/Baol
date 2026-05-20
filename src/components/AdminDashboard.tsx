import { useState, useMemo } from "react";

export default function AdminDashboard({ produits, setProduits }) {
  const [form, setForm] = useState({
    nom: "",
    prix: "",
    categorie: "Ordinateurs",
    description: "",
    img: "",           // contiendra le base64 ou l'URL
  });

  const [preview, setPreview] = useState(null); // Pour l'aperçu
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("Tous");
  const [editingId, setEditingId] = useState(null);

  // Gestion de l'upload d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setPreview(base64);
      setForm({ ...form, img: base64 });
    };
    reader.readAsDataURL(file);
  };

  // Ajouter / Modifier produit
  const handleSubmit = () => {
    if (!form.nom || !form.prix) {
      alert("Le nom et le prix sont obligatoires");
      return;
    }

    const nouveauProduit = {
      ...form,
      id: editingId || Date.now(),
      prix: Number(form.prix),
      img: form.img || "https://via.placeholder.com/300x200?text=Baol_Technologies",
      stock: true,
    };

    if (editingId) {
      setProduits(produits.map((p) => (p.id === editingId ? nouveauProduit : p)));
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

  const supprimer = (id) => {
    if (window.confirm("Supprimer ce produit ?")) {
      setProduits(produits.filter((p) => p.id !== id));
    }
  };

  const editProduit = (produit) => {
    setForm({
      nom: produit.nom,
      prix: produit.prix,
      categorie: produit.categorie,
      description: produit.description || "",
      img: produit.img || "",
    });
    setPreview(produit.img);
    setEditingId(produit.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStock = (id) => {
    setProduits(produits.map((p) => (p.id === id ? { ...p, stock: !p.stock } : p)));
  };

  // Filtrage
  const filteredProduits = useMemo(() => {
    return produits
      .filter((p) => {
        const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategorie === "Tous" || p.categorie === filterCategorie;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.id - a.id);
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
        <div className="bg-white rounded-3xl shadow p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? "Modifier le produit" : "Ajouter un nouveau produit"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Zone Upload Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Image du produit</label>
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
                className="input input-bordered w-full"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />

              <input
                type="number"
                placeholder="Prix en FCFA"
                className="input input-bordered w-full"
                value={form.prix}
                onChange={(e) => setForm({ ...form, prix: e.target.value })}
              />

              <select
                className="select select-bordered w-full"
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
                className="input input-bordered w-full"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <div className="flex gap-4 pt-4">
                <button onClick={handleSubmit} className="btn btn-primary flex-1 bg-blue-600">
                  {editingId ? "Mettre à jour" : "Ajouter le produit"}
                </button>

                {editingId && (
                  <button onClick={resetForm} className="btn btn-ghost flex-1">
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
            className="input input-bordered flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="select select-bordered w-full sm:w-64"
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
            <div key={p.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
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

              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">{p.nom}</h3>
                <p className="text-blue-600 text-sm mb-3">{p.categorie}</p>
                {p.description && <p className="text-gray-600 text-sm line-clamp-2 mb-4">{p.description}</p>}

                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black">
                    {p.prix.toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => editProduit(p)}
                      className="btn btn-sm btn-ghost text-blue-600"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => supprimer(p.id)}
                      className="btn btn-sm btn-ghost text-red-500"
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