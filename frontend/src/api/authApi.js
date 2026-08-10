import api from "./axiosInstance";

export async function loginUser(credentials) {
  const res = await api.post("/auth/login", credentials);
  return res.data;
}