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

export async function uploadProfileImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post("/auth/me/profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateProfile({ name, phone, address }) {
  const res = await api.patch("/auth/me", { name, phone, address });
  return res.data;
}