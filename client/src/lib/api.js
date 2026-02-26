import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "findease-token";

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: (email, password) => api.post("/api/auth/login", { email, password }).then((r) => r.data),
  signup: (name, email, password) =>
    api.post("/api/auth/signup", { name, email, password }).then((r) => r.data),
  getMe: () => api.get("/api/auth/me").then((r) => r.data),
};

// Approved items only (for dashboard – recent items for everyone)
export async function fetchApprovedLostItems() {
  const res = await api.get("/api/lost/approved");
  return res.data?.items ?? [];
}

export async function fetchAllLostItems() {
  const res = await api.get("/api/lost/all");
  return res.data?.items ?? [];
}

export async function addLostItem(payload) {
  const res = await api.post("/api/lost/add", payload);
  return res.data;
}

export async function addFoundItem(payload) {
  const res = await api.post("/api/lost/add", { ...payload, reportedAs: "found" });
  return res.data;
}

export async function fetchMyReports() {
  const res = await api.get("/api/lost/my-reports");
  return res.data?.items ?? [];
}

export async function fetchPendingItems() {
  const res = await api.get("/api/lost/pending");
  return res.data?.items ?? [];
}

export async function approveItem(id) {
  const res = await api.patch(`/api/lost/${id}/approve`);
  return res.data;
}

export async function createClaim(itemId, message, contactInfo = "") {
  const res = await api.post("/api/claims", { itemId, message, contactInfo });
  return res.data;
}

export async function fetchClaims() {
  const res = await api.get("/api/claims");
  return res.data?.claims ?? [];
}

export async function updateClaimStatus(claimId, status) {
  const res = await api.patch(`/api/claims/${claimId}`, { status });
  return res.data;
}
