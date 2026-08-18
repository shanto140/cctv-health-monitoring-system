import api from "./axiosInstance";

// Admin ও Technician দুজনেই ব্যবহার করতে পারবে — role JWT থেকে ব্যাকএন্ড নিজেই ধরে নেয়
export const getMyNotifications = async ({ page = 1, limit = 10 } = {}) => {
  const res = await api.get("/notifications", { params: { page, limit } });
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await api.get("/notifications/unread-count");
  return res.data.unread;
};

export const markNotificationRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.patch("/notifications/read-all");
  return res.data;
};