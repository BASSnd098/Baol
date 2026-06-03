import React, { useState, useEffect } from "react";
import directeur from "../assets/mamoune.jpeg";
import signatur from "../assets/signe.jpeg";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const [formData, setFormData] = useState<FormDevis>({
    prenom: "",
    nom: "",
    email: "",
    tel: "",
    entreprise: "",
    service: "Infrastructure",
    detail: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
          Accept: "application/json",
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
          service: "Infrastructure",
          detail: "",
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitStatus("idle");
        }, 2500);
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─────────────────────────── STYLES ─────────────────────────── */
  const styles: Record<string, React.CSSProperties> = {
    /* Container : PAS de overflowX hidden ici — ça bloquait le scroll du modal */
    container: {
      minHeight: "100vh",
      background: "#f8fafc",
    },

    hero: {
      background: `linear-gradient(135deg, ${NAVY} 0%, #0a2a4a 50%, ${NAVY} 100%)`,
      padding: isMobile ? "60px 16px 80px" : "80px 24px 120px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    },
    heroOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        "radial-gradient(circle at 30% 50%, rgba(26,108,255,0.1) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    badge: {
      display: "inline-block",
      background: "rgba(26,108,255,0.15)",
      color: BLUE,
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "2px",
      padding: "6px 16px",
      borderRadius: "30px",
      marginBottom: "20px",
    },
    title: {
      fontSize: "clamp(22px, 5vw, 56px)",
      fontWeight: 800,
      color: "#fff",
      marginBottom: "20px",
      lineHeight: 1.2,
    },
    subtitle: {
      fontSize: "clamp(14px, 3vw, 18px)",
      color: "#94a3b8",
      maxWidth: "700px",
      margin: "0 auto",
      lineHeight: 1.6,
    },

    /* Stats : on sort du héro en négatif uniquement sur desktop */
    statsWrapper: {
      maxWidth: "1200px",
      margin: isMobile ? "0 auto" : "-60px auto 0",
      padding: isMobile ? "0 16px" : "0 24px",
      position: "relative",
      zIndex: 10,
      /* Sur mobile on ne remonte pas dans le héro */
      transform: isMobile ? "translateY(-40px)" : "none",
    },
    statsGrid: {
      display: "grid",
      /* Sur mobile 1 colonne, sinon auto-fit avec minmax raisonnable */
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
      gap: "16px",
    },
    statCard: {
      background: "#fff",
      borderRadius: "20px",
      padding: "28px 20px",
      textAlign: "center",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    },
    statNumber: {
      fontSize: "clamp(28px, 6vw, 42px)",
      fontWeight: 800,
      color: BLUE,
      marginBottom: "8px",
    },
    statLabel: {
      fontSize: "13px",
      fontWeight: 700,
      color: NAVY,
      textTransform: "uppercase",
      letterSpacing: "1px",
      marginBottom: "8px",
    },
    statDesc: {
      fontSize: "12px",
      color: "#64748b",
    },

    sectionTitle: {
      fontSize: "clamp(20px, 4vw, 32px)",
      fontWeight: 800,
      color: NAVY,
      marginBottom: "16px",
    },
    valueCard: {
      background: "#fff",
      borderRadius: "16px",
      padding: "24px",
      border: "1px solid #e2e8f0",
    },
    ctaSection: {
      background: `linear-gradient(135deg, ${NAVY} 0%, #0a2a4a 100%)`,
      borderRadius: isMobile ? "16px" : "32px",
      padding: isMobile ? "40px 20px" : "60px 40px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    },

    /* Modal : utilise position fixed + overflow auto sur le contenu */
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      zIndex: 9999,
      display: "flex",
      alignItems: isMobile ? "flex-end" : "center",
      justifyContent: "center",
      padding: isMobile ? "0" : "16px",
      /* PAS de overflow hidden ici */
    },
    modalContent: {
      background: "#fff",
      borderRadius: isMobile ? "24px 24px 0 0" : "24px",
      width: "100%",
      maxWidth: isMobile ? "100%" : "600px",
      /* Sur mobile on prend 95 % de la hauteur et on scroll à l'intérieur */
      maxHeight: isMobile ? "95dvh" : "90vh",
      overflowY: "auto",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
      /* Évite que le contenu dépasse */
      boxSizing: "border-box",
    },
    modalHeader: {
      background: NAVY,
      padding: "20px 24px",
      color: "#fff",
      borderTopLeftRadius: isMobile ? "24px" : "24px",
      borderTopRightRadius: isMobile ? "24px" : "24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 1,
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1.5px solid #e2e8f0",
      fontSize: "16px", /* 16px évite le zoom auto sur iOS */
      outline: "none",
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1.5px solid #e2e8f0",
      fontSize: "16px",
      fontFamily: "inherit",
      resize: "vertical",
      outline: "none",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1.5px solid #e2e8f0",
      fontSize: "16px",
      background: "#fff",
      outline: "none",
      boxSizing: "border-box",
      appearance: "auto" as any,
    },
    button: {
      background: BLUE,
      color: "#fff",
      border: "none",
      padding: "14px 28px",
      borderRadius: "40px",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
      width: isMobile ? "100%" : "auto",
      touchAction: "manipulation",
    },
    timelineItem: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "12px" : "32px",
      marginBottom: "40px",
      position: "relative",
      alignItems: isMobile ? "flex-start" : "center",
    },
  };

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <div style={styles.container}>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "1200px", margin: "0 auto" }}>
          <span style={styles.badge}>Expertise & Innovation</span>
          <h1 style={styles.title}>
            L'ingénierie technologique <br />
            <span style={{ color: BLUE }}>au service de votre performance</span>
          </h1>
          <p style={styles.subtitle}>
            Baol Technologies accompagne les entreprises, les écoles et les organisations dans leur
            transformation digitale à travers des solutions d'infrastructure réseau, d'IoT et
            d'équipements de pointe.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={styles.statsWrapper}>
        <div style={styles.statsGrid}>
          {[
            { number: "100%", label: "Équipements Certifiés", desc: "Matériel audité et testé par nos ingénieurs" },
            { number: "24/7", label: "Support Technique", desc: "Une réactivité immédiate à la hauteur de vos défis" },
            { number: "Sénégal", label: "Ancrage Local", desc: "Proximité technique et disponibilité sur le terrain" },
          ].map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statNumber}>{s.number}</div>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statDesc}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{ maxWidth: "1200px", margin: isMobile ? "20px auto 60px" : "80px auto", padding: "0 16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: "32px",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={styles.sectionTitle}>
              Pourquoi faire confiance à{" "}
              <span style={{ color: BLUE }}>Baol Technologies</span> ?
            </h2>
            <p style={{ color: "#475569", marginBottom: "16px", lineHeight: 1.6 }}>
              Dans un écosystème en constante mutation, posséder des outils technologiques fiables
              n'est plus une option : c'est le pilier central de votre compétitivité.
            </p>
            <p style={{ color: "#475569", lineHeight: 1.6 }}>
              Née d'une expertise rigoureuse en maintenance électronique, en réseaux industriels et
              en cybersécurité,{" "}
              <strong style={{ color: NAVY, fontWeight: 600 }}>Baol Technologies</strong> s'est
              imposée comme le partenaire stratégique des structures exigentes.
            </p>
          </div>

          <div
            style={{
              background: NAVY,
              padding: isMobile ? "24px 20px" : "40px",
              borderRadius: "24px",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "-20px",
                bottom: "-30px",
                fontSize: "120px",
                opacity: 0.05,
                fontWeight: 800,
              }}
            >
              BT
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px", color: BLUE }}>
              Notre Engagement Qualité
            </h3>
            <p style={{ color: "#94a3b8", marginBottom: "24px", lineHeight: 1.6 }}>
              Chaque équipement distribué sur notre plateforme fait l'objet d'un audit de
              conformité technique strict.
            </p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {[
                "Traçabilité totale des composants matériels",
                "Configuration système optimisée pour les pros",
                "Conseils d'experts avant-vente neutres et transparents",
              ].map((item) => (
                <li
                  key={item}
                  style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}
                >
                  <span style={{ color: BLUE, fontSize: "20px", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: "14px" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── HISTOIRE ── */}
      <section style={{ maxWidth: "1200px", margin: isMobile ? "40px auto" : "100px auto", padding: "0 16px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: "32px",
            padding: isMobile ? "28px 16px" : "60px 40px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span
              style={{
                color: BLUE,
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "2px",
                display: "block",
                marginBottom: "12px",
              }}
            >
              Parcours & Évolution
            </span>
            <h2 style={{ ...styles.sectionTitle, marginBottom: "16px" }}>Notre Histoire</h2>
            <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "600px", margin: "0 auto" }}>
              Une aventure bâtie sur l'expérience terrain et la passion des technologies.
            </p>
          </div>

          <div style={{ position: "relative", maxWidth: "850px", margin: "0 auto", padding: "10px 0" }}>
            {!isMobile && (
              <div
                style={{
                  position: "absolute",
                  left: "31px",
                  top: "40px",
                  bottom: "40px",
                  width: "2px",
                  background: `linear-gradient(to bottom, ${BLUE} 0%, #e2e8f0 100%)`,
                  opacity: 0.6,
                }}
              />
            )}

            {[
              {
                icon: "2022",
                title: "Les Prestations Indépendantes",
                text: "L'aventure qui a conduit à la création de Baol Technologies a débuté en 2022 à travers des prestations indépendantes de maintenance électronique, informatique et réseau réalisées auprès de particuliers, d'entreprises et d'organisations.",
                last: false,
              },
              {
                icon: "🚀",
                title: "Diversification & Expansion",
                text: "Au fil des missions, les besoins des clients se sont diversifiés et les projets sont devenus plus ambitieux. Pour répondre efficacement à cette demande croissante, plusieurs techniciens et spécialistes ont été mobilisés afin d'apporter des solutions toujours plus complètes et performantes.",
                last: false,
              },
              {
                icon: "🏢",
                title: "Naissance d'un Écosystème Global",
                text: "Cette dynamique a progressivement donné naissance à une structure organisée, capable d'accompagner les entreprises dans les domaines des infrastructures réseau, de la cybersécurité, du développement d'applications, de l'intelligence artificielle, des systèmes connectés et de la maintenance technique spécialisée.",
                last: false,
              },
              {
                icon: "BAOL",
                title: "Une Équipe Consolidée",
                text: "Aujourd'hui, Baol Technologies s'appuie sur une équipe composée d'une dizaine de techniciens, ingénieurs et consultants engagés autour d'un même objectif : fournir des solutions fiables, innovantes et adaptées aux réalités du marché africain.",
                last: true,
              },
            ].map((step, i) => (
              <div key={i} style={{ ...styles.timelineItem, marginBottom: step.last ? 0 : "40px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    minWidth: "64px",
                    borderRadius: "50%",
                    background: step.last
                      ? `linear-gradient(135deg, ${BLUE} 0%, ${NAVY} 100%)`
                      : "#e0f2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    boxShadow: "0 0 0 6px #fff",
                    fontSize: step.icon === "2022" ? "14px" : step.icon === "BAOL" ? "12px" : "18px",
                    fontWeight: 800,
                    color: step.last ? "#fff" : BLUE,
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: step.last ? BLUE : NAVY,
                      marginBottom: "8px",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: "#475569", lineHeight: 1.7, margin: 0, fontSize: "14px" }}>
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOT DU DIRECTEUR ── */}
      <section style={{ background: "#f8fafc", padding: isMobile ? "50px 16px" : "100px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "48px",
              alignItems: "flex-start",
            }}
          >
            {/* Profil Card */}
            <div
              style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, #0a2a4a 100%)`,
                borderRadius: "24px",
                padding: isMobile ? "32px 20px" : "48px 32px",
                textAlign: "center",
                color: "#fff",
                boxShadow: "0 20px 40px rgba(2, 16, 31, 0.15)",
                width: isMobile ? "100%" : "340px",
                flexShrink: 0,
                boxSizing: "border-box",
              }}
            >
              <div style={{ position: "relative", display: "inline-block", marginBottom: "24px" }}>
                <img
                  src={directeur}
                  alt="Modou Mamoune Ndoye"
                  style={{
                    width: isMobile ? "160px" : "200px",
                    height: isMobile ? "176px" : "220px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    objectPosition: "top center",
                    border: `4px solid ${BLUE}`,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    background: BLUE,
                    color: "#fff",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  🛡️
                </span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "6px" }}>
                Modou Mamoune Ndoye
              </h3>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                  fontWeight: 500,
                  marginBottom: "24px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Fondateur & CEO
              </p>
              <div style={{ width: "40px", height: "3px", background: BLUE, margin: "0 auto" }} />
            </div>

            {/* Message */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  color: BLUE,
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  display: "block",
                  marginBottom: "12px",
                }}
              >
                Édito de la direction
              </span>
              <h2 style={{ ...styles.sectionTitle, marginBottom: "24px" }}>Message du CEO</h2>
              <div style={{ fontSize: "15px", color: "#334155", lineHeight: "1.8" }}>
                <p style={{ fontWeight: 600, color: NAVY, fontSize: "17px", marginBottom: "20px" }}>
                  Chers visiteurs, chers partenaires,
                </p>
                <p style={{ marginBottom: "20px", fontStyle: "italic", color: "#475569" }}>
                  Bienvenue chez Baol Technologies.
                </p>
                <p style={{ marginBottom: "20px" }}>
                  Notre ambition est simple : mettre la technologie au service de la performance,
                  de la sécurité et de la croissance des organisations. Dans un monde où la
                  transformation numérique est devenue un levier stratégique, nous avons choisi de
                  bâtir une entreprise fondée sur l'excellence technique, la proximité avec nos
                  clients et la recherche permanente de solutions innovantes.
                </p>
                <p style={{ marginBottom: "20px" }}>
                  Depuis nos premières interventions techniques jusqu'à la création de Baol
                  Technologies, notre priorité est restée la même : fournir des services fiables,
                  transparents et adaptés aux besoins réels de nos partenaires.
                </p>
                <p style={{ marginBottom: "32px" }}>
                  Aujourd'hui, avec une équipe de techniciens, d'ingénieurs et de consultants
                  passionnés, nous accompagnons les entreprises, établissements et organisations
                  dans leurs projets technologiques les plus ambitieux.
                </p>
              </div>
              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "4px" }}>
                    Haute considération,
                  </p>
                  <strong style={{ color: NAVY, fontSize: "17px", fontWeight: 700 }}>
                    Modou Mamoune Ndoye
                  </strong>
                  <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                    Directeur Général, Baol Technologies
                  </p>
                </div>
                <img
                  src={signatur}
                  alt="Signature officielle"
                  style={{ height: "50px", objectFit: "contain", maxWidth: "140px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALEURS ── */}
      <section style={{ background: "#f1f5f9", padding: isMobile ? "50px 16px" : "60px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={styles.sectionTitle}>Nos Valeurs Piliers</h2>
            <p style={{ color: "#64748b" }}>Ce qui guide chacune de nos interventions</p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {[
              {
                icon: "🛠️",
                title: "Rigueur & Expertise",
                desc: "Issus des métiers techniques de l'électronique et des télécommunications, nous maîtrisons les couches matérielles et logicielles.",
              },
              {
                icon: "🛡️",
                title: "Sécurité Native",
                desc: "Nous intégrons les meilleures pratiques de la cybersécurité dès la sélection de vos équipements.",
              },
              {
                icon: "🚀",
                title: "Innovation Accessible",
                desc: "Rendre l'IoT, l'automatisme et les réseaux industriels accessibles aux acteurs économiques locaux.",
              },
            ].map((v) => (
              <div key={v.title} style={styles.valueCard}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    background: "#e0f2fe",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    marginBottom: "20px",
                  }}
                >
                  {v.icon}
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: NAVY, marginBottom: "12px" }}>
                  {v.title}
                </h3>
                <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: "14px" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: "1200px", margin: "60px auto", padding: "0 16px" }}>
        <div style={styles.ctaSection}>
          <h2
            style={{
              fontSize: "clamp(20px, 4vw, 32px)",
              fontWeight: 800,
              color: "#fff",
              marginBottom: "16px",
            }}
          >
            Un projet d'envergure en vue ?
          </h2>
          <p
            style={{
              color: "#94a3b8",
              maxWidth: "600px",
              margin: "0 auto 32px",
              lineHeight: 1.6,
              fontSize: "15px",
            }}
          >
            Qu'il s'agisse de déployer un parc informatique, de sécuriser un réseau complexe ou de
            concevoir une architecture IoT sur mesure, notre équipe technique est prête.
          </p>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setSubmitStatus("idle");
            }}
            style={styles.button}
          >
            Contacter un Ingénieur Conseil
          </button>
        </div>
      </section>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div style={styles.modal} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>

            {/* Header sticky */}
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px" }}>
                  Demande de Devis Technique
                </h3>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
                  Échangez avec notre cellule d'ingénierie
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: "24px",
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: "4px",
                  touchAction: "manipulation",
                }}
              >
                ✕
              </button>
            </div>

            {/* Form body */}
            <div style={{ padding: isMobile ? "20px 16px" : "32px" }}>
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      required
                      value={formData.prenom}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      required
                      value={formData.nom}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="tel"
                      required
                      value={formData.tel}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>
                    Nom de l'entreprise ou Organisation
                  </label>
                  <input
                    type="text"
                    name="entreprise"
                    value={formData.entreprise}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>
                    Service Principal *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="Infrastructure">Infrastructure Réseau &amp; Télécoms</option>
                    <option value="Cybersecurite">Cybersécurité &amp; Audit</option>
                    <option value="IoT">IoT &amp; Systèmes Connectés</option>
                    <option value="Maintenance">Maintenance Électronique Spécialisée</option>
                  </select>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: NAVY, marginBottom: "6px", display: "block" }}>
                    Détails de votre besoin technique *
                  </label>
                  <textarea
                    name="detail"
                    rows={4}
                    required
                    value={formData.detail}
                    onChange={handleChange}
                    style={styles.textarea}
                    placeholder="Décrivez votre projet..."
                  />
                </div>

                <button type="submit" disabled={isSubmitting} style={styles.button}>
                  {isSubmitting ? "Envoi en cours…" : "Envoyer ma demande"}
                </button>

                {submitStatus === "success" && (
                  <p
                    style={{
                      color: "#10b981",
                      fontSize: "14px",
                      fontWeight: 600,
                      marginTop: "16px",
                      textAlign: "center",
                    }}
                  >
                    ✓ Demande transmise avec succès ! Notre équipe vous recontactera sous 24h.
                  </p>
                )}
                {submitStatus === "error" && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "14px",
                      fontWeight: 600,
                      marginTop: "16px",
                      textAlign: "center",
                    }}
                  >
                    ✕ Une erreur est survenue lors de l'envoi. Veuillez réessayer.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}