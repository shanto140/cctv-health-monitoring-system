import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getTechnicianOptions, assignTechnicianToIncident } from "../../api/adminApi";

export default function AssignTechnicianModal({ incident, onClose, onAssigned }) {
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getTechnicianOptions().then(setTechnicians).catch(() => setTechnicians([]));
  }, []);

  const handleSubmit = async () => {
    if (!technicianId) {
      setError("Please select a technician");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await assignTechnicianToIncident(incident.id, technicianId);
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign technician");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Assign Technician</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Camera</label>
            <p className="text-sm font-medium text-slate-800 mt-1">{incident.camera_name}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">Select Technician</label>
            <select
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select a technician</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.active_tasks} active · {t.completed_last_7_days} completed this week
                </option>
              ))}
            </select>
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
            {submitting ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}