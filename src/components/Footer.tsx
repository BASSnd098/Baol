import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6"; // Pour l'icône X
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    { icon: <FaFacebookF />, href: "#" },
    { icon: <FaXTwitter />, href: "#" },
    { icon: <FaLinkedinIn />, href: "#" },
    { icon: <FaInstagram />, href: "#" },
  ];

  const services = [
    "Maintenance Informatique",
    "Cybersécurité & DevOps",
    "Administration Réseaux",
    "Développement Web",
    "Support Technique",
    "Vente de matériel informatique",
  ];

  return (
    <footer className="bg-[#111827] text-gray-400 py-12 px-6 md:px-20 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Colonne 1 : Logo et Description */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Baol<span className="text-blue-500">Technologies</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-xs">
            Excellence technologique et innovation au service de votre entreprise.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social, i) => (
              <a
                key={i}
                href={social.href}
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Colonne 2 : Services */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6">Services</h3>
          <ul className="space-y-4">
            {services.map((service, i) => (
              <li key={i}>
                <a href="#" className="hover:text-blue-500 transition-colors">
                  {service}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Colonne 3 : Contact */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6">Contact</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Phone size={20} className="text-blue-500 shrink-0" />
              <span className="text-sm">+221 77 930 09 09</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={20} className="text-blue-500 shrink-0" />
              <span className="text-sm">modoundoye1998@gmail.com</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={20} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-sm">Dakar, Sénégal</p>
                <p className="text-sm">Diourbel, Sénégal</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Colonne 4 : Horaires */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6">Horaires</h3>
          <div className="space-y-2 text-sm">
            <p>Lundi - Vendredi: 8h - 18h</p>
            <p>Samedi: 9h - 13h</p>
            <p className="pt-4 italic text-blue-400">Support 24/7</p>
          </div>
        </div>
      </div>

      {/* Barre de copyright */}
      <div className="mt-16 pt-8 border-t border-gray-800 text-center text-sm">
        <p>© 2026 Baol Technologies. Tous droits réservés.</p>
        
             <p className="mt-2 text-gray-400">
                 NINEA : XXXXXXXX • RCCM : SN-DKR-XXXX-XXXX
           </p>
      </div>
    </footer>
  );
}