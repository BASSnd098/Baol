// src/api/api.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const fetchJSON = async (endpoint, options = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erreur ${res.status}`);
  }
  return res.json();
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginAdmin = (email, password) =>
  fetchJSON("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

// ─── Produits publics ─────────────────────────────────────────────────────────
export const getProducts = ()   => fetchJSON("/products");
export const getProduct  = (id) => fetchJSON(`/products/${id}`);

// ─── Produits admin (token requis) ───────────────────────────────────────────
export const createProduct = (data) =>
  fetchJSON("/admin/products", {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify(data),
  });

export const updateProduct = (id, data) =>
  fetchJSON(`/admin/products/${id}`, {
    method:  "PUT",
    headers: authHeaders(),
    body:    JSON.stringify(data),
  });

export const deleteProduct = (id) =>
  fetchJSON(`/admin/products/${id}`, {
    method:  "DELETE",
    headers: authHeaders(),
  });