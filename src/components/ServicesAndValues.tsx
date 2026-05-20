import React, { useState, useEffect, useRef } from "react";

const FORMSPREE_URL = "https://formspree.io/f/mwvzvwdq";

// 1. Interface pour typer la structure d'un service
interface ServiceDetail {
  label: string;
  icon: string;
  title: string;
  desc: string;
  offres: string[];
  tech: string[];
  color: string;
  accent: string;
}

// 2. Définition du dictionnaire de données avec ses clés strictes
const servicesData: Record<string, ServiceDetail> = {
  developpement: {
    label: "Développement",
    icon: "ti-code",
    title: "Développement Web & Mobile",
    desc: "Nous créons des applications web et mobiles performantes, sécurisées et évolutives en utilisant les technologies les plus récentes.",
    offres: ["Applications web responsives", "E-commerce & marketplaces", "Applications métier (ERP, CRM)", "Applications mobiles cross-platform"],
    tech: ["React", "Next.js", "Node.js", "Tailwind CSS"],
    color: "from-blue-600 to-blue-800",
    accent: "#2563EB",
  },
  ia: {
    label: "IA",
    icon: "ti-brain",
    title: "Intelligence Artificielle",
    desc: "Optimisez vos processus métiers grâce à l'intégration de modèles d'IA avancés et d'automatisation intelligente.",
    offres: ["Intégration de LLM (Ollama, GPT)", "Automatisation des workflows", "Analyse prédictive de données", "Chatbots intelligents personnalisés"],
    tech: ["Python", "Ollama", "TensorFlow", "OpenAI API"],
    color: "from-violet-600 to-purple-800",
    accent: "#7C3AED",
  },
  infrastructure: {
    label: "Cloud & DevOps",
    icon: "ti-server",
    title: "Infrastructure & Cloud",
    desc: "Solutions de haute disponibilité et gestion de serveurs pour une infrastructure robuste et scalable.",
    offres: ["Architecture Cloud & Hybride", "Déploiement DevOps (CI/CD)", "Gestion de serveurs Linux", "Virtualisation et conteneurisation"],
    tech: ["Docker", "Kubernetes", "AWS/GCP", "Linux"],
    color: "from-teal-600 to-cyan-800",
    accent: "#0D9488",
  },
  securite: {
    label: "Cybersécurité",
    icon: "ti-shield-lock",
    title: "Cybersécurité & SOC",
    desc: "Protection proactive de vos actifs numériques et audit complet de vos systèmes d'information.",
    offres: ["Audits de vulnérabilité", "Mise en place de SOC (Wazuh)", "Sécurisation des réseaux", "Réponse aux incidents"],
    tech: ["Wazuh", "Metasploit", "Nmap", "Wireshark"],
    color: "from-red-600 to-rose-800",
    accent: "#DC2626",
  },
  maintenance: {
    label: "Maintenance",
    icon: "ti-tool",
    title: "Maintenance & Support",
    desc: "Maintenance préventive et curative de votre parc informatique et support technique spécialisé.",
    offres: ["Maintenance électronique de précision", "Support technique 24/7", "Optimisation des performances", "Réparation hardware spécialisée"],
    tech: ["Diagnostic", "Micro-soudure", "Gestion de parc", "Remote Support"],
    color: "from-orange-500 to-amber-700",
    accent: "#D97706",
  },
};

// Interface pour le formulaire de devis
interface FormDevis {
  prenom: string;
  nom: string;
  email: string;
  tel: string;
  entreprise: string;
  service: string;
  detail: string;
}

// Hook CustomuseInView proprement typé pour les éléments HTML div
function useInView(threshold = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const obs = new IntersectionObserver(([e]) => { 
      if (e.isIntersecting) setVisible(true); 
    }, { threshold });
    
    if (currentRef) obs.observe(currentRef);
    return () => {
      if (currentRef) obs.unobserve(currentRef);
      obs.disconnect();
    };
  }, [threshold]);

  return [ref, visible];
}

// Props pour le composant DevisModal
interface DevisModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicePreselect: string;
}

function DevisModal({ isOpen, onClose, servicePreselect }: DevisModalProps) {
  const [form, setForm] = useState<FormDevis>({
    prenom: "", nom: "", email: "", tel: "", entreprise: "", service: servicePreselect || "", detail: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormDevis, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    if (isOpen) {
      setForm(f => ({ ...f, service: servicePreselect || "" }));
      setErrors({});
      setStatus("idle");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, servicePreselect]);

  const validate = () => {
    const e: Partial<Record<keyof FormDevis, string>> = {};
    if (!form.prenom.trim()) e.prenom = "Requis";
    if (!form.nom.trim()) e.nom = "Requis";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalide";
    if (!form.tel.trim()) e.tel = "Requis";
    if (!form.service) e.service = "Choisissez un service";
    if (!form.detail.trim() || form.detail.trim().length < 10) e.detail = "Minimum 10 caractères";
    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof FormDevis]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Prénom: form.prenom,
          Nom: form.nom,
          Email: form.email,
          Téléphone: form.tel,
          Entreprise: form.entreprise || "Non renseigné",
          "Service souhaité": form.service,
          "Détail du projet": form.detail,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  const inputClass = (field: keyof FormDevis) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white text-gray-800 ${
      errors[field] ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 text-gray-800">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-base font-bold text-gray-900">Demande de devis</h2>
            <p className="text-xs text-gray-400 mt-0.5">Envoi par email — réponse sous 24h</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Succès */}
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h3>
            <p className="text-gray-500 text-sm mb-6">Votre demande a bien été reçue. Nous vous répondrons sous 24h.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-[#02101f] text-white text-sm font-bold hover:opacity-90 transition-opacity">
              Fermer
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Prénom <span className="text-red-400">*</span></label>
                <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Ex: Moussa" className={inputClass("prenom")} />
                {errors.prenom && <p className="text-red-400 text-xs mt-1">{errors.prenom}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nom <span className="text-red-400">*</span></label>
                <input name="nom" value={form.nom} onChange={handleChange} placeholder="Ex: Diop" className={inputClass("nom")} />
                {errors.nom && <p className="text-red-400 text-xs mt-1">{errors.nom}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-400">*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="exemple@mail.com" className={inputClass("email")} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone <span className="text-red-400">*</span></label>
              <input name="tel" type="tel" value={form.tel} onChange={handleChange} placeholder="+221 77 000 00 00" className={inputClass("tel")} />
              {errors.tel && <p className="text-red-400 text-xs mt-1">{errors.tel}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Entreprise <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input name="entreprise" value={form.entreprise} onChange={handleChange} placeholder="Ex: Société XYZ" className={inputClass("entreprise")} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Service souhaité <span className="text-red-400">*</span></label>
              <select name="service" value={form.service} onChange={handleChange} className={inputClass("service")}>
                <option value="">— Choisissez un service —</option>
                {Object.values(servicesData).map((s) => (
                  <option key={s.title} value={s.title}>{s.title}</option>
                ))}
                <option value="Autre / Je ne sais pas encore">Autre / Je ne sais pas encore</option>
              </select>
              {errors.service && <p className="text-red-400 text-xs mt-1">{errors.service}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Détail du projet <span className="text-red-400">*</span></label>
              <textarea
                name="detail" value={form.detail} onChange={handleChange} rows={4}
                placeholder="Décrivez votre projet, vos besoins, votre budget estimé..."
                className={`${inputClass("detail")} resize-none`}
              />
              {errors.detail && <p className="text-red-400 text-xs mt-1">{errors.detail}</p>}
            </div>

            {status === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                Une erreur s'est produite. Veuillez réessayer ou nous contacter directement.
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex gap-3 items-start">
              <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-700 leading-relaxed">
                Votre demande sera transmise par <strong>email</strong> à notre équipe. Nous vous répondrons sous <strong>24h</strong>.
              </p>
            </div>

            <div className="flex gap-3 pt-1 pb-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={status === "sending"}
                className="flex-[2] flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-[#02101f] text-white text-sm font-bold hover:opacity-90 transition-all hover:scale-[1.02] shadow-md disabled:opacity-60"
              >
                {status === "sending" ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Envoyer la demande
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Services() {
  const [activeTab, setActiveTab] = useState<string>("developpement");
  const [animating, setAnimating] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [headerRef, headerVisible] = useInView(0.1);
  const [contentRef, contentVisible] = useInView(0.1);

  // Utilisation sécurisée de l'indexation par clé dynamique
  const current = servicesData[activeTab];

  const changeTab = (key: string) => {
    if (key === activeTab) return;
    setAnimating(true);
    setTimeout(() => { setActiveTab(key); setAnimating(false); }, 200);
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      <DevisModal isOpen={modalOpen} onClose={() => setModalOpen(false)} servicePreselect={current.title} />

      <div ref={headerRef} className="relative h-[380px] bg-[#02101f] flex flex-col items-center justify-center text-white px-6 overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full border border-white/5" />
        <div className="absolute top-[-40px] right-[-40px] w-56 h-56 rounded-full border border-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full bg-white/20"
              style={{ left: `${10 + (i * 53) % 85}%`, top: `${15 + (i * 37) % 70}%` }} />
          ))}
        </div>
        <div className="relative z-10 text-center transition-all duration-700"
          style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? "translateY(0)" : "translateY(-24px)" }}>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3 px-3 py-1 border border-blue-500/30 rounded-full bg-blue-500/10">
            Ce que nous faisons
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Nos <span className="text-blue-400">Services</span></h1>
          <p className="text-lg max-w-xl mx-auto text-white/70">Des solutions technologiques complètes pour propulser votre entreprise vers le futur.</p>
        </div>
        <div className="absolute bottom-0 w-full">
          <svg viewBox="0 0 1440 80" fill="none"><path d="M0 80L1440 80L1440 0C1170 60 270 60 0 0L0 80Z" fill="white" /></svg>
        </div>
      </div>

      <div className="max-w-5xl mx-auto -mt-6 relative z-20 px-4">
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {Object.entries(servicesData).map(([key, val]) => (
            <button key={key} onClick={() => changeTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md ${
                activeTab === key ? "bg-[#02101f] text-white scale-105 shadow-lg" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
              }`}>
              <i className={`ti ${val.icon} text-base`} />
              {val.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={contentRef} className="max-w-5xl mx-auto py-14 px-6"
        style={{ opacity: contentVisible ? 1 : 0, transform: contentVisible ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
        <div className="grid md:grid-cols-3 gap-8 transition-all duration-200"
          style={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(8px)" : "translateY(0)" }}>

          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${current.color} flex items-center justify-center`}>
                  <i className={`ti ${current.icon} text-white text-lg`} />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900">{current.title}</h2>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">{current.desc}</p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Technologies utilisées</h4>
              <div className="flex flex-wrap gap-3">
                {current.tech.map((t: string, i: number) => (
                  <span key={i} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl text-sm font-semibold text-gray-700 border border-gray-200">
                    <i className="ti ti-stack text-base" style={{ color: current.accent }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r ${current.color} hover:opacity-90 transition-all hover:scale-105 shadow-md`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Demander un devis
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-gray-100 shadow-sm h-fit" style={{ background: `${current.accent}08` }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full" style={{ background: current.accent }} />
              <h3 className="text-base font-bold text-gray-800">Ce que nous offrons</h3>
            </div>
            <ul className="space-y-3">
              {current.offres.map((offre: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${current.accent}20` }}>
                    <svg className="w-3 h-3" style={{ color: current.accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm font-medium leading-snug">{offre}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-500 font-medium">Disponible — réponse sous 24h</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-12 pt-10 border-t border-gray-100">
          {[{ val: "50+", label: "Projets livrés" }, { val: "98%", label: "Satisfaction client" }, { val: "24/7", label: "Support disponible" }].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-extrabold text-gray-900">{s.val}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}