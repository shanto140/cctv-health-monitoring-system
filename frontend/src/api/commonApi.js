import api from "./axiosInstance";

// ---------- Cameras (দুই role-ই ব্যবহার করবে) ----------
export const getCameras = async ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
  const res = await api.get("/cameras", { params: { page, limit, search, status } });
  return res.data;
};

export const getCameraById = async (id) => {
  const res = await api.get(`/cameras/${id}`);
  return res.data;
};

export const getCameraIssueHistory = async (id, page = 1, limit = 10) => {
  const res = await api.get(`/cameras/${id}/issues`, { params: { page, limit } });
  return res.data;
};