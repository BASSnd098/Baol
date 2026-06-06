import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

//const NAVY = "#02101f";
const BLUE = "#1a6cff";

export default function AdminLogin() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err: any) {
      setError(err?.message || "Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, #000080 0%, #0a1f3d 60%, #0d2a4a 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .li { width:100%; padding:13px 16px; border:1.5px solid rgba(255,255,255,0.1); border-radius:12px; background:rgba(255,255,255,0.05); color:white; font-family:inherit; font-size:14px; outline:none; transition:border 0.2s,background 0.2s; }
        .li::placeholder { color:rgba(255,255,255,0.3); }
        .li:focus { border-color:${BLUE}; background:rgba(26,108,255,0.08); box-shadow:0 0 0 3px rgba(26,108,255,0.15); }
        .lb { width:100%; padding:14px; background:${BLUE}; color:white; border:none; border-radius:12px; font-family:inherit; font-size:15px; font-weight:700; cursor:pointer; transition:opacity 0.15s,transform 0.1s; }
        .lb:hover:not(:disabled) { opacity:0.88; }
        .lb:active:not(:disabled) { transform:scale(0.98); }
        .lb:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width:60, height:60, background:BLUE, borderRadius:18, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:26, marginBottom:16, boxShadow:`0 8px 24px rgba(26,108,255,0.4)` }}>🔒</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:"white", letterSpacing:"-0.03em", marginBottom:6 }}>
            BAOL <span style={{ color:BLUE }}>TECH</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>Panneau d'administration</p>
        </div>

        {/* Card */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"32px 28px", backdropFilter:"blur(12px)" }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"white", marginBottom:6 }}>Connexion</h2>
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:13, marginBottom:24 }}>Accès réservé aux administrateurs</p>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.5)", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.08em" }}>Email</label>
              <input className="li" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@baoltech.com" autoComplete="email" disabled={loading} />
            </div>

            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.5)", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.08em" }}>Mot de passe</label>
              <div style={{ position:"relative" }}>
                <input className="li" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" disabled={loading} style={{ paddingRight:48 }} />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:"rgba(255,255,255,0.35)", padding:0 }} tabIndex={-1}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background:"rgba(220,38,38,0.12)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:10, padding:"10px 14px", color:"#fca5a5", fontSize:13 }}>
                ⚠️ {error}
              </div>
            )}

            <button className="lb" type="submit" disabled={loading} style={{ marginTop:4 }}>
              {loading ? "Connexion en cours…" : "Se connecter →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign:"center", marginTop:20, fontSize:12, color:"rgba(255,255,255,0.2)" }}>
          BaolTech Admin · Accès sécurisé JWT
        </p>
      </div>
    </div>
  );
}