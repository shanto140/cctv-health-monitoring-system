import { getEventHistoryList } from "../services/eventHistoryService.js";

export const getEventHistory = async (req, res) => {
  try {
    const { page = 1, limit = 15, cameraId = "", eventType = "" } = req.query;
    const result = await getEventHistoryList({
      page: Number(page),
      limit: Number(limit),
      cameraId,
      eventType,
    });
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch event history" });
  }
};