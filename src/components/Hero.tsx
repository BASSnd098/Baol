import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Hook pour la navigation entre les pages
import biglogo from "../assets/biglogo.jpeg";
import logo1 from "../assets/logo1.jpg";
import logo2 from "../assets/logo2.jpg";

export default function Hero() {
  const navigate = useNavigate();
  const images = [biglogo, logo1, logo2];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="hero min-h-[90vh] relative overflow-hidden flex items-center justify-start px-6 md:px-20 font-sans bg-[#02101f]">
      
      {/* IMAGES DE FOND CYCLIQUES */}
      {images.map((img, index) => (
        <div 
          key={index}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out scale-105"
          style={{ 
            backgroundImage: `url(${img})`,
            filter: "brightness(0.5)",
            opacity: index === currentIndex ? 1 : 0
          }}
        />
      ))}
      
      {/* OVERLAY DYNAMIQUE */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#02101f] via-[#02101f]/90 to-transparent"></div>
      
      {/* CONTENU PRINCIPAL */}
      <div className="hero-content text-left text-white relative z-10 p-0">
        <div className="max-w-2xl">
          
          <div className="inline-block px-3 py-1 mb-6 border border-blue-400/50 rounded-full bg-blue-400/10 animate-pulse">
            <span className="text-blue-400 text-sm font-medium tracking-widest uppercase">
              Innovation sans limites
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tight mb-4">
            Baol_<span className="text-blue-400">Technologies</span>
          </h1>

          <p className="mb-8 text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg">
            Expertise de pointe en Cybersécurité, DevOps et Infrastructures Réseaux. 
            Nous propulsons votre transformation digitale avec des solutions intelligentes et du matériel haute performance.
          </p>
          
          <div className="flex flex-wrap gap-5">
            {/* BOUTON BOUTIQUE : Envoie vers la page boutique */}
            <button 
              onClick={() => navigate("/boutique")} 
              className="group relative btn btn-primary bg-blue-600 hover:bg-blue-700 border-none px-8 py-4 flex items-center gap-3 rounded-lg transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-lg font-semibold uppercase tracking-wider">Explorer la Boutique</span>
            </button>
            
            {/* BOUTON AUDIT & CONSULTING : Envoie vers la page services */}
            <button 
              onClick={() => navigate("/services")} 
              className="btn btn-outline border-white/30 text-white hover:bg-white hover:text-[#02101f] px-8 py-4 flex items-center gap-3 rounded-lg backdrop-blur-sm transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-lg font-semibold uppercase tracking-wider">Audit & Consulting</span>
            </button>
          </div>
          
        </div>
      </div>

      {/* INDICATEUR DE DÉFILEMENT */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
         <span className="text-[10px] uppercase tracking-[0.3em] text-white">Découvrir</span>
         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7" />
         </svg>
      </div>
    </div>
  );
}