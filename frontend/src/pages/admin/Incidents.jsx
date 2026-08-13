import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Circle } from "lucide-react";
import { getIncidents } from "../../api/adminApi";
import Pagination from "../../components/admin/Pagination";
import AssignTechnicianModal from "../../components/admin/AssignTechnicianModal";

const statusStyle = {
  Open: "bg-slate-100 text-slate-600",
  Assigned: "bg-blue-50 text-blue-600",
  "In Progress": "bg-amber-50 text-amber-600",
  Rejected: "bg-red-50 text-red-600",
  Completed: "bg-emerald-50 text-emerald-600",
};

const priorityStyle = {
  High: "bg-red-50 text-red-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-emerald-50 text-emerald-600",
};

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assigningIncident, setAssigningIncident] = useState(null);
  const navigate = useNavigate();

  const loadIncidents = async (targetPage = 1) => {
    setLoading(true);
    try {
      const result = await getIncidents({ page: targetPage, limit: 10, status, priority, cameraName: search });
      setIncidents(result.data);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (err) {
      console.error("Failed to load incidents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadIncidents(1), 400);
    return () => clearTimeout(timer);
  }, [search, status, priority]);

  const canAssign = (s) => s === "Open" || s === "Rejected";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Incidents</h1>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by camera name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Rejected">Rejected</option>
          <option value="Completed">Completed</option>
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Camera</th>
              <th className="px-5 py-3 font-medium">Issue</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Created At</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : incidents.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-slate-400">No incidents found</td></tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-700">{inc.camera_name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{inc.issue_type || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[inc.status]}`}>
                      <Circle size={6} className="fill-current" />
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyle[inc.priority]}`}>
                      {inc.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{new Date(inc.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/incidents/${inc.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 whitespace-nowrap"
                      >
                        Show Detail
                      </button>
                      {canAssign(inc.status) ? (
                        <button
                          onClick={() => setAssigningIncident(inc)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 whitespace-nowrap"
                        >
                          Assign
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 w-[64px] invisible" aria-hidden="true">Assign</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={loadIncidents} />
      </section>

      {assigningIncident && (
        <AssignTechnicianModal
          incident={assigningIncident}
          onClose={() => setAssigningIncident(null)}
          onAssigned={() => loadIncidents(page)}
        />
      )}
    </div>
  );
}