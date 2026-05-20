import { useEffect, useRef, useState } from "react";
// Vos imports d'images restent inchangés
import logo13 from "../assets/logo13.jpg";
import logo8 from "../assets/logo8.jpg";
import logocloud from "../assets/logocloud.jpg";
import logodev from "../assets/logodev.jpg";
import logoia from "../assets/logoia.jpeg";
import logo88 from "../assets/logo88.jpeg";
import exellent from "../assets/exellent.jpeg";
import rapide from "../assets/rapide.png";
import solution from "../assets/solution.png";
import approche from "../assets/approche.jpeg";

// ==================== DONNÉES AMÉLIORÉES ====================
const services = [
  {
    img: logodev,
    title: "Ingénierie Logicielle",
    desc: "Développement de plateformes web innovantes (React, Next.js) et applications métiers sur mesure.",
  },
  {
    img: logoia,
    title: "IA & Automatisation",
    desc: "Intégration d'intelligence artificielle (Ollama) pour l'optimisation des flux de travail.",
  },
  {
    img: logocloud,
    title: "DevOps & Infrastructure",
    desc: "Déploiement continu, scalabilité cloud et gestion de serveurs haute performance.",
  },
  {
    img: logo88,
    title: "Cybersécurité Avancée",
    desc: "Surveillance SOC intelligente (Wazuh), audits de vulnérabilité et protection des données.",
  },
  {
    img: logo13,
    title: "Ingénierie Hardware",
    desc: "Maintenance électronique de précision et diagnostic d'équipements informatiques critiques.",
  },
  {
    img: logo8,
    title: "Conseil & Sourcing IT",
    desc: "Consulting stratégique et vente de matériel informatique premium (Dell XPS, serveurs).",
  },
];

const valeurs = [
  {
    img: exellent,
    title: "Excellence & Maîtrise",
    desc: "Expertise technique validée par une Licence en Cybersécurité & DevOps et un BTS en Électronique.",
  },
  {
    img: approche,
    title: "Proximité & Agilité",
    desc: "Basés à Mermoz, nous intervenons avec réactivité pour des solutions parfaitement adaptées à vos besoins.",
  },
  {
    img: solution,
    title: "Sécurité par Design",
    desc: "La sécurité n'est pas une option, elle est intégrée nativement dans chaque ligne de code et chaque montage.",
  },
  {
    img: rapide,
    title: "Disponibilité Totale",
    desc: "Support technique professionnel et maintenance préventive pour garantir la continuité de vos activités.",
  },
];

// ==================== COMPOSANTS RÉUTILISABLES ====================

function FadeInSection({ children, delay = 0 }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setVisible(true);
      });
    }, { threshold: 0.1 });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ==================== SECTION SERVICES & VALEURS ====================

export default function ServicesAndValues() {
  return (
    // L'identifiant clé est placé ici pour cibler le scroll automatique depuis le Hero
    <div id="services-section" className="font-sans relative z-10">
      
      {/* SECTION SERVICES */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Nos <span className="text-blue-600">Expertises</span>
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Des solutions technologiques sans limites pour propulser votre entreprise dans l'ère digitale.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className="group bg-gray-50 rounded-3xl p-4 transition-all duration-300 hover:bg-white hover:shadow-2xl border border-transparent hover:border-blue-100">
                  <div className="relative h-56 w-full mb-6 overflow-hidden rounded-2xl">
                    <img 
                      src={service.img} 
                      alt={service.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {service.desc}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION VALEURS */}
      <section className="py-24 px-6 bg-gradient-to-b from-blue-50 to-white text-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi <span className="text-blue-600">Baol_Technologies</span> ?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              L'alliance de la rigueur technique et de l'innovation constante.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valeurs.map((valeur, i) => (
              <FadeInSection key={i} delay={i * 150}>
                <div className="h-full bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden mb-6 shadow-lg border-2 border-white">
                    <img src={valeur.img} alt={valeur.title} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight">
                    {valeur.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {valeur.desc}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}