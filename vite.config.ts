import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),  
    tailwindcss(),

  ],

  server: {
    host: '0.0.0', // Permet d'accéder à l'application depuis d'autres appareils sur le même réseau
    port: 5173, // Vous pouvez changer le port si nécessaire
    open: true, // Ouvre automatiquement le navigateur
  },
})
