import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
// @ts-ignore
import { createProduct, updateProduct, deleteProduct } from "../api/api.js";

// ─── INTERFACES ───────────────────────────────────────────────────────────────

interface ImageItem {
  url: string;
  public_id?: string;
  _id?: any;
}

interface Produit {
  id: string | number;
  nom: string;
  prix: number;
  categorie: string;
  description: string;
  stock: boolean;
  img?: string;
  images: Array<ImageItem | string>;
  specs: Record<string, string>;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  accent: string;
  sub?: string;
}

interface StatistiquesProps {
  produits: Produit[];
}

interface SpecsEditorProps {
  specs: Record<string, string>;
  onChange: (specs: Record<string, string>) => void;
}

interface ImagesEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
}

interface ProduitFormProps {
  editTarget: Produit | null;
  onSave: (produit: Omit<Produit, "id"> & { id?: string | number }) => void;
  onCancel: () => void;
  saving: boolean;
}

interface AdminProductCardProps {
  produit: Produit;
  onEdit: (p: Produit) => void;
  onDelete: (id: string | number) => void;
  onToggleStock: (id: string | number) => void;
}

interface AdminDashboardProps {
  produits: Produit[];
  onRefresh: () => Promise<void> | void;
}

// ─── HELPERS IMAGES ───────────────────────────────────────────────────────────

// Extrait une URL propre depuis string ou objet Cloudinary {url, public_id, _id}
function extractUrl(item: ImageItem | string): string {
  if (!item) return "";
  if (typeof item === "string") return item.trim();
  return (item.url || "").trim();
}

// Retourne toujours une string (jamais null) pour éviter src={null}
function getPrimaryImage(p: Produit): string {
  if (typeof p.img === "string" && p.img.trim() && p.img.trim() !== "undefined") {
    return p.img.trim();
  }
  if (p.images && p.images.length > 0) {
    const firstUrl = extractUrl(p.images[0]);
    if (firstUrl) return firstUrl;
  }
  return "";
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const NAVY = "#02101f";
const BLUE = "#1a6cff";
const CHART_COLORS = ["#1a6cff", "#7C3AED", "#0D9488", "#DC2626", "#D97706", "#059669"];
const ALL_CATEGORIES = ["Ordinateurs", "IoT", "Réseaux", "Sécurité", "Stockage", "Logiciels"];
const FILTER_CATEGORIES = ["Tous", ...ALL_CATEGORIES];
const fmt = (n: number | string) => Number(n || 0).toLocaleString("fr-FR") + " FCFA";

// ─── STYLES GLOBAUX ───────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #02101f; --blue: #1a6cff; --blue-light: #E8F0FF;
    --blue-mid: rgba(26,108,255,0.12);
    --gray-50: #F9FAFB; --gray-100: #F3F4F6; --gray-200: #E5E7EB;
    --gray-300: #D1D5DB; --gray-400: #9CA3AF; --gray-500: #6B7280;
    --gray-700: #374151; --gray-900: #111827;
    --success: #059669; --danger: #DC2626; --warning: #D97706;
    --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
    --shadow-blue: 0 8px 24px rgba(26,108,255,0.15);
  }
  body { font-family: 'DM Sans', sans-serif; background: var(--gray-50); color: var(--gray-900); }
  .fade-in { animation: fadeIn 0.25s ease both; }
  .slide-down { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm); }
  .input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm); font-family: inherit; font-size: 14px; color: var(--gray-900); background: white; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
  .input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(26,108,255,0.1); }
  .input::placeholder { color: var(--gray-400); }
  select.input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; cursor: pointer; }
  .btn-primary { background: var(--navy); color: white; border: none; padding: 10px 22px; border-radius: 50px; font-family: inherit; font-weight: 600; font-size: 13px; cursor: pointer; transition: background 0.15s, transform 0.1s, box-shadow 0.15s; display: inline-flex; align-items: center; gap: 6px; }
  .btn-primary:hover:not(:disabled) { background: var(--blue); box-shadow: 0 4px 12px rgba(26,108,255,0.3); }
  .btn-primary:active:not(:disabled) { transform: scale(0.97); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-ghost { background: transparent; border: 1.5px solid var(--gray-200); color: var(--gray-500); padding: 9px 18px; border-radius: 50px; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .btn-ghost:hover { border-color: var(--gray-400); color: var(--gray-700); background: var(--gray-50); }
  .icon-btn { background: none; border: none; cursor: pointer; padding: 6px 8px; border-radius: var(--radius-sm); transition: background 0.12s; font-size: 15px; line-height: 1; display: inline-flex; align-items: center; justify-content: center; }
  .icon-btn:hover { background: var(--gray-100); }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 50px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 3px; }
  .row-hover:hover { background: var(--gray-50); }
  .spec-row:not(:last-child) { border-bottom: 1px solid var(--gray-100); }
  .img-preview { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
  .img-container:hover .img-preview { transform: scale(1.04); }
  .tab-btn { padding: 8px 18px; border-radius: 9px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
  .tab-btn.active { background: var(--navy); color: white; }
  .tab-btn:not(.active) { background: transparent; color: var(--gray-500); }
  .tab-btn:not(.active):hover { background: var(--gray-100); color: var(--gray-700); }
  .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 18px; border-radius: var(--radius-md); font-size: 13px; font-weight: 500; box-shadow: var(--shadow-md); z-index: 9999; display: flex; align-items: center; gap: 10px; animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; max-width: 340px; }
  .toast.success { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; }
  .toast.error   { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 20px; color: var(--gray-400); text-align: center; gap: 10px; }
`;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  return (
    <div className={`toast ${type}`} role="alert">
      <span>{type === "success" ? "✓" : "⚠"}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, opacity: 0.6, lineHeight: 1 }}>✕</button>
    </div>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, accent, sub }: KpiCardProps) {
  return (
    <div className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "var(--gray-900)", lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 3 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── STATISTIQUES ─────────────────────────────────────────────────────────────
function Statistiques({ produits }: StatistiquesProps) {
  const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const commandes = useMemo(() => jours.map(j => ({
    jour: j,
    ventes: Math.floor(Math.random() * 8) + 1,
    revenus: Math.floor(Math.random() * 500000) + 50000,
  })), []);

  const totalProduits = produits.length;
  const enStock    = produits.filter(p => p.stock).length;
  const enRupture  = produits.filter(p => !p.stock).length;
  const totalVentes  = commandes.reduce((a, j) => a + j.ventes, 0);
  const totalRevenus = commandes.reduce((a, j) => a + j.revenus, 0);

  const plusVendus = useMemo(() =>
    [...produits].sort((a, b) => b.prix - a.prix).slice(0, 5).map(p => ({
      nom: p.nom || "Produit",
      ventes: Math.floor(Math.random() * 20) + 1,
    })), [produits]);

  const parCategorie = useMemo(() => {
    const map: Record<string, number> = {};
    produits.forEach(p => { map[p.categorie || "Inconnu"] = (map[p.categorie || "Inconnu"] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [produits]);

  const tt = { borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 13, fontFamily: "'DM Sans',sans-serif" };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
        <KpiCard label="Total produits"  value={totalProduits} icon="📦" accent={BLUE} />
        <KpiCard label="En stock"        value={enStock}       icon="✅" accent="#059669" sub={`${totalProduits ? Math.round(enStock / totalProduits * 100) : 0}% du catalogue`} />
        <KpiCard label="En rupture"      value={enRupture}     icon="⚠️" accent="#DC2626" />
        <KpiCard label="Ventes semaine"  value={totalVentes}   icon="🛒" accent="#7C3AED" />
        <KpiCard label="Revenus estimés" value={fmt(totalRevenus)} icon="💰" accent="#D97706" sub="Cette semaine" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: "20px 22px" }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, fontFamily: "'Syne',sans-serif" }}>Ventes par jour</p>
          <p style={{ fontSize: 11, color: "var(--gray-400)", marginBottom: 18 }}>Cette semaine</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={commandes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="jour" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tt} formatter={v => [v, "Ventes"]} />
              <Line type="monotone" dataKey="ventes" stroke={BLUE} strokeWidth={2.5} dot={{ fill: BLUE, r: 3.5 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: "20px 22px" }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, fontFamily: "'Syne',sans-serif" }}>Revenus par jour</p>
          <p style={{ fontSize: 11, color: "var(--gray-400)", marginBottom: 18 }}>En FCFA</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={commandes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="jour" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1000) + "k"} />
              <Tooltip contentStyle={tt} formatter={v => [typeof v === "number" ? v.toLocaleString("fr-FR") + " FCFA" : v, "Revenus"]} />
              <Bar dataKey="revenus" fill={BLUE} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: "20px 22px" }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, fontFamily: "'Syne',sans-serif" }}>Produits les plus vendus</p>
          <p style={{ fontSize: 11, color: "var(--gray-400)", marginBottom: 18 }}>Top 5</p>
          {plusVendus.length === 0
            ? <div className="empty-state"><span style={{ fontSize: 28 }}>📦</span><p>Aucun produit</p></div>
            : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={plusVendus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="nom" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip contentStyle={tt} formatter={v => [v, "Ventes"]} />
                  <Bar dataKey="ventes" radius={[0, 5, 5, 0]}>
                    {plusVendus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </div>
        <div className="card" style={{ padding: "20px 22px" }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, fontFamily: "'Syne',sans-serif" }}>Répartition par catégorie</p>
          <p style={{ fontSize: 11, color: "var(--gray-400)", marginBottom: 14 }}>Nombre de produits</p>
          {parCategorie.length === 0
            ? <div className="empty-state"><span style={{ fontSize: 28 }}>📊</span><p>Aucun produit</p></div>
            : <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={parCategorie} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={3} dataKey="value">
                      {parCategorie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tt} formatter={(v, n) => [v + " produit(s)", n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {parCategorie.map((e, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 500 }}>{e.name}</span>
                      <span style={{ fontSize: 11, color: "var(--gray-400)", marginLeft: "auto", paddingLeft: 8 }}>{e.value}</span>
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
function SpecsEditor({ specs, onChange }: SpecsEditorProps) {
  const entries = Object.entries(specs || {});
  const addRow = () => onChange({ ...specs, [`__new_${Date.now()}`]: "" });
  const updateKey = (oldKey: string, newKey: string) => {
    if (newKey !== oldKey && newKey in specs) return;
    const updated: Record<string, string> = {};
    Object.entries(specs).forEach(([k, v]) => { updated[k === oldKey ? newKey : k] = v; });
    onChange(updated);
  };
  const updateVal = (key: string, val: string) => onChange({ ...specs, [key]: val });
  const removeRow = (key: string) => { const s = { ...specs }; delete s[key]; onChange(s); };
  const displayKey = (k: string) => k.startsWith("__new_") ? "" : k;

  return (
    <div style={{ border: "1.5px solid var(--gray-200)", borderRadius: 10, overflow: "hidden" }}>
      {entries.length === 0 && <p style={{ padding: "12px 14px", fontSize: 12, color: "var(--gray-400)" }}>Aucune caractéristique. Cliquez sur "+ Ajouter".</p>}
      {entries.map(([k, v], i) => (
        <div key={`spec-${i}`} className="spec-row" style={{ display: "flex" }}>
          <input value={displayKey(k)} onChange={e => updateKey(k, e.target.value || `__new_${Date.now()}`)} placeholder="Clé (ex: RAM)"
            style={{ flex: 1, padding: "8px 10px", border: "none", borderRight: "1px solid var(--gray-200)", fontSize: 12, fontFamily: "inherit", outline: "none", background: "var(--gray-50)", fontWeight: 600 }} />
          <input value={v} onChange={e => updateVal(k, e.target.value)} placeholder="Valeur (ex: 16 Go)"
            style={{ flex: 2, padding: "8px 10px", border: "none", borderRight: "1px solid var(--gray-200)", fontSize: 12, fontFamily: "inherit", outline: "none" }} />
          <button className="icon-btn" onClick={() => removeRow(k)} style={{ padding: "6px 10px", color: "#ef4444", borderRadius: 0 }}>✕</button>
        </div>
      ))}
      <div style={{ borderTop: entries.length > 0 ? "1px solid var(--gray-200)" : "none" }}>
        <button onClick={addRow} style={{ width: "100%", padding: 9, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: BLUE, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          + Ajouter une caractéristique
        </button>
      </div>
    </div>
  );
}

// ─── IMAGES EDITOR ────────────────────────────────────────────────────────────
function ImagesEditor({ images, onChange }: ImagesEditorProps) {
  const [uploading, setUploading] = useState<number | null>(null);

  const uploadToCloudinary = async (file: File, index: number): Promise<string> => {
    setUploading(index);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "baol_products");
    try {
      const res  = await fetch("https://api.cloudinary.com/v1_1/dlbqggbqt/image/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.secure_url || "";
    } catch (err) {
      alert("Erreur d'upload Cloudinary");
      return "";
    } finally {
      setUploading(null);
    }
  };

  const addUrl    = () => onChange([...images, ""]);
  const updateUrl = (index: number, url: string) => { const next = [...images]; next[index] = url; onChange(next); };
  const removeUrl = (index: number) => onChange(images.filter((_, i) => i !== index));
  const handleFile = async (index: number, file: File) => {
    const url = await uploadToCloudinary(file, index);
    if (url) updateUrl(index, url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {images.map((url, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {url && (
            <img src={url} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0, border: "1px solid var(--gray-200)" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <input className="input" value={url} onChange={e => updateUrl(i, e.target.value)} placeholder="URL de l'image" style={{ fontSize: 12 }} />
          <label style={{ cursor: "pointer", padding: "8px 10px", border: "1.5px solid var(--gray-200)", borderRadius: 8, fontSize: 11, flexShrink: 0 }}>
            {uploading === i ? "⏳" : "📁"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(i, f); }} />
          </label>
          <button className="icon-btn" onClick={() => removeUrl(i)} style={{ color: "#ef4444", flexShrink: 0 }}>✕</button>
        </div>
      ))}
      <button onClick={addUrl} style={{ padding: "8px", background: "none", border: "1.5px dashed var(--gray-300)", borderRadius: 8, cursor: "pointer", fontSize: 12, color: BLUE, fontWeight: 600, fontFamily: "inherit" }}>
        + Ajouter une image
      </button>
    </div>
  );
}

// ─── PRODUIT FORM ─────────────────────────────────────────────────────────────
function ProduitForm({ editTarget, onSave, onCancel, saving }: ProduitFormProps) {
  const isEdit = !!editTarget;
  const [uploadingMain, setUploadingMain] = useState(false);

  const [form, setForm] = useState({
    nom: "", prix: "", categorie: "Ordinateurs", description: "", stock: true,
    img: "", images: [] as string[], specs: {} as Record<string, string>,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTarget) {
      setForm({
        nom:         editTarget.nom         || "",
        prix:        editTarget.prix        ? String(editTarget.prix) : "",
        categorie:   editTarget.categorie   || "Ordinateurs",
        description: editTarget.description || "",
        stock:       editTarget.stock       ?? true,
        img:         getPrimaryImage(editTarget),
        images:      (editTarget.images || []).map(extractUrl).filter(Boolean),
        specs:       { ...(editTarget.specs || {}) },
      });
    } else {
      setForm({ nom: "", prix: "", categorie: "Ordinateurs", description: "", stock: true, img: "", images: [], specs: {} });
    }
    setErrors({});
  }, [editTarget]);

  const set = useCallback((k: string, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }, [errors]);

  const handleMainFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "baol_products");
    try {
      const res  = await fetch("https://api.cloudinary.com/v1_1/dlbqggbqt/image/upload", { method: "POST", body: formData });
      const data = await res.json();
      // L'URL uploadée devient à la fois img ET premier élément de images[]
      if (data.secure_url) {
        set("img", data.secure_url);
        // Si images[] est vide, on l'ajoute aussi pour compatibilité backend
        setForm(f => ({
          ...f,
          img: data.secure_url,
          images: f.images.length === 0 ? [data.secure_url] : f.images,
        }));
      }
    } catch { alert("Erreur upload image principale"); }
    finally { setUploadingMain(false); }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nom.trim()) e.nom = "Le nom est obligatoire.";
    if (!form.prix || isNaN(Number(form.prix)) || Number(form.prix) <= 0) e.prix = "Le prix doit être un nombre positif.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const cleanSpecs: Record<string, string> = {};
    Object.entries(form.specs).forEach(([k, v]) => {
      const cleanKey = k.startsWith("__new_") ? "" : k.trim();
      if (cleanKey) cleanSpecs[cleanKey] = v;
    });

    // S'assurer que img est dans images[] si pas déjà présent
    const allImages = form.images.filter(Boolean);
    if (form.img && !allImages.includes(form.img)) {
      allImages.unshift(form.img);
    }

    onSave({
      id:          editTarget?.id || (editTarget as any)?._id || "",
      nom:         form.nom.trim(),
      prix:        Number(form.prix),
      categorie:   form.categorie,
      description: form.description.trim() || "Aucune description fournie",
      stock:       form.stock,
      img:         form.img || allImages[0] || "",
      images:      allImages,
      specs:       cleanSpecs,
    });
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, height: 1, background: "var(--gray-200)" }} />{title}<span style={{ flex: 3, height: 1, background: "var(--gray-200)" }} />
      </p>
      {children}
    </div>
  );

  return (
    <div className="card slide-down" style={{ padding: "24px 28px", marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>
            {isEdit ? "✏️ Modifier le produit" : "➕ Nouveau produit"}
          </h2>
          {isEdit && <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>ID : {editTarget?.id || (editTarget as any)?._id}</p>}
        </div>
        <button className="btn-ghost" onClick={onCancel}>Annuler</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <Section title="Image principale">
            <div style={{ borderRadius: 12, overflow: "hidden", background: "var(--gray-100)", height: 200, marginBottom: 10 }} className="img-container">
              {form.img
                ? <img src={form.img} alt="Aperçu" className="img-preview"
                    onError={e => { (e.target as HTMLImageElement).src = "/no-image.png"; (e.target as HTMLImageElement).onerror = null; }} />
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray-400)", fontSize: 32 }}>🖼️</div>
              }
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" value={form.img} onChange={e => set("img", e.target.value)} placeholder="URL Cloudinary" style={{ fontSize: 12 }} />
              <label style={{ cursor: "pointer", padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center" }}>
                {uploadingMain ? "⏳" : "📁"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleMainFile} />
              </label>
            </div>
          </Section>
          <Section title="Galerie d'images">
            <ImagesEditor images={form.images} onChange={v => set("images", v)} />
          </Section>
        </div>

        <div>
          <Section title="Informations produit">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input className="input" value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Nom du produit *" style={{ borderColor: errors.nom ? "var(--danger)" : undefined }} />
              {errors.nom && <p style={{ fontSize: 11, color: "var(--danger)" }}>⚠ {errors.nom}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <input className="input" type="number" value={form.prix} onChange={e => set("prix", e.target.value)} placeholder="Prix en FCFA *" style={{ borderColor: errors.prix ? "var(--danger)" : undefined }} />
                  {errors.prix && <p style={{ fontSize: 11, color: "var(--danger)", marginTop: 4 }}>⚠ {errors.prix}</p>}
                </div>
                <select className="input" value={form.categorie} onChange={e => set("categorie", e.target.value)}>
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <textarea className="input" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Description..." rows={3} style={{ resize: "vertical" }} />
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${form.stock ? "#A7F3D0" : "#FECACA"}` }}>
                <input type="checkbox" checked={form.stock} onChange={e => set("stock", e.target.checked)} style={{ accentColor: BLUE }} />
                <span>{form.stock ? "✓ En stock" : "✕ Rupture de stock"}</span>
              </label>
            </div>
          </Section>
          <Section title="Caractéristiques techniques">
            <SpecsEditor specs={form.specs} onChange={v => set("specs", v)} />
          </Section>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end", paddingTop: 20, borderTop: "1px solid var(--gray-100)" }}>
        <button className="btn-ghost" onClick={onCancel}>Annuler</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={saving} style={{ minWidth: 160 }}>
          {saving ? <>⏳ Enregistrement...</> : isEdit ? "✓ Mettre à jour" : "➕ Ajouter le produit"}
        </button>
      </div>
    </div>
  );
}

// ─── CARD PRODUIT ADMIN ───────────────────────────────────────────────────────
function AdminProductCard({ produit, onEdit, onDelete, onToggleStock }: AdminProductCardProps) {
  const mainImg     = getPrimaryImage(produit);
  const nomDisplay  = produit.nom       || "Sans nom";
  const catDisplay  = produit.categorie || "Général";
  const prixDisplay = produit.prix      ?? 0;
  const currentId   = produit.id        || (produit as any)._id;

  return (
    <tr className="row-hover" style={{ borderBottom: "1px solid var(--gray-100)" }}>
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={mainImg || "/no-image.png"}
            alt={nomDisplay}
            style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", background: "var(--gray-100)", flexShrink: 0 }}
            onError={e => { (e.target as HTMLImageElement).src = "/no-image.png"; (e.target as HTMLImageElement).onerror = null; }}
          />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-900)" }}>{nomDisplay}</p>
            <p style={{ fontSize: 11, color: "var(--gray-400)" }}>{catDisplay}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{fmt(prixDisplay)}</td>
      <td style={{ padding: "12px 16px" }}>
        <button onClick={() => onToggleStock(currentId)} className="badge"
          style={{ border: "none", cursor: "pointer", background: produit.stock ? "#D1FAE5" : "#FEE2E2", color: produit.stock ? "var(--success)" : "var(--danger)" }}>
          {produit.stock ? "En Stock" : "Rupture"}
        </button>
      </td>
      <td style={{ padding: "12px 16px", textAlign: "right" }}>
        <button className="icon-btn" onClick={() => onEdit(produit)} style={{ color: BLUE, marginRight: 6 }} title="Modifier">✏️</button>
        <button className="icon-btn" onClick={() => onDelete(currentId)} style={{ color: "var(--danger)" }} title="Supprimer">🗑️</button>
      </td>
    </tr>
  );
}

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
export default function AdminDashboard({ produits = [], onRefresh }: AdminDashboardProps) {
  const [activeTab,  setActiveTab]  = useState<"list" | "stats">("list");
  const [filterCat,  setFilterCat]  = useState("Tous");
  const [search,     setSearch]     = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState<Produit | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState<{ m: string; t: "success" | "error" } | null>(null);

  const triggerToast = (m: string, t: "success" | "error" = "success") => {
    setToast({ m, t });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredProducts = useMemo(() => produits.filter(p => {
    const matchesCat    = filterCat === "Tous" || p.categorie === filterCat;
    const matchesSearch = p.nom.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search);
    return matchesCat && matchesSearch;
  }), [produits, filterCat, search]);

  const handleSave = async (payload: any) => {
    setSaving(true);
    const { nom, prix, categorie, description, stock, img, images, specs } = payload;

    // ─── CORRECTION CLÉ ───────────────────────────────────────────────────────
    // Le backend attend images[] comme tableau d'OBJETS {url, public_id}
    // et stock comme NOMBRE (0 ou 1), pas booléen.
    // On reconstruit images[] au bon format en prenant img + images[] sans doublons.
    const allUrls: string[] = [];
    if (img) allUrls.push(img);
    (images || []).forEach((u: string) => { if (u && !allUrls.includes(u)) allUrls.push(u); });

    const imagesForBackend = allUrls.map(url => ({ url, public_id: "" }));

    const bodyData = {
      name:        nom?.trim(),
      price:       Number(prix),
      category:    categorie,
      description: description?.trim() || "Aucune description fournie",
      stock:       stock ? 1 : 0,          // ← nombre comme le backend attend
      images:      imagesForBackend,        // ← objets {url, public_id}
      specs:       specs || {},
    };
    // ─────────────────────────────────────────────────────────────────────────

    const targetId = editTarget?.id || (editTarget as any)?._id;
    try {
      if (editTarget && targetId) {
        await updateProduct(targetId, bodyData);
        triggerToast("Produit mis à jour avec succès !");
      } else {
        await createProduct(bodyData);
        triggerToast("Nouveau produit ajouté au catalogue !");
      }
      setShowForm(false);
      setEditTarget(null);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Erreur API :", err);
      triggerToast("Une erreur est survenue lors de l'opération.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) return;
    try {
      await deleteProduct(id);
      triggerToast("Produit supprimé de la base de données.");
      if (onRefresh) onRefresh();
    } catch { triggerToast("Erreur lors de la suppression.", "error"); }
  };

  const handleToggleStock = async (id: string | number) => {
    const target = produits.find(p => p.id === id || (p as any)._id === id);
    if (!target) return;
    const targetId = target.id || (target as any)._id;
    try {
      await updateProduct(targetId, {
        name:     target.nom,
        price:    target.prix,
        category: target.categorie,
        stock:    target.stock ? 0 : 1,   // ← nombre
      });
      if (onRefresh) onRefresh();
    } catch { triggerToast("Impossible de modifier le statut du stock.", "error"); }
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      {toast && <Toast message={toast.m} type={toast.t} onClose={() => setToast(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--navy)" }}>Console d'Administration</h1>
          <p style={{ color: "var(--gray-500)", fontSize: 13, marginTop: 2 }}>Gérer le catalogue d'équipements et services technologiques</p>
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }}>
            ➕ Ajouter un produit
          </button>
        )}
      </div>

      {showForm && (
        <ProduitForm
          editTarget={editTarget}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
          saving={saving}
        />
      )}

      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--gray-200)", paddingBottom: 12, marginBottom: 24 }}>
        <button className={`tab-btn ${activeTab === "list"  ? "active" : ""}`} onClick={() => setActiveTab("list")}>📦 Catalogue ({produits.length})</button>
        <button className={`tab-btn ${activeTab === "stats" ? "active" : ""}`} onClick={() => setActiveTab("stats")}>📊 Statistiques & KPIs</button>
      </div>

      {activeTab === "stats" ? (
        <Statistiques produits={produits} />
      ) : (
        <div className="fade-in card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", background: "var(--gray-50)", borderBottom: "1px solid var(--gray-200)", display: "flex", gap: 12, alignItems: "center" }}>
            <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou ID..." style={{ maxWidth: 280, fontSize: 13 }} />
            <select className="input" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ maxWidth: 180, fontSize: 13 }}>
              {FILTER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "white", borderBottom: "2px solid var(--gray-200)", fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "12px 16px" }}>Désignation</th>
                  <th style={{ padding: "12px 16px" }}>Prix unitaire</th>
                  <th style={{ padding: "12px 16px" }}>Statut</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      <span style={{ fontSize: 32 }}>🔍</span>
                      <p style={{ fontWeight: 500, color: "var(--gray-700)" }}>Aucun produit ne correspond à vos critères</p>
                    </td>
                  </tr>
                ) : filteredProducts.map(p => (
                  <AdminProductCard
                    key={p.id}
                    produit={p}
                    onEdit={prod => { setEditTarget(prod); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    onDelete={handleDelete}
                    onToggleStock={handleToggleStock}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}