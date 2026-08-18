import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, CheckCircle2, XCircle, PlayCircle, Clock, Video } from "lucide-react";
import {
  getMyIncidents,
  acceptIncident,
  rejectIncident,
  completeIncident,
} from "../../api/technicianPortal.api";
import CommentModal from "../../components/technician/CommentModal";
import Pagination from "../../components/admin/Pagination";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Assigned", value: "Assigned" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
  { label: "Rejected", value: "Rejected" },
];

const STATUS_STYLES = {
  Assigned: "bg-amber-50 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

const PRIORITY_STYLES = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");

  // modal state: { mode: "reject" | "complete", incident } অথবা null
  const [modalState, setModalState] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await getMyIncidents({ page, limit: 10, status });
      setIncidents(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      setActionError("Failed to load your incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const handleAccept = async (incident) => {
    setActionError("");
    setAcceptingId(incident.id);
    try {
      await acceptIncident(incident.id);
      await loadIncidents();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to accept incident");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleModalSubmit = async (comment) => {
    const { mode, incident } = modalState;
    if (mode === "reject") {
      await rejectIncident(incident.id, comment);
    } else {
      await completeIncident(incident.id, comment);
    }
    await loadIncidents();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">My Incidents</h2>
        {/* <p className="text-sm text-slate-500">তোমাকে assign করা incident-গুলো এখানে ম্যানেজ করো</p> */}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              status === tab.value
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">
          {actionError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">Loading...</div>
        ) : incidents.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">কোনো incident নেই</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        STATUS_STYLES[incident.status] || "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {incident.status}
                    </span>
                    {incident.priority && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          PRIORITY_STYLES[incident.priority] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {incident.priority} priority
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                    <Camera size={14} className="text-slate-400" />
                    {incident.camera_name}
                    {incident.issue_type && (
                      <span className="text-slate-400 font-normal">· {incident.issue_type}</span>
                    )}
                  </div>

                  {incident.camera_location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin size={12} />
                      {incident.camera_location}
                    </div>
                  )}

                  {incident.description && (
                    <p className="text-sm text-slate-600 mt-2">{incident.description}</p>
                  )}

                  {incident.remarks && (incident.status === "Rejected" || incident.status === "Completed") && (
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      <span className="font-medium text-slate-600">
                        {incident.status === "Rejected" ? "Reject reason: " : "Note: "}
                      </span>
                      {incident.remarks}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                    <Clock size={12} />
                    {incident.status === "Completed" && incident.completed_at
                      ? `Completed ${new Date(incident.completed_at).toLocaleString()}`
                      : incident.assigned_at
                      ? `Assigned ${new Date(incident.assigned_at).toLocaleString()}`
                      : `Created ${new Date(incident.created_at).toLocaleString()}`}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 shrink-0">
                  {incident.camera_id && (
                    <button
                      onClick={() => navigate(`/technician/cameras/${incident.camera_id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Video size={16} />
                      View Camera
                    </button>
                  )}
                  {incident.status === "Assigned" && (
                    <>
                      <button
                        onClick={() => handleAccept(incident)}
                        disabled={acceptingId === incident.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50"
                      >
                        <PlayCircle size={16} />
                        {acceptingId === incident.id ? "Accepting..." : "Accept"}
                      </button>
                      <button
                        onClick={() => setModalState({ mode: "reject", incident })}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}

                  {incident.status === "In Progress" && (
                    <>
                      <button
                        onClick={() => setModalState({ mode: "complete", incident })}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={16} />
                        Complete
                      </button>
                      <button
                        onClick={() => setModalState({ mode: "reject", incident })}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {modalState && (
        <CommentModal
          mode={modalState.mode}
          incident={modalState.incident}
          onClose={() => setModalState(null)}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
}