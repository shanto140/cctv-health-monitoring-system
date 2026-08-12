import { useState } from "react";
import { X } from "lucide-react";
import { createCamera } from "../../api/adminApi";

export default function AddCameraModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", location: "", ip_address: "", stream_url: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.location || !form.stream_url) {
      setError("Name, location and stream URL are required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createCamera(form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add camera");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Add Camera</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Gate-01"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Main Gate, Building A"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">IP Address (optional)</label>
            <input
              type="text"
              value={form.ip_address}
              onChange={(e) => handleChange("ip_address", e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. 192.168.1.10"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">Stream URL</label>
            <input
              type="text"
              value={form.stream_url}
              onChange={(e) => handleChange("stream_url", e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="rtsp://user:pass@192.168.1.10:554/stream"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Camera"}
          </button>
        </div>
      </div>
    </div>
  );
}