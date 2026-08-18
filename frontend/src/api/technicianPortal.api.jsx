import api from "./axiosInstance";

// টেকনিশিয়ানের নিজের assign করা incident-গুলোর লিস্ট
export const getMyIncidents = async ({ page = 1, limit = 10, status = "" } = {}) => {
  const res = await api.get("/incidents/my", { params: { page, limit, status } });
  return res.data;
};

export const getIncidentDetail = async (id) => {
  const res = await api.get(`/incidents/${id}`);
  return res.data;
};

export const acceptIncident = async (id) => {
  const res = await api.patch(`/incidents/${id}/accept`);
  return res.data;
};

export const rejectIncident = async (id, reason) => {
  const res = await api.patch(`/incidents/${id}/reject`, { reason });
  return res.data;
};

export const completeIncident = async (id, comment) => {
  const res = await api.patch(`/incidents/${id}/complete`, { comment });
  return res.data;
};

// ক্যামেরার ডিটেইল (live preview / snapshot দেখানোর জন্য)
export const getCameraById = async (id) => {
  const res = await api.get(`/cameras/${id}`);
  return res.data;
};

// সব ক্যামেরার লিস্ট (শুধু নিজের incident-এর ক্যামেরা না, সব ক্যামেরা ব্রাউজ করার জন্য)
export const getCameras = async ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
  const res = await api.get("/cameras", { params: { page, limit, search, status } });
  return res.data;
};

