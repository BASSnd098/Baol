import { useState } from "react";
import { Link } from "react-router-dom"; // Import indispensable pour la navigation
import logo from "../assets/new.jpeg";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Style commun pour les liens du menu
  const linkStyle = "text-sm font-medium hover:text-blue-400 transition-colors";
  const mobileLinkStyle = "text-left py-2 border-b border-white/5 hover:text-blue-400 transition-colors";

  return (
    <nav className="navbar bg-[#02101f] text-white shadow-md px-6 fixed top-0 w-full z-[100]">
      {/* GAUCHE : LOGO ET NOM (Lien vers l'accueil) */}
      <div className="flex-1 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Baol Technologies Logo" 
            className="w-10 h-10 rounded-full border border-blue-500/30" 
          />
          <span className="text-lg md:text-xl font-bold tracking-tight text-white whitespace-nowrap">
             Baol_<span className="text-blue-400">Technologies</span>
          </span>
        </Link>
      </div>

      {/* DROITE : MENU ORDINATEUR */}
      <div className="hidden md:flex gap-6 items-center">
        <Link to="/" className={linkStyle}>Accueil</Link>
        <Link to="/services" className={linkStyle}>Services</Link>
        <Link to="/boutique" className={linkStyle}>Boutique</Link>
        <Link to="/apropos" className={linkStyle}>À propos</Link>
        <Link 
          to="/contact" 
          className="btn btn-primary btn-sm bg-blue-600 border-none hover:bg-blue-700 ml-2 px-4 text-white"
        >
          Contact
        </Link>
      </div>

      {/* BOUTON HAMBURGER MOBILE */}
      <div className="md:hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="btn btn-square btn-ghost text-white"
          aria-label="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MENU DÉROULANT MOBILE */}
      <div className={`absolute top-full left-0 w-full bg-[#02101f] border-t border-white/10 p-4 flex flex-col gap-4 shadow-2xl md:hidden transition-all duration-300 ${
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
      }`}>
        <Link to="/" className={mobileLinkStyle} onClick={() => setIsOpen(false)}>Accueil</Link>
        <Link to="/services" className={mobileLinkStyle} onClick={() => setIsOpen(false)}>Services</Link>
        <Link to="/boutique" className={mobileLinkStyle} onClick={() => setIsOpen(false)}>Boutique</Link>
        <Link to="/apropos" className={mobileLinkStyle} onClick={() => setIsOpen(false)}>À propos</Link>
        <Link 
          to="/contact" 
          className="btn btn-primary bg-blue-600 border-none w-full mt-2 text-white" 
          onClick={() => setIsOpen(false)}
        >
          Contact
        </Link>
      </div>
    </nav>
  );
}