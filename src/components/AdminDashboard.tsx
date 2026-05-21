import React, { useState, useMemo, ChangeEvent } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ["#2563EB", "#7C3AED", "#0D9488", "#DC2626", "#D97706", "#059669"];

const formatPrix = (p: number): string => p.toLocaleString("fr-FR") + " FCFA";

// ─── INTERFACES TYPES ──────────────────────────────────────
export interface Produit {
  id: number;
  nom: string;
  prix: number;
  categorie: string;
  description: string;
  img: string;
  stock: boolean;
}

interface CommandeData {
  jour: string;
  ventes: number;
  revenus: number;
}

interface CategorieData {
  name: string;
  value: number;
}

interface FormState {
  nom: string;
  prix: string;
  categorie: string;
  description: string;
  img: string;
}

// Génère des fausses commandes pour les graphiques
const genererCommandes = (produits: Produit[]): CommandeData[] => {
  if (!produits.length) return [];
  const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  return jours.map((jour) => ({
    jour,
    ventes: Math.floor(Math.random() * 8) + 1,
    revenus: Math.floor(Math.random() * 500000) + 50000,
  }));
};

// ─── KPI CARD ──────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  sub?: string;
}

function KpiCard({ label, value, icon, color, sub }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: color + "18" }}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── ONGLET STATISTIQUES ───────────────────────────────────
interface StatistiquesProps {
  produits: Produit[];
}

function Statistiques({ produits }: StatistiquesProps) {
  const commandes = useMemo(() => genererCommandes(produits), [produits.length]);

  const totalProduits = produits.length;
  const enStock = produits.filter((p) => p.stock).length;
  const enRupture = produits.filter((p) => !p.stock).length;
  const totalCommandes = commandes.reduce((acc, j) => acc + j.ventes, 0);
  const revenusEstimes = commandes.reduce((acc, j) => acc + j.revenus, 0);

  // Produits les plus chers (simulation "plus vendus")
  const plusVendus = [...produits]
    .sort((a, b) => b.prix - a.prix)
    .slice(0, 5)
    .map((p) => ({ 
      nom: p.nom.length > 18 ? p.nom.slice(0, 18) + "…" : p.nom, 
      ventes: Math.floor(Math.random() * 20) + 1 
    }));

  // Répartition par catégorie
  const parCategorie = useMemo<CategorieData[]>(() => {
    const map: Record<string, number> = {};
    produits.forEach((p) => { map[p.categorie] = (map[p.categorie] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [produits]);

  return (
    <div className="space-y-8">
      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total produits" value={totalProduits} icon="📦" color="#2563EB" />
        <KpiCard label="En stock" value={enStock} icon="✅" color="#059669" sub={`${Math.round((enStock / totalProduits || 0) * 100)}% du catalogue`} />
        <KpiCard label="En rupture" value={enRupture} icon="❌" color="#DC2626" />
        <KpiCard label="Commandes (sem.)" value={totalCommandes} icon="🛒" color="#7C3AED" />
        <KpiCard label="Revenus estimés" value={formatPrix(revenusEstimes)} icon="💰" color="#D97706" sub="Cette semaine" />
      </div>

      {/* Graphiques ligne 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ventes par jour */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-1">Ventes par jour</h3>
          <p className="text-xs text-gray-400 mb-5">Cette semaine</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={commandes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="jour" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "13px" }}
                formatter={(v) => [v, "Ventes"]}
              />
              <Line type="monotone" dataKey="ventes" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: "#2563EB", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenus par jour */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-1">Revenus par jour</h3>
          <p className="text-xs text-gray-400 mb-5">En FCFA</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={commandes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="jour" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => (v / 1000) + "k"} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "13px" }}
                formatter={(v) => [typeof v === "number" ? v.toLocaleString("fr-FR") + " FCFA" : v, "Revenus"]}
              />
              <Bar dataKey="revenus" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphiques ligne 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Produits les plus vendus */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-1">Produits les plus vendus</h3>
          <p className="text-xs text-gray-400 mb-5">Top 5</p>
          {plusVendus.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Aucun produit encore</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={plusVendus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nom" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "13px" }}
                  formatter={(v) => [v, "Ventes"]}
                />
                <Bar dataKey="ventes" radius={[0, 6, 6, 0]}>
                  {plusVendus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Répartition par catégorie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-1">Répartition par catégorie</h3>
          <p className="text-xs text-gray-400 mb-5">Nombre de produits</p>
          {parCategorie.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Aucun produit encore</p>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={parCategorie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {parCategorie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "13px" }}
                    formatter={(v, n) => [v + " produit(s)", n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 min-w-[120px]">
                {parCategorie.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-600 font-medium">{entry.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tableau récap stock */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-800 mb-5">Récapitulatif du stock</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Produit</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Catégorie</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Prix</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Stock</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 font-medium text-gray-800">{p.nom}</td>
                  <td className="py-3 px-3 text-gray-500">{p.categorie}</td>
                  <td className="py-3 px-3 font-semibold text-blue-600">{formatPrix(p.prix)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {p.stock ? "En stock" : "Rupture"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {produits.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Aucun produit dans le catalogue</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD PRINCIPAL ───────────────────────────────────
interface AdminDashboardProps {
  produits: Produit[];
  setProduits: (produits: Produit[]) => void;
}

export default function AdminDashboard({ produits, setProduits }: AdminDashboardProps) {
  const [onglet, setOnglet] = useState<"produits" | "stats">("produits");
  const [form, setForm] = useState<FormState>({ nom: "", prix: "", categorie: "Ordinateurs", description: "", img: "" });
  const [preview, setPreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCategorie, setFilterCategorie] = useState<string>("Tous");
  const [editingId, setEditingId] = useState<number | null>(null);

  const categories = ["Tous", "Ordinateurs", "IoT", "Sécurité", "Réseaux", "Stockage"];

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Image invalide"); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (typeof base64 === "string") { 
        setPreview(base64); 
        setForm({ ...form, img: base64 }); 
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.nom || !form.prix) { alert("Nom et prix obligatoires"); return; }
    const nouveau: Produit = {
      id: editingId || Date.now(),
      nom: form.nom,
      categorie: form.categorie,
      description: form.description,
      prix: Number(form.prix),
      img: form.img || "https://via.placeholder.com/300x200?text=Baol_Technologies",
      stock: true,
    };
    if (editingId) {
      setProduits(produits.map((p) => (p.id === editingId ? nouveau : p)));
      setEditingId(null);
    } else {
      setProduits([nouveau, ...produits]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ nom: "", prix: "", categorie: "Ordinateurs", description: "", img: "" });
    setPreview(null);
    setEditingId(null);
  };

  const supprimer = (id: number) => {
    if (window.confirm("Supprimer ce produit ?")) setProduits(produits.filter((p) => p.id !== id));
  };

  const editProduit = (produit: Produit) => {
    setForm({ nom: produit.nom, prix: String(produit.prix), categorie: produit.categorie, description: produit.description || "", img: produit.img || "" });
    setPreview(produit.img);
    setEditingId(produit.id);
    setOnglet("produits");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStock = (id: number) => {
    setProduits(produits.map((p) => (p.id === id ? { ...p, stock: !p.stock } : p)));
  };

  const filteredProduits = useMemo(() => {
    return produits
      .filter((p) => {
        const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategorie === "Tous" || p.categorie === filterCategorie;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.id - a.id);
  }, [produits, searchTerm, filterCategorie]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              ADMIN <span className="text-blue-600">PANEL</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">{produits.length} produit{produits.length > 1 ? "s" : ""} dans le catalogue</p>
          </div>

          {/* ONGLETS */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setOnglet("produits")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                onglet === "produits" ? "bg-[#02101f] text-white shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📦 Produits
            </button>
            <button
              onClick={() => setOnglet("stats")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                onglet === "stats" ? "bg-[#02101f] text-white shadow" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📊 Statistiques
            </button>
          </div>
        </div>

        {/* ONGLET STATISTIQUES */}
        {onglet === "stats" && <Statistiques produits={produits} />}

        {/* ONGLET PRODUITS */}
        {onglet === "produits" && (
          <>
            {/* FORMULAIRE */}
            <div className="bg-white rounded-3xl shadow p-8 mb-10 text-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                {editingId ? "✏️ Modifier le produit" : "➕ Ajouter un nouveau produit"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-4 file:btn file:btn-primary file:cursor-pointer" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Format recommandé : JPG, PNG (max 5MB)</p>
                </div>

                <div className="space-y-5">
                  <input type="text" placeholder="Nom du produit" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm"
                    value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                  <input type="number" placeholder="Prix en FCFA" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm"
                    value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} />
                  <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm"
                    value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}>
                    {categories.slice(1).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input type="text" placeholder="Description courte" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm"
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

            {/* FILTRES */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <input type="text" placeholder="🔍 Rechercher un produit..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm flex-1"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <select className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white text-gray-800 text-sm w-full sm:w-64"
                value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)}>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* LISTE PRODUITS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProduits.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100">
                  <div className="relative">
                    <img src={p.img} alt={p.nom} className="w-full h-52 object-cover" />
                    <button onClick={() => toggleStock(p.id)}
                      className={`absolute top-4 right-4 px-4 py-1 text-xs font-bold rounded-full ${p.stock ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                      {p.stock ? "EN STOCK" : "RUPTURE"}
                    </button>
                  </div>
                  <div className="p-5 text-gray-800">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{p.nom}</h3>
                    </div>
                    <p className="text-blue-600 text-sm mb-3 font-semibold">{p.categorie}</p>
                    {p.description && <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{p.description}</p>}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <p className="text-xl font-black text-gray-900">
                        {p.prix.toLocaleString()} <span className="text-sm font-normal text-gray-400">FCFA</span>
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => editProduit(p)} className="p-2 rounded-lg hover:bg-blue-50 text-sm transition-colors" title="Modifier">✏️</button>
                        <button onClick={() => supprimer(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-sm transition-colors" title="Supprimer">🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProduits.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-sm">Aucun produit trouvé</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}