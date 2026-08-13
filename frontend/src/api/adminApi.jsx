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

// ---------- Technicians ----------
export const getTechnicians = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const res = await api.get("/technicians", { params: { page, limit, search } });
  return res.data;
};

export const getTechnicianDetail = async (id) => {
  const res = await api.get(`/technicians/${id}`);
  return res.data;
};

export const getTechnicianWorkHistory = async (id, page = 1, limit = 10) => {
  const res = await api.get(`/technicians/${id}/incidents`, { params: { page, limit } });
  return res.data;
};

export const getTechnicianOptions = async () => {
  const res = await api.get("/technicians/options/assignable");
  return res.data;
};

export const registerTechnician = async (payload) => {
  const res = await api.post("/technicians", payload);
  return res.data;
};

export const toggleTechnicianStatus = async (id, isActive) => {
  const res = await api.patch(`/technicians/${id}/status`, { is_active: isActive });
  return res.data;
};


// ---------- Incidents ----------
export const getIncidents = async ({ page = 1, limit = 10, status = "", priority = "", cameraName = "" } = {}) => {
  const res = await api.get("/incidents", { params: { page, limit, status, priority, cameraName } });
  return res.data;
};

export const getIncidentDetail = async (id) => {
  const res = await api.get(`/incidents/${id}`);
  return res.data;
};

export const assignTechnicianToIncident = async (id, technicianId) => {
  const res = await api.patch(`/incidents/${id}/assign`, { technician_id: technicianId });
  return res.data;
};