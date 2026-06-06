import React, { useState } from "react";

//const NAVY = "#02101f";
const BLUE = "#1a6cff";
const FORMSPREE_URL = "https://formspree.io/f/mwvzvwdq";

interface FormContact {
  nomComplet: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const [formData, setFormData] = useState<FormContact>({
    nomComplet: "",
    email: "",
    telephone: "",
    sujet: "Demande de partenariat",
    message: "",
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
          nomComplet: "",
          email: "",
          telephone: "",
          sujet: "Demande de partenariat",
          message: "",
        });
        setTimeout(() => setSubmitStatus("idle"), 5000);
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
      padding: "48px 24px 80px",
    },
    wrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "64px",
    },
    badge: {
      display: "inline-block",
      background: "rgba(26,108,255,0.1)",
      color: BLUE,
      fontSize: "12px",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "2px",
      padding: "6px 16px",
      borderRadius: "30px",
      marginBottom: "16px",
    },
    title: {
      fontSize: "clamp(32px, 5vw, 48px)",
      fontWeight: 800,
      color: NAVY,
      marginBottom: "16px",
    },
    titleSpan: {
      color: BLUE,
    },
    subtitle: {
      color: "#64748b",
      fontSize: "16px",
      maxWidth: "600px",
      margin: "0 auto",
      lineHeight: 1.6,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
      gap: "48px",
      alignItems: "start",
    },
    infoCard: {
      background: "#fff",
      borderRadius: "20px",
      padding: "24px",
      border: "1px solid #e2e8f0",
      display: "flex",
      gap: "16px",
      alignItems: "flex-start",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
    infoIcon: {
      width: "52px",
      height: "52px",
      background: "rgba(26,108,255,0.1)",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      flexShrink: 0,
    },
    infoTitle: {
      fontSize: "14px",
      fontWeight: 700,
      color: NAVY,
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      marginBottom: "6px",
    },
    infoValue: {
      fontSize: "18px",
      fontWeight: 700,
      color: "#1e293b",
      marginBottom: "4px",
    },
    infoDesc: {
      fontSize: "12px",
      color: "#64748b",
    },
    link: {
      color: BLUE,
      textDecoration: "none",
      transition: "color 0.2s",
    },
    assuranceCard: {
      background: NAVY,
      borderRadius: "20px",
      padding: "24px",
      color: "#fff",
      marginTop: "24px",
    },
    assuranceTitle: {
      fontSize: "14px",
      fontWeight: 700,
      color: BLUE,
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      marginBottom: "12px",
    },
    assuranceText: {
      fontSize: "13px",
      color: "#94a3b8",
      lineHeight: 1.6,
    },
    formCard: {
      background: "#fff",
      borderRadius: "24px",
      padding: "32px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    },
    formTitle: {
      fontSize: "22px",
      fontWeight: 800,
      color: NAVY,
      marginBottom: "24px",
    },
    inputGroup: {
      marginBottom: "20px",
    },
    label: {
      fontSize: "12px",
      fontWeight: 600,
      color: NAVY,
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      marginBottom: "8px",
      display: "block",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1.5px solid #e2e8f0",
      fontSize: "14px",
      transition: "all 0.2s",
      outline: "none",
      background: "#f8fafc",
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
      background: "#f8fafc",
    },
    select: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1.5px solid #e2e8f0",
      fontSize: "14px",
      background: "#f8fafc",
      outline: "none",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      marginBottom: "20px",
    },
    button: {
      width: "100%",
      background: BLUE,
      color: "#fff",
      border: "none",
      padding: "14px 24px",
      borderRadius: "40px",
      fontSize: "13px",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    successAlert: {
      background: "#d1fae5",
      color: "#065f46",
      padding: "14px",
      borderRadius: "12px",
      fontSize: "13px",
      fontWeight: 500,
      marginBottom: "20px",
      textAlign: "center" as const,
    },
    errorAlert: {
      background: "#fee2e2",
      color: "#991b1b",
      padding: "14px",
      borderRadius: "12px",
      fontSize: "13px",
      fontWeight: 500,
      marginBottom: "20px",
      textAlign: "center" as const,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <span style={styles.badge}>Contact &amp; Support Technique</span>
          <h1 style={styles.title}>
            Concrétisons vos <span style={styles.titleSpan}>ambitions technologiques</span>
          </h1>
          <p style={styles.subtitle}>
            Une question technique ? Un besoin urgent de maintenance ou de déploiement d'infrastructure au Sénégal ? 
            Nos équipes vous répondent sous 24h.
          </p>
        </div>

        <div style={styles.grid}>
          
          {/* LEFT SIDE - CONTACT INFO */}
          <div>
            {/* Phone Card */}
            <div 
              style={styles.infoCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={styles.infoIcon}>📞</div>
              <div>
                <h3 style={styles.infoTitle}>Ligne Directe</h3>
                <p style={styles.infoValue}>+221 77 930 09 09</p>
                <p style={styles.infoDesc}>Disponible pour urgences et assistance technique</p>
              </div>
            </div>

            {/* Email Card */}
            <div 
              style={styles.infoCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={styles.infoIcon}>✉️</div>
              <div>
                <h3 style={styles.infoTitle}>Courriel Professionnel</h3>
                <a 
                  href="mailto:contact@baoltechnologies.com" 
                  style={{ ...styles.link, fontSize: "16px", fontWeight: 700 }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#1557d9"}
                  onMouseLeave={(e) => e.currentTarget.style.color = BLUE}
                >
                  contact@baoltechnologie.com
                </a>
                <p style={styles.infoDesc}>Pour vos cahiers des charges et demandes de cotation</p>
              </div>
            </div>

            {/* Location Card */}
            <div 
              style={styles.infoCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={styles.infoIcon}>📍</div>
              <div>
                <h3 style={styles.infoTitle}>Ancrage &amp; Déploiement</h3>
                <p style={styles.infoValue}>Dakar &amp; Régions, Sénégal</p>
                <p style={styles.infoDesc}>Interventions sur site et livraison d'équipements sécurisés</p>
              </div>
            </div>

            {/* Assurance Card */}
            <div style={styles.assuranceCard}>
              <h4 style={styles.assuranceTitle}>Cellule technique intégrée</h4>
              <p style={styles.assuranceText}>
                Chaque message est directement traité par un ingénieur spécialisé en électronique et réseaux, 
                garantissant une réponse techniquement précise sans intermédiaire commercial.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - CONTACT FORM */}
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Formulaire de correspondance</h2>

            <form onSubmit={handleSubmit}>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nom complet ou Raison sociale *</label>
                <input
                  type="text"
                  name="nomComplet"
                  required
                  value={formData.nomComplet}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Ex: Assane Diop / Entreprise XYZ"
                  onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                />
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Adresse Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="adresse@mail.com"
                    onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Numéro de Téléphone *</label>
                  <input
                    type="tel"
                    name="telephone"
                    required
                    value={formData.telephone}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="+221 ..."
                    onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Objet de votre message</label>
                <select
                  name="sujet"
                  value={formData.sujet}
                  onChange={handleChange}
                  style={styles.select}
                  onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                >
                  <option value="Demande de partenariat">📊 Demande de partenariat digital</option>
                  <option value="Achat d'équipements / Stock">🖥️ Acquisition de matériel informatique / IoT</option>
                  <option value="Support technique / Maintenance">🔧 Support technique / Maintenance</option>
                  <option value="Autre demande">📝 Autre demande spécifique</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Votre Message *</label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  style={styles.textarea}
                  placeholder="Détaillez votre demande ici..."
                  onFocus={(e) => e.currentTarget.style.borderColor = BLUE}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                />
              </div>

              {/* Status Messages */}
              {submitStatus === "success" && (
                <div style={styles.successAlert}>
                  ✓ Votre message a été transmis avec succès à l'équipe technique de Baol Technologies.
                </div>
              )}
              {submitStatus === "error" && (
                <div style={styles.errorAlert}>
                  ✕ Erreur réseau. Merci de réitérer l'envoi ou d'utiliser le contact téléphonique direct.
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...styles.button,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = "#1557d9";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = BLUE;
                }}
              >
                {isSubmitting ? "Envoi en cours..." : "Transmettre mon message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}