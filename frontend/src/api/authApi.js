import api from "./axiosInstance";

export async function loginUser(credentials) {
  const res = await api.post("/auth/login", credentials);
  return res.data;
}

export async function logoutUser() {
  const res = await api.post("/auth/logout");
  return res.data;
}

export async function getMe() {
  const res = await api.get("/auth/me");
  return res.data;
}