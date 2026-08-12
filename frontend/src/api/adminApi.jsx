import api from "./axiosInstance";


export const getDashboardStats = async () => {
  const res = await api.get("/admin/dashboard/stats");
  return res.data;
};


export const getActiveCameraIssues = async () => {
  const res = await api.get("/camera-issues", { params: { status: "active" } });
  return res.data;
};

export const createIncident = async (payload) => {
  const res = await api.post("/incidents", payload);
  return res.data;
};


export const getTechnicianOptions = async () => {
  const res = await api.get("/technicians");
  return res.data;
};


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

export const createCamera = async (payload) => {
  const res = await api.post("/cameras", payload);
  return res.data;
};

export const updateCamera = async (id, payload) => {
  const res = await api.put(`/cameras/${id}`, payload);
  return res.data;
};

export const deleteCamera = async (id) => {
  const res = await api.delete(`/cameras/${id}`);
  return res.data;
};