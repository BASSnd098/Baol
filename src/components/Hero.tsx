import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import biglogo from "../assets/biglogo.jpeg";
import logo1 from "../assets/logo1.jpg";
import logo2 from "../assets/logo2.jpg";

export default function Hero() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isLg, setIsLg] = useState(window.innerWidth >= 1024);

  const images = [biglogo, logo1, logo2];

  const services = useMemo(() => [
    { label: "Développement Web & Applications",       icon: "💻" },
    { label: "Automatisation & Solutions IA",           icon: "🤖" },
    { label: "Réseaux, Cloud & DevOps",                 icon: "☁️" },
    { label: "Cybersécurité & Protection des Données",  icon: "🔒" },
    { label: "Maintenance & Support Informatique",      icon: "🛠️" },
    { label: "Installation & Solutions Technologiques", icon: "⚙️" },
  ], []);

  // Suivi taille écran pour les dots
  useEffect(() => {
    const handler = () => setIsLg(window.innerWidth >= 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Keepalive — empêche le navigateur de throttler les timers
  useEffect(() => {
    const id = setInterval(() => {}, 1000);
    return () => clearInterval(id);
  }, []);

  // Préchargement des images
  useEffect(() => {
    images.forEach(src => { const img = new Image(); img.src = src; });
  }, []);

  // Carrousel images — setTimeout récursif (résistant au throttling)
  useEffect(() => {
    if (paused) return;
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      setCurrentIndex(prev => (prev + 1) % 3);
      timeout = setTimeout(tick, 5000);
    };
    timeout = setTimeout(tick, 5000);
    return () => clearTimeout(timeout);
  }, [paused]);

  // Rotation services avec fondu
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setServiceIndex(prev => (prev + 1) % services.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, [services.length]);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center lg:justify-start px-4 sm:px-8 md:px-16 lg:px-24 font-sans bg-[#010a13]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >

      {/* ── IMAGES DE FOND ── */}
      {images.map((img, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${img})`,
            filter: "brightness(0.35) contrast(1.1)",
            opacity: index === currentIndex ? 1 : 0,
            transition: "opacity 1500ms ease-in-out",
          }}
        />
      ))}

      {/* ── OVERLAY ── */}
      <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-[#010a13] via-[#010a13]/95 sm:via-[#010a13]/85 to-[#010a13]/40" />

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto py-20 lg:py-0">
        <div className="max-w-3xl text-center lg:text-left flex flex-col items-center lg:items-start space-y-6 md:space-y-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-blue-400 text-xs md:text-sm font-semibold tracking-wider uppercase">
              Innovation sans limites
            </span>
          </div>

          {/* Titre */}
          <h1
            aria-label="Baol Technologie"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.1]"
          >
            Baol_<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400">Technologie</span>
          </h1>

          {/* Card service animé */}
          <div className="w-full max-w-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md p-5 md:p-6 rounded-2xl shadow-2xl flex flex-col items-center lg:items-start text-center lg:text-left">
            <div
              style={{
                transition: "opacity 0.4s ease, transform 0.4s ease",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(6px)",
              }}
              className="flex items-center justify-center lg:justify-start gap-3 mb-3"
            >
              <span className="text-2xl md:text-3xl">{services[serviceIndex].icon}</span>
              <span className="text-blue-400 font-bold text-lg md:text-xl tracking-wide">
                {services[serviceIndex].label}
              </span>
            </div>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light">
              Des solutions sur mesure pour propulser votre transformation digitale —
              du développement à la sécurité, du cloud au support terrain.
            </p>

            {/* Dots services */}
            <div className="flex gap-2 mt-5 justify-center lg:justify-start w-full">
              {services.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setServiceIndex(i); setVisible(true); }}
                  aria-label={services[i].label}
                  className="h-1.5 rounded-full transition-all duration-300 border-none p-0 cursor-pointer"
                  style={{
                    width: i === serviceIndex ? 24 : 6,
                    background: i === serviceIndex ? "#3b82f6" : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <button
              onClick={() => navigate("/boutique")}
              className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 flex items-center justify-center gap-3 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-base font-bold tracking-wide">Explorer la Boutique</span>
            </button>

            <button
              onClick={() => navigate("/services")}
              className="w-full sm:w-auto bg-white/[0.04] hover:bg-white text-white hover:text-[#010a13] border border-white/10 hover:border-white px-8 py-4 flex items-center justify-center gap-3 rounded-xl backdrop-blur-sm transition-all duration-300 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-base font-bold tracking-wide">Audit & Consulting</span>
            </button>
          </div>

          {/* ── STATS ── */}
          <div className="flex items-center gap-6 pt-2 flex-wrap justify-center lg:justify-start">
            {[
              { value: "6+",   label: "Services" },
              { value: "100%", label: "Sur mesure" },
              { value: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-6">
                {i > 0 && (
                  <div className="w-px h-8 hidden sm:block" style={{ background: "rgba(255,255,255,0.1)" }} />
                )}
                <div>
                  <div className="text-white font-black text-xl leading-none">{stat.value}</div>
                  <div className="text-gray-500 text-xs uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── DOTS CARROUSEL IMAGES ── */}
      <div className="absolute bottom-24 lg:bottom-12 right-4 sm:right-8 md:right-16 lg:right-24 flex lg:flex-col gap-2.5 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Image ${i + 1}`}
            className="rounded-full transition-all duration-300 border-none p-0 cursor-pointer"
            style={{
              width:  isLg ? 8  : (i === currentIndex ? 24 : 8),
              height: isLg ? (i === currentIndex ? 24 : 8) : 8,
              background: i === currentIndex ? "#3b82f6" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      {/* ── SCROLL INDICATOR ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 opacity-40 hover:opacity-80 transition-opacity duration-300 pointer-events-none">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white">Découvrir</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7-7-7" />
        </svg>
      </div>

    </div>
  );
}