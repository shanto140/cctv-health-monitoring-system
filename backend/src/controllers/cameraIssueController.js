import { fetchCameraIssues } from "../services/cameraIssueService.js";

export const getCameraIssues = async (req, res) => {
  try {
    const status = req.query.status || "active";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await fetchCameraIssues(status, page, limit);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch camera issues" });
  }
};


