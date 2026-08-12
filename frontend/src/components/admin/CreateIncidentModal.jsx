import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createIncident, getTechnicianOptions } from "../../api/adminApi.jsx";

export default function CreateIncidentModal({ issue, onClose, onCreated }) {
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getTechnicianOptions()
      .then(setTechnicians)
      .catch(() => setTechnicians([]));
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await createIncident({
        camera_id: issue.camera_id,
        camera_issue_id: issue.id,
        issue_type: issue.issue_type,
        priority,
        description,
        technician_id: technicianId || null,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create incident");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">
            Create Incident
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Camera</label>
            <p className="text-sm font-medium text-slate-800 mt-1">
              {issue.camera_name}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">
              Issue Type
            </label>
            <p className="text-sm text-slate-700 mt-1">{issue.issue_type}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Add any notes..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">
              Assign Technician (optional)
            </label>
            <select
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Assign later</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.active_tasks} active · {t.completed_last_7_days}{" "}
                  completed this week
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Incident"}
          </button>
        </div>
      </div>
    </div>
  );
}
