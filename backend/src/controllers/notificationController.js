import {
  getMyNotificationsList,
  getUnreadCountForUser,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationService.js";

export const getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getMyNotificationsList(req.user.id, req.user.role, {
      page: Number(page),
      limit: Number(limit),
    });
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const unread = await getUnreadCountForUser(req.user.id, req.user.role);
    res.status(200).json({ unread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await markNotificationRead(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await markAllNotificationsRead(req.user.id, req.user.role);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};