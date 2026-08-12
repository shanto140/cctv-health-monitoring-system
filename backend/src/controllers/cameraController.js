import { fetchCameras, fetchCameraById, fetchCameraIssueHistory,insertCamera ,updateCameraById, softDeleteCamera} from "../services/cameraService.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";


export const getCameras = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const result = await fetchCameras({ page, limit, search, status });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch cameras" });
  }
};

export const getCameraDetail = async (req, res) => {
  try {
    const camera = await fetchCameraById(req.params.id);
    if (!camera) return res.status(404).json({ message: "Camera not found" });
    res.json(camera);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch camera detail" });
  }
};

export const getCameraIssueHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await fetchCameraIssueHistory(req.params.id, page, limit);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch issue history" });
  }
};

export const createCamera = async (req, res) => {
  try {
    const { name, location, ip_address, stream_url } = req.body;

    if (!name || !location || !stream_url) {
      return res.status(400).json({ message: "name, location and stream_url are required" });
    }

    const camera = await insertCamera({ name, location, ip_address, stream_url });
    res.status(201).json(camera);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create camera" });
  }
};



const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getCameraSnapshot = async (req, res) => {
  try {
    const camera = await fetchCameraById(req.params.id);
    if (!camera) return res.status(404).json({ message: "Camera not found" });

    const snapshotPath = path.join(__dirname, "../../uploads/snapshots", `${camera.name}.jpg`);
    const defaultPath = path.join(__dirname, "../../uploads/default", "no-snapshot.jpg");

    if (fs.existsSync(snapshotPath)) {
      return res.sendFile(snapshotPath);
    }
    return res.sendFile(defaultPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch snapshot" });
  }
};



export const updateCamera = async (req, res) => {
  try {
    const { name, location, ip_address, stream_url } = req.body;

    if (!name || !location || !stream_url) {
      return res.status(400).json({ message: "name, location and stream_url are required" });
    }

    const updated = await updateCameraById(req.params.id, { name, location, ip_address, stream_url });
    if (!updated) return res.status(404).json({ message: "Camera not found" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update camera" });
  }
};

export const deleteCamera = async (req, res) => {
  try {
    const success = await softDeleteCamera(req.params.id);
    if (!success) return res.status(404).json({ message: "Camera not found" });

    res.json({ message: "Camera deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete camera" });
  }
};