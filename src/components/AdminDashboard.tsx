// src/components/AdminDashboard.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { createProduct, updateProduct, deleteProduct } from "../api/api.js";
import { useAuth } from "../context/AuthContext";

const NAVY = "#02101f";
const BLUE = "#1a6cff";
const CHART_COLORS = ["#1a6cff","#7C3AED","#0D9488","#DC2626","#D97706","#059669"];
const ALL_CATEGORIES = ["Ordinateurs","IoT","Réseaux","Sécurité","Stockage","Logiciels"];
const FILTER_CATEGORIES = ["Tous", ...ALL_CATEGORIES];
const fmt = (n) => Number(n || 0).toLocaleString("fr-FR") + " FCFA";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{--navy:#02101f;--blue:#1a6cff;--blue-light:#E8F0FF;--gray-50:#F9FAFB;--gray-100:#F3F4F6;--gray-200:#E5E7EB;--gray-300:#D1D5DB;--gray-400:#9CA3AF;--gray-500:#6B7280;--gray-700:#374151;--gray-900:#111827;}
  body{font-family:'DM Sans',sans-serif;background:var(--gray-50);color:var(--gray-900);}
  .fade-in{animation:fadeIn 0.3s ease;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .card{background:white;border-radius:16px;border:1px solid var(--gray-200);box-shadow:0 1px 4px rgba(0,0,0,0.05);}
  .input{width:100%;padding:10px 14px;border:1.5px solid var(--gray-200);border-radius:10px;font-family:inherit;font-size:14px;color:var(--gray-900);background:white;outline:none;transition:border 0.15s;}
  .input:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(26,108,255,0.1);}
  .btn-primary{background:var(--navy);color:white;border:none;padding:10px 20px;border-radius:50px;font-family:inherit;font-weight:600;font-size:13px;cursor:pointer;transition:background 0.15s,transform 0.1s;}
  .btn-primary:hover:not(:disabled){background:var(--blue);}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed;}
  .btn-primary:active:not(:disabled){transform:scale(0.97);}
  .btn-ghost{background:transparent;border:1.5px solid var(--gray-200);color:var(--gray-500);padding:9px 18px;border-radius:50px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.15s;}
  .btn-ghost:hover{border-color:var(--gray-400);color:var(--gray-700);}
  .icon-btn{background:none;border:none;cursor:pointer;padding:6px 8px;border-radius:8px;transition:background 0.12s;font-size:15px;line-height:1;}
  .icon-btn:hover{background:var(--gray-100);}
  .badge{display:inline-block;padding:2px 9px;border-radius:50px;font-size:10px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;}
  select.input{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-thumb{background:#c8cdd4;border-radius:3px;}
  .row-hover:hover{background:var(--gray-50);}
  .spec-row:not(:last-child){border-bottom:1px solid var(--gray-100);}
`;

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, accent, sub }) {
  return (
    <div className="card" style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:46, height:46, borderRadius:12, background:accent+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
      <div>
        <p style={{ fontSize:11, fontWeight:600, color:"var(--gray-400)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>{label}</p>
        <p style={{ fontSize:20, fontWeight:800, fontFamily:"'Syne',sans-serif", color:"var(--gray-900)", lineHeight:1 }}>{value}</p>
        {sub && <p style={{ fontSize:11, color:"var(--gray-400)", marginTop:3 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── STATISTIQUES ─────────────────────────────────────────────────────────────
function Statistiques({ produits }) {
  const jours = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
  const commandes = useMemo(() => jours.map(j => ({
    jour: j,
    ventes:  Math.floor(Math.random() * 8) + 1,
    revenus: Math.floor(Math.random() * 500000) + 50000,
  })), []);

  const totalProduits = produits.length;
  const enStock   = produits.filter(p => p.stock).length;
  const enRupture = produits.filter(p => !p.stock).length;
  const totalVentes  = commandes.reduce((a, j) => a + j.ventes, 0);
  const totalRevenus = commandes.reduce((a, j) => a + j.revenus, 0);
  const plusVendus = [...produits].sort((a, b) => b.prix - a.prix).slice(0, 5).map(p => ({
    nom: p.nom.length > 20 ? p.nom.slice(0, 20) + "…" : p.nom,
    ventes: Math.floor(Math.random() * 20) + 1,
  }));
  const parCategorie = useMemo(() => {
    const map = {};
    produits.forEach(p => { map[p.categorie] = (map[p.categorie] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [produits]);
  const tt = { borderRadius:10, border:"none", boxShadow:"0 4px 20px rgba(0,0,0,0.1)", fontSize:13, fontFamily:"'DM Sans',sans-serif" };

  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14 }}>
        <KpiCard label="Total produits"  value={totalProduits} icon="📦" accent={BLUE} />
        <KpiCard label="En stock"        value={enStock}   icon="✅" accent="#059669" sub={`${totalProduits ? Math.round(enStock/totalProduits*100) : 0}% du catalogue`} />
        <KpiCard label="En rupture"      value={enRupture} icon="⚠️" accent="#DC2626" />
        <KpiCard label="Ventes semaine"  value={totalVentes}  icon="🛒" accent="#7C3AED" />
        <KpiCard label="Revenus estimés" value={fmt(totalRevenus)} icon="💰" accent="#D97706" sub="Cette semaine" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div className="card" style={{ padding:"20px 22px" }}>
          <p style={{ fontSize:14, fontWeight:700, marginBottom:2, fontFamily:"'Syne',sans-serif" }}>Ventes par jour</p>
          <p style={{ fontSize:11, color:"var(--gray-400)", marginBottom:18 }}>Cette semaine</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={commandes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="jour" tick={{ fontSize:11, fill:"#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:"#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tt} formatter={v => [v,"Ventes"]} />
              <Line type="monotone" dataKey="ventes" stroke={BLUE} strokeWidth={2.5} dot={{ fill:BLUE, r:3.5 }} activeDot={{ r:5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding:"20px 22px" }}>
          <p style={{ fontSize:14, fontWeight:700, marginBottom:2, fontFamily:"'Syne',sans-serif" }}>Revenus par jour</p>
          <p style={{ fontSize:11, color:"var(--gray-400)", marginBottom:18 }}>En FCFA</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={commandes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="jour" tick={{ fontSize:11, fill:"#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:"#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => (v/1000)+"k"} />
              <Tooltip contentStyle={tt} formatter={v => [typeof v==="number" ? v.toLocaleString("fr-FR")+" FCFA" : v,"Revenus"]} />
              <Bar dataKey="revenus" fill={BLUE} radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div className="card" style={{ padding:"20px 22px" }}>
          <p style={{ fontSize:14, fontWeight:700, marginBottom:2, fontFamily:"'Syne',sans-serif" }}>Produits les plus vendus</p>
          <p style={{ fontSize:11, color:"var(--gray-400)", marginBottom:18 }}>Top 5</p>
          {plusVendus.length === 0
            ? <p style={{ textAlign:"center", padding:"40px 0", color:"var(--gray-400)", fontSize:13 }}>Aucun produit</p>
            : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={plusVendus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize:11, fill:"#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="nom" tick={{ fontSize:10, fill:"#6B7280" }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={tt} formatter={v => [v,"Ventes"]} />
                  <Bar dataKey="ventes" radius={[0,5,5,0]}>
                    {plusVendus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </div>
        <div className="card" style={{ padding:"20px 22px" }}>
          <p style={{ fontSize:14, fontWeight:700, marginBottom:2, fontFamily:"'Syne',sans-serif" }}>Répartition par catégorie</p>
          <p style={{ fontSize:11, color:"var(--gray-400)", marginBottom:14 }}>Nombre de produits</p>
          {parCategorie.length === 0
            ? <p style={{ textAlign:"center", padding:"40px 0", color:"var(--gray-400)", fontSize:13 }}>Aucun produit</p>
            : <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={parCategorie} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={3} dataKey="value">
                      {parCategorie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tt} formatter={(v, n) => [v+" produit(s)", n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {parCategorie.map((e, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:CHART_COLORS[i % CHART_COLORS.length], flexShrink:0 }} />
                      <span style={{ fontSize:11, fontWeight:500 }}>{e.name}</span>
                      <span style={{ fontSize:11, color:"var(--gray-400)", marginLeft:"auto" }}>{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── SPECS EDITOR ─────────────────────────────────────────────────────────────
function SpecsEditor({ specs, onChange }) {
  const entries = Object.entries(specs || {});
  const addRow = () => onChange({ ...specs, "": "" });
  const updateKey = (oldKey, newKey) => {
    const u = {};
    Object.entries(specs).forEach(([k, v]) => { u[k === oldKey ? newKey : k] = v; });
    onChange(u);
  };
  const updateVal = (key, val) => onChange({ ...specs, [key]: val });
  const removeRow = (key) => { const s = { ...specs }; delete s[key]; onChange(s); };
  return (
    <div style={{ border:"1.5px solid var(--gray-200)", borderRadius:10, overflow:"hidden" }}>
      {entries.length === 0 && <p style={{ padding:"12px 14px", fontSize:12, color:"var(--gray-400)" }}>Aucune caractéristique.</p>}
      {entries.map(([k, v], i) => (
        <div key={i} className="spec-row" style={{ display:"flex" }}>
          <input value={k} onChange={e => updateKey(k, e.target.value)} placeholder="Clé" style={{ flex:1, padding:"8px 10px", border:"none", borderRight:"1px solid var(--gray-200)", fontSize:12, fontFamily:"inherit", outline:"none", background:"var(--gray-50)", fontWeight:600 }} />
          <input value={v} onChange={e => updateVal(k, e.target.value)} placeholder="Valeur" style={{ flex:2, padding:"8px 10px", border:"none", borderRight:"1px solid var(--gray-200)", fontSize:12, fontFamily:"inherit", outline:"none" }} />
          <button className="icon-btn" onClick={() => removeRow(k)} style={{ padding:"6px 10px", color:"#ef4444", borderRadius:0 }}>✕</button>
        </div>
      ))}
      <div style={{ borderTop: entries.length > 0 ? "1px solid var(--gray-200)" : "none" }}>
        <button onClick={addRow} style={{ width:"100%", padding:8, background:"none", border:"none", cursor:"pointer", fontSize:12, color:BLUE, fontWeight:600, fontFamily:"inherit" }}>+ Ajouter</button>
      </div>
    </div>
  );
}

// ─── IMAGES EDITOR ────────────────────────────────────────────────────────────
function ImagesEditor({ images, onChange }) {
  const imgs = images || [];
  const addUrl    = () => onChange([...imgs, ""]);
  const updateUrl = (i, v) => { const a = [...imgs]; a[i] = v; onChange(a); };
  const removeUrl = (i) => onChange(imgs.filter((_, idx) => idx !== i));
  const handleFile = (e, i) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = ev => { if (typeof ev.target?.result === "string") updateUrl(i, ev.target.result); };
    r.readAsDataURL(file);
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {imgs.map((url, i) => (
        <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
          {url && <img src={url} alt="" style={{ width:44, height:40, objectFit:"cover", borderRadius:8, flexShrink:0, border:"1px solid var(--gray-200)" }} />}
          <input className="input" value={!url.startsWith("data:") ? url : ""} onChange={e => updateUrl(i, e.target.value)} placeholder="URL image" style={{ flex:1, fontSize:12 }} />
          <label style={{ cursor:"pointer", padding:"8px 12px", border:"1.5px solid var(--gray-200)", borderRadius:8, fontSize:11, fontWeight:600, color:"var(--gray-500)", whiteSpace:"nowrap" }}>
            📁<input type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleFile(e, i)} />
          </label>
          <button className="icon-btn" onClick={() => removeUrl(i)} style={{ color:"#ef4444" }}>✕</button>
        </div>
      ))}
      <button onClick={addUrl} style={{ padding:"8px 14px", background:"#E8F0FF", border:"none", borderRadius:8, fontSize:12, fontWeight:600, color:BLUE, cursor:"pointer", fontFamily:"inherit", alignSelf:"flex-start" }}>+ Ajouter une image</button>
    </div>
  );
}

// ─── PRODUIT FORM ─────────────────────────────────────────────────────────────
function ProduitForm({ editTarget, onSave, onCancel, saving }) {
  const isEdit = !!editTarget;
  const [form, setForm] = useState({
    nom:         editTarget?.nom         || "",
    prix:        editTarget?.prix        ? String(editTarget.prix) : "",
    categorie:   editTarget?.categorie   || "Ordinateurs",
    description: editTarget?.description || "",
    stock:       editTarget?.stock       ?? true,
    img:         editTarget?.img         || "",
    images:      editTarget?.images      || [],
    specs:       editTarget?.specs       || {},
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleMainFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = ev => { if (typeof ev.target?.result === "string") set("img", ev.target.result); };
    r.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.nom.trim() || !form.prix) { alert("Nom et prix sont obligatoires."); return; }
    onSave({
      id:          editTarget?.id || "",
      nom:         form.nom.trim(),
      prix:        Number(form.prix),
      categorie:   form.categorie,
      description: form.description.trim(),
      stock:       form.stock,
      img:         form.img || "https://via.placeholder.com/600x400?text=Baol_Technologies",
      images:      form.images.filter(Boolean),
      specs:       form.specs,
    });
  };

  const Sec = ({ title, children }) => (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontSize:11, fontWeight:700, color:"var(--gray-400)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{title}</p>
      {children}
    </div>
  );

  return (
    <div className="card fade-in" style={{ padding:"24px 28px", marginBottom:28 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <h2 style={{ fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>{isEdit ? "✏️ Modifier le produit" : "➕ Nouveau produit"}</h2>
        <button className="btn-ghost" onClick={onCancel} style={{ fontSize:12 }}>Annuler</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:28 }}>
        <div>
          <Sec title="Image principale">
            <div style={{ borderRadius:12, overflow:"hidden", background:"var(--gray-100)", height:200, marginBottom:10 }}>
              {form.img
                ? <img src={form.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--gray-400)" }}><span style={{ fontSize:32 }}>🖼️</span></div>}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input className="input" value={form.img && !form.img.startsWith("data:") ? form.img : ""} onChange={e => set("img", e.target.value)} placeholder="URL image principale" style={{ fontSize:12 }} />
              <label style={{ cursor:"pointer", padding:"8px 12px", border:"1.5px solid var(--gray-200)", borderRadius:8, fontSize:11, fontWeight:600, color:"var(--gray-500)", display:"flex", alignItems:"center" }}>
                📁<input type="file" accept="image/*" style={{ display:"none" }} onChange={handleMainFile} />
              </label>
            </div>
          </Sec>
          <Sec title="Galerie">
            <ImagesEditor images={form.images} onChange={v => set("images", v)} />
          </Sec>
        </div>
        <div>
          <Sec title="Informations produit">
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <input className="input" value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Nom du produit *" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <input className="input" type="number" value={form.prix} onChange={e => set("prix", e.target.value)} placeholder="Prix en FCFA *" />
                <select className="input" value={form.categorie} onChange={e => set("categorie", e.target.value)}>
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <textarea className="input" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Description du produit" rows={3} style={{ resize:"vertical" }} />
              <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 14px", borderRadius:10, border:"1.5px solid var(--gray-200)", background:form.stock ? "#d1fae530" : "#fee2e230" }}>
                <input type="checkbox" checked={form.stock} onChange={e => set("stock", e.target.checked)} style={{ accentColor:form.stock ? "#059669" : "#ef4444", width:16, height:16 }} />
                <span style={{ fontSize:13, fontWeight:600, color:form.stock ? "#059669" : "#ef4444" }}>{form.stock ? "✓ En stock" : "✕ Rupture de stock"}</span>
              </label>
            </div>
          </Sec>
          <Sec title="Caractéristiques techniques">
            <SpecsEditor specs={form.specs} onChange={v => set("specs", v)} />
          </Sec>
        </div>
      </div>
      <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
        <button className="btn-ghost" onClick={onCancel}>Annuler</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={saving} style={{ padding:"11px 28px" }}>
          {saving ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Ajouter le produit"}
        </button>
      </div>
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function AdminProductCard({ produit: p, onEdit, onDelete, onToggleStock }) {
  return (
    <div className="card" style={{ overflow:"hidden", display:"flex", flexDirection:"column", transition:"box-shadow 0.2s,transform 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow="0 8px 24px rgba(26,108,255,0.1)"; e.currentTarget.style.transform="translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow=""; e.currentTarget.style.transform=""; }}>
      <div style={{ height:180, overflow:"hidden", position:"relative", background:"var(--gray-100)" }}>
        <img src={p.img || "https://via.placeholder.com/400x200?text=No+Image"} alt={p.nom} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        <button onClick={() => onToggleStock(p.id)} style={{ position:"absolute", top:10, right:10, padding:"3px 10px", borderRadius:50, border:"none", fontSize:10, fontWeight:700, cursor:"pointer", background:p.stock ? "#059669" : "#ef4444", color:"white" }}>
          {p.stock ? "En stock" : "Rupture"}
        </button>
      </div>
      <div style={{ padding:"14px 16px", flex:1, display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <span className="badge" style={{ background:"#E8F0FF", color:BLUE }}>{p.categorie}</span>
          <div style={{ display:"flex", gap:2 }}>
            <button className="icon-btn" onClick={() => onEdit(p)}>✏️</button>
            <button className="icon-btn" onClick={() => onDelete(p.id)}>🗑️</button>
          </div>
        </div>
        <h3 style={{ fontSize:14, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{p.nom}</h3>
        {p.description && <p style={{ fontSize:11, color:"var(--gray-500)", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{p.description}</p>}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"auto", paddingTop:8, borderTop:"1px solid var(--gray-100)" }}>
          <span style={{ fontSize:15, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>{fmt(p.prix)}</span>
          <span style={{ fontSize:10, color:"var(--gray-400)" }}>{p.images?.length || 1} img</span>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
export default function AdminDashboard({ produits = [], setProduits, onRefresh }) {
  const [tab, setTab]               = useState("produits");
  const [editTarget, setEditTarget] = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("Tous");
  const [apiError, setApiError]     = useState("");
  const [saving, setSaving]         = useState(false);

  const { logout, user } = useAuth();
  const navigate = useNavigate();



  
  // ── Créer ou modifier ─────────────────────────────────────────────────────
  const handleSave = async (produit) => {
    setSaving(true);
    setApiError("");
    try {
      const payload = {
        name:        produit.nom,
        price:       produit.prix,
        category:    produit.categorie,
        description: produit.description,
        stock:       produit.stock ? 1 : 0,
        images:      produit.images || [],
        featured:    false,
      };
      if (editTarget) {
        await updateProduct(produit.id, payload);
      } else {
        await createProduct(payload);
      }
      await onRefresh();
      setEditTarget(null);
      setShowForm(false);
    } catch (err) {
      setApiError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  // ── Supprimer ─────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit définitivement ?")) return;
    try {
      await deleteProduct(id);
      await onRefresh();
    } catch (err) {
      setApiError(err.message || "Erreur suppression.");
    }
  };

  // ── Basculer stock ────────────────────────────────────────────────────────
  const handleToggleStock = async (id) => {
    const p = produits.find(p => p.id === id);
    if (!p) return;
    try {
      await updateProduct(id, { stock: p.stock ? 0 : 1 });
      await onRefresh();
    } catch (err) {
      setApiError(err.message || "Erreur stock.");
    }
  };

  const handleEdit   = (p) => { setEditTarget(p); setShowForm(true); window.scrollTo({ top:0, behavior:"smooth" }); };
  const handleCancel = () => { setEditTarget(null); setShowForm(false); setApiError(""); };

  const filtered = useMemo(() => produits.filter(p => {
    const matchSearch = p.nom?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === "Tous" || p.categorie === filterCat;
    return matchSearch && matchCat;
  }), [produits, search, filterCat]);

  return (
    <div style={{ minHeight:"100vh", background:"var(--gray-50)", padding:"24px 24px 80px", marginTop:"80px" }}>
      <style>{GLOBAL_CSS}</style>

      {/* HEADER */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:28, maxWidth:1240, marginLeft:"auto", marginRight:"auto" }}>
        <div>
          <h1 style={{ fontSize:"clamp(22px,4vw,34px)", fontWeight:800, fontFamily:"'Syne',sans-serif", letterSpacing:"-0.03em", lineHeight:1 }}>
            ADMIN <span style={{ color:BLUE }}>PANEL</span>
          </h1>
          <p style={{ fontSize:12, color:"var(--gray-400)", marginTop:4 }}>
            {user?.email} · {produits.length} produit{produits.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ display:"flex", background:"white", border:"1px solid var(--gray-200)", borderRadius:12, padding:4, gap:2 }}>
            {[["produits","📦 Produits"],["stats","📊 Statistiques"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding:"8px 18px", borderRadius:9, border:"none", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", background:tab===id ? NAVY : "transparent", color:tab===id ? "white" : "var(--gray-500)" }}>{label}</button>
            ))}
          </div>
          <button onClick={() => { logout(); navigate("/admin/login"); }} style={{ padding:"9px 16px", borderRadius:10, border:"1.5px solid var(--gray-200)", background:"white", color:"var(--gray-500)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            🚪 Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1240, margin:"0 auto" }}>
        {/* Erreur API */}
        {apiError && (
          <div style={{ background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px", marginBottom:16, color:"#dc2626", fontSize:13, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            ⚠️ {apiError}
            <button onClick={() => setApiError("")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#dc2626" }}>✕</button>
          </div>
        )}

        {tab === "stats" && <Statistiques produits={produits} />}

        {tab === "produits" && (
          <>
            {!showForm
              ? <div style={{ marginBottom:20 }}>
                  <button className="btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }} style={{ padding:"11px 24px", fontSize:14 }}>➕ Ajouter un produit</button>
                </div>
              : <ProduitForm editTarget={editTarget} onSave={handleSave} onCancel={handleCancel} saving={saving} />
            }
            <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
              <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher…" style={{ flex:1, minWidth:200 }} />
              <select className="input" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width:180 }}>
                {FILTER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:20 }}>
              {filtered.map(p => (
                <AdminProductCard key={p.id} produit={p} onEdit={handleEdit} onDelete={handleDelete} onToggleStock={handleToggleStock} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="card" style={{ padding:"60px 20px", textAlign:"center", color:"var(--gray-400)" }}>
                <span style={{ fontSize:36, display:"block", marginBottom:10 }}>🔍</span>
                <p style={{ fontSize:14, fontWeight:500 }}>Aucun produit trouvé.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}