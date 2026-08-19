import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  getTechnicianDetail,
  getTechnicianWorkHistory,
} from "../../api/adminApi";
import Pagination from "../../components/common/Pagination";

const statusStyle = {
  Open: "bg-amber-50 text-amber-600",
  Assigned: "bg-blue-50 text-blue-600",
  "In Progress": "bg-violet-50 text-violet-600",
  Completed: "bg-emerald-50 text-emerald-600",
  Rejected: "bg-red-50 text-red-600",
};

const issueBadge = {
  Offline: "bg-red-50 text-red-600",
  Blur: "bg-amber-50 text-amber-600",
  Obstruction: "bg-amber-50 text-amber-600",
};

export default function TechnicianDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [technician, setTechnician] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadDetail = async () => {
    const data = await getTechnicianDetail(id);
    setTechnician(data);
  };

  const loadHistory = async (targetPage = 1) => {
    const result = await getTechnicianWorkHistory(id, targetPage, 10);
    setIncidents(result.data);
    setTotalPages(result.totalPages);
    setPage(result.page);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadDetail(), loadHistory(1)]).finally(() =>
      setLoading(false),
    );
  }, [id]);

  if (loading) return <p className="text-slate-400 text-sm">Loading...</p>;
  if (!technician)
    return <p className="text-slate-400 text-sm">Technician not found.</p>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/admin/technicians")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} /> Back to Technicians
      </button>

      <div>
        <h1 className="text-lg font-semibold text-slate-800">
          {technician.name}
        </h1>
        <p className="text-sm text-slate-500">
          {technician.email} {technician.phone && `· ${technician.phone}`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">Active Tasks</p>
          <p className="font-mono text-xl font-semibold text-slate-800">
            {technician.active_tasks}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">Completed</p>
          <p className="font-mono text-xl font-semibold text-slate-800">
            {technician.completed_tasks}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-400 mb-1">Rejected</p>
          <p className="font-mono text-xl font-semibold text-slate-800">
            {technician.rejected_tasks}
          </p>
        </div>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Work History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Camera</th>
              <th className="px-5 py-3 font-medium">Issue</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Assigned At</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc) => (
              <tr
                key={inc.id}
                className="border-b border-slate-50 last:border-0"
              >
                <td className="px-5 py-3.5 font-medium text-slate-700">
                  {inc.camera_name}
                </td>
                <td className="px-5 py-3.5">
                  {inc.issue_type ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${issueBadge[inc.issue_type]}`}
                    >
                      {inc.issue_type}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Manual
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[inc.status]}`}
                  >
                    {inc.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{inc.priority}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                  {inc.assigned_at
                    ? new Date(inc.assigned_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={loadHistory}
        />
      </section>
    </div>
  );
}
