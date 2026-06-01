import React, { useState } from "react";

const NAVY = "#02101f";
const BLUE = "#1a6cff";
const FORMSPREE_URL = "https://formspree.io/f/mwvzvwdq";

interface FormDevis {
  prenom: string;
  nom: string;
  email: string;
  tel: string;
  entreprise: string;
  service: string;
  detail: string;
}

export default function AboutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const [formData, setFormData] = useState<FormDevis>({
    prenom: "",
    nom: "",
    email: "",
    tel: "",
    entreprise: "",
    service: "Infrastructure Réseau",
    detail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          prenom: "",
          nom: "",
          email: "",
          tel: "",
          entreprise: "",
          service: "Infrastructure Réseau",
          detail: "",
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitStatus("idle");
        }, 2500);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "#f8fafc",
    },
    hero: {
      background: `linear-gradient(135deg, ${NAVY} 0%, #0a2a4a 50%, ${NAVY} 100%)`,
      padding: "80px 24px",
      textAlign: "center" as const,
      position: "relative" as const,
      overflow: "hidden",
    },
    heroOverlay: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "radial-gradient(circle at 30% 50%, rgba(26,108,255,0.1) 0%, transparent 70%)",
    },
    badge: {
      display: "inline-block",
      background: "rgba(26,108,255,0.15)",
      color: BLUE,
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase" as const,
      letterSpacing: "2px",
      padding: "6px 16px",
      borderRadius: "30px",
      marginBottom: "20px",
    },
    title: {
      fontSize: "clamp(32px, 5vw, 56px)",
      fontWeight: 800,
      color: "#fff",
      marginBottom: "20px",
      lineHeight: 1.2,
    },
    subtitle: {
      fontSize: "clamp(16px, 3vw, 18px)",
      color: "#94a3b8",
      maxWidth: "700px",
      margin: "0 auto",
      lineHeight: 1.6,
    },
    statCard: {
      background: "#fff",
      borderRadius: "20px",
      padding: "28px 20px",
      textAlign: "center" as const,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
    statNumber: {
      fontSize: "42px",
      fontWeight: 800,
      color: BLUE,
      marginBottom: "8px",
    },
    statLabel: {
      fontSize: "14px",
      fontWeight: 700,
      color: NAVY,
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      marginBottom: "8px",
    },
    statDesc: {
      fontSize: "12px",
      color: "#64748b",
    },
    sectionTitle: {
      fontSize: "clamp(24px, 4vw, 32px)",
      fontWeight: 800,
      color: NAVY,
      marginBottom: "16px",
    },
    valueCard: {
      background: "#fff",
      borderRadius: "16px",
      padding: "24px",
      border: "1px solid #e2e8f0",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
    ctaSection: {
      background: `linear-gradient(135deg, ${NAVY} 0%, #0a2a4a 100%)`,
      borderRadius: "32px",
      padding: "60px 40px",
      textAlign: "center" as const,
      position: "relative" as const,
      overflow: "hidden",
    },
    modal: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    },
    modalContent: {
      background: "#fff",
      borderRadius: "24px",
      maxWidth: "600px",
      width: "100%",
      maxHeight: "90vh",
      overflow: "auto",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    },
    modalHeader: {
      background: NAVY,
      padding: "24px",
      color: "#fff",
      borderTopLeftRadius: "24px",
      borderTopRightRadius: "24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1.5px solid #e2e8f0",
      fontSize: "14px",
      transition: "all 0.2s",
      outline: "none",
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1.5px solid #e2e8f0",
      fontSize: "14px",
      fontFamily: "inherit",
      resize: "vertical" as const,
      outline: "none",
    },
    select: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1.5px solid #e2e8f0",
      fontSize: "14px",
      background: "#fff",
      outline: "none",
    },
    button: {
      background: BLUE,
      color: "#fff",
      border: "none",
      padding: "12px 24px",
      borderRadius: "40px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
    },
  };

  return (
    <div style={styles.container}>
      {/* HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "1200px", margin: "0 auto" }}>
          <span style={styles.badge}>Expertise & Innovation</span>
          <h1 style={styles.title}>
            L'ingénierie technologique <br />
            <span style={{ color: BLUE }}>au service de votre performance</span>
          </h1>
          <p style={styles.subtitle}>
            Baol Technologies accompagne les entreprises, les écoles et les organisations dans leur transformation digitale 
            à travers des solutions d'infrastructure réseau, d'IoT et d'équipements de pointe.
          </p>
        </div>
      </section>

      {/* STATS SECTION */}
      <section style={{ maxWidth: "1200px", margin: "-40px auto 0", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div style={styles.statCard}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={styles.statNumber}>100%</div>
            <div style={styles.statLabel}>Équipements Certifiés</div>
            <div style={styles.statDesc}>Matériel audité et testé par nos ingénieurs</div>
          </div>
          <div style={styles.statCard}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={styles.statNumber}>24/7</div>
            <div style={styles.statLabel}>Support Technique</div>
            <div style={styles.statDesc}>Une réactivité immédiate à la hauteur de vos défis</div>
          </div>
          <div style={styles.statCard}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={styles.statNumber}>Sénégal</div>
            <div style={styles.statLabel}>Ancrage Local</div>
            <div style={styles.statDesc}>Proximité technique et disponibilité sur le terrain</div>
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section style={{ maxWidth: "1200px", margin: "80px auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "48px", alignItems: "center" }}>
          <div>
            <h2 style={styles.sectionTitle}>
              Pourquoi faire confiance à <span style={{ color: BLUE }}>Baol Technologies</span> ?
            </h2>
            <p style={{ color: "#475569", marginBottom: "16px", lineHeight: 1.6 }}>
              Dans un écosystème en constante mutation, posséder des outils technologiques fiables n'est plus une option : 
              c'est le pilier central de votre compétitivité.
            </p>
            <p style={{ color: "#475569", lineHeight: 1.6 }}>
              Née d'une expertise rigoureuse en maintenance électronique, en réseaux industriels et en cybersécurité, 
              <strong style={{ color: NAVY, fontWeight: 600 }}> Baol Technologies</strong> s'est imposée comme le partenaire 
              stratégique des structures exigeantes.
            </p>
          </div>
          
          <div style={{ background: NAVY, padding: "40px", borderRadius: "24px", color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: "-20px", bottom: "-30px", fontSize: "120px", opacity: 0.05, fontWeight: 800 }}>BT</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px", color: BLUE }}>Notre Engagement Qualité</h3>
            <p style={{ color: "#94a3b8", marginBottom: "24px", lineHeight: 1.6 }}>
              Chaque équipement distribué sur notre plateforme fait l'objet d'un audit de conformité technique strict.
            </p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ color: BLUE, fontSize: "20px" }}>✓</span>
                <span>Traçabilité totale des composants matériels</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ color: BLUE, fontSize: "20px" }}>✓</span>
                <span>Configuration système optimisée pour les pros</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ color: BLUE, fontSize: "20px" }}>✓</span>
                <span>Conseils d'experts avant-vente neutres et transparents</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section style={{ background: "#f1f5f9", padding: "80px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={styles.sectionTitle}>Nos Valeurs Piliers</h2>
            <p style={{ color: "#64748b" }}>Ce qui guide chacune de nos interventions</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
            <div style={styles.valueCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{ width: "56px", height: "56px", background: "#e0f2fe", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "20px" }}>
                🛠️
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: NAVY, marginBottom: "12px" }}>Rigueur &amp; Expertise</h3>
              <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: "14px" }}>
                Issus des métiers techniques de l'électronique et des télécommunications, nous maîtrisons les couches matérielles et logicielles.
              </p>
            </div>

            <div style={styles.valueCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{ width: "56px", height: "56px", background: "#e0f2fe", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "20px" }}>
                🛡️
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: NAVY, marginBottom: "12px" }}>Sécurité Native</h3>
              <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: "14px" }}>
                Nous intégrons les meilleures pratiques de la cybersécurité dès la sélection de vos équipements.
              </p>
            </div>

            <div style={styles.valueCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{ width: "56px", height: "56px", background: "#e0f2fe", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "20px" }}>
                🚀
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: NAVY, marginBottom: "12px" }}>Innovation Accessible</h3>
              <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: "14px" }}>
                Rendre l'IoT, l'automatisme et les réseaux industriels accessibles aux acteurs économiques locaux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ maxWidth: "1200px", margin: "80px auto", padding: "0 24px" }}>
        <div style={styles.ctaSection}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: "#fff", marginBottom: "16px" }}>
            Un projet d'envergure en vue ?
          </h2>
          <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "0 auto 32px", lineHeight: 1.6 }}>
            Qu'il s'agisse de déployer un parc informatique, de sécuriser un réseau complexe ou de concevoir 
            une architecture IoT sur mesure, notre équipe technique est prête.
          </p>
          <button 
            onClick={() => { setIsModalOpen(true); setSubmitStatus("idle"); }}
            style={styles.button}
            onMouseEnter={(e) => e.currentTarget.style.background = "#1557d9"}
            onMouseLeave={(e) => e.currentTarget.style.background = BLUE}
          >
            Contacter un Ingénieur Conseil
          </button>
        </div>
      </section>

      {/* MODAL */}
      {isModalOpen && (
        <div style={styles.modal} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "4px" }}>Demande de Devis Technique</h3>
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>Échangez avec notre cellule d'ingénierie</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: "none", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer" }}
              >✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>Prénom *</label>
                  <input
                    type="text"
                    name="prenom"
                    required
                    value={formData.prenom}
                    onChange={handleChange}
                    style={styles.input}
                    onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>Nom *</label>
                  <input
                    type="text"
                    name="nom"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    style={styles.input}
                    onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                    onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>Téléphone *</label>
                  <input
                    type="tel"
                    name="tel"
                    required
                    value={formData.tel}
                    onChange={handleChange}
                    placeholder="+221 ..."
                    style={styles.input}
                    onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>Organisation / Entreprise</label>
                <input
                  type="text"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>Service Cible *</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  style={styles.select}
                  onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                >
                  <option value="Maintenance">Maintenance &amp; Support IT</option>
                  <option value="Cybersécurité">Cybersécurité, SOC &amp; Administration Systèmes</option>
                  <option value="Développement">Développement Web &amp; Applications</option>
                  <option value="IA">Solutions d’Intelligence Artificielle</option>
                  <option value="Infrastructure">Infrastructure &amp; Systèmes</option>
                  <option value="Autre">Autre Besoin Spécifique</option>
                </select>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>Cahier des charges / Détails du besoin *</label>
                <textarea
                  name="detail"
                  required
                  value={formData.detail}
                  onChange={handleChange}
                  rows={4}
                  style={styles.textarea}
                  onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  placeholder="Décrivez les spécifications techniques attendues..."
                />
              </div>

              {submitStatus === "success" && (
                <div style={{ background: "#d1fae5", color: "#065f46", padding: "12px", borderRadius: "12px", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>
                  ✓ Demande reçue ! Un ingénieur vous contactera sous 24h.
                </div>
              )}
              {submitStatus === "error" && (
                <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "12px", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>
                  ✕ Échec de l'envoi. Veuillez réessayer.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "10px 20px", borderRadius: "40px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    ...styles.button,
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le dossier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}