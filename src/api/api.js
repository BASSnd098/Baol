// src/api/api.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Fonction utilitaire pour récupérer proprement le token
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token ? `Bearer ${token}` : "";
};

const fetchJSON = async (endpoint, options = {}) => {
  // On prépare les headers de base requis pour toutes nos requêtes JSON
  const headers = {
    "Content-Type": "application/json",
  };

  // On injecte dynamiquement le token s'il existe en LocalStorage
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = token;
  }

  // On fusionne avec les éventuels headers spécifiques passés en option
  const finalOptions = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, finalOptions);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erreur ${res.status}`);
  }
  
  return res.json();
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginAdmin = (email, password) =>
  fetchJSON("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

// ─── Produits publics ─────────────────────────────────────────────────────────
export const getProducts = ()   => fetchJSON("/products");
export const getProduct  = (id) => fetchJSON(`/products/${id}`);

// ─── Produits admin (Le token est maintenant géré automatiquement) ────────────
export const createProduct = (data) =>
  fetchJSON("/admin/products", {
    method:  "POST",
    body:    JSON.stringify(data),
  });

export const updateProduct = (id, data) =>
  fetchJSON(`/admin/products/${id}`, {
    method:  "PUT",
    body:    JSON.stringify(data),
  });

export const deleteProduct = (id) =>
  fetchJSON(`/admin/products/${id}`, {
    method:  "DELETE",
  });