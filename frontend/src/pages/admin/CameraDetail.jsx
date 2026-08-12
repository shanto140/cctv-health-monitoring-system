import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Circle } from "lucide-react";
import { getCameraById, getCameraIssueHistory } from "../../api/adminApi";
import Pagination from "../../components/admin/Pagination";

const statusStyle = {
  Online: "bg-emerald-50 text-emerald-600",
  Offline: "bg-red-50 text-red-600",
  Degraded: "bg-amber-50 text-amber-600",
};

const issueBadge = {
  Offline: "bg-red-50 text-red-600",
  Blur: "bg-amber-50 text-amber-600",
  Obstruction: "bg-amber-50 text-amber-600",
};

const issueStatusStyle = {
  active: "bg-red-50 text-red-600",
  linked: "bg-blue-50 text-blue-600",
  resolved: "bg-emerald-50 text-emerald-600",
};

export default function CameraDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [camera, setCamera] = useState(null);
  const [showLive, setShowLive] = useState(false);
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadCamera = async () => {
    const data = await getCameraById(id);
    setCamera(data);
  };

  const loadIssueHistory = async (targetPage = 1) => {
    const result = await getCameraIssueHistory(id, targetPage, 10);
    setIssues(result.data);
    setTotalPages(result.totalPages);
    setPage(result.page);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadCamera(), loadIssueHistory(1)]).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-400 text-sm">Loading...</p>;
  if (!camera) return <p className="text-slate-400 text-sm">Camera not found.</p>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/admin/cameras")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} /> Back to Cameras
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{camera.name}</h1>
          <p className="text-sm text-slate-500">{camera.location}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusStyle[camera.current_status]}`}>
          <Circle size={6} className="fill-current" />
          {camera.current_status}
        </span>
      </div>

      {/* Preview area — snapshot default, live toggle-able */}
      <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative">
        {showLive ? (
          <video src={camera.stream_url} autoPlay controls className="w-full h-full object-cover" />
        ) : (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}/api/cameras/${camera.id}/snapshot?t=${camera.status_updated_at}`}
            alt={camera.name}
            className="w-full h-full object-cover"
          />
        )}
        <button
          onClick={() => setShowLive(!showLive)}
          className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 text-white text-xs rounded-lg hover:bg-black/80"
        >
          {showLive ? "Stop Live" : "▶ View Live"}
        </button>
      </div>

      {/* Camera info */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">IP Address</p>
          <p className="font-mono text-slate-700">{camera.ip_address || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Added On</p>
          <p className="text-slate-700">{new Date(camera.created_at).toLocaleDateString()}</p>
        </div>
      </section>

      {/* Issue history */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Issue History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Issue Type</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Detected At</th>
              <th className="px-5 py-3 font-medium">Resolved At</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">No issue history</td></tr>
            ) : (
              issues.map((issue) => (
                <tr key={issue.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${issueBadge[issue.issue_type]}`}>
                      {issue.issue_type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${issueStatusStyle[issue.status]}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                    {new Date(issue.detected_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                    {issue.resolved_at ? new Date(issue.resolved_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={loadIssueHistory} />
      </section>
    </div>
  );
}