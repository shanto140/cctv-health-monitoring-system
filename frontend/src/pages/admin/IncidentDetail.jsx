import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Camera as CameraIcon, User, Phone, Mail } from "lucide-react";
import { getIncidentDetail } from "../../api/adminApi";
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

const issueTypeStyle = {
  Offline: "bg-red-50 text-red-600",
  Blur: "bg-amber-50 text-amber-600",
  Obstruction: "bg-orange-50 text-orange-600",
};

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const loadIncident = () => {
    setLoading(true);
    getIncidentDetail(id).then(setIncident).finally(() => setLoading(false));
  };

  useEffect(() => { loadIncident(); }, [id]);

  if (loading) return <p className="text-slate-400 text-sm">Loading...</p>;
  if (!incident) return <p className="text-slate-400 text-sm">Incident not found.</p>;

  const canAssign = incident.status === "Open" || incident.status === "Rejected";

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <button onClick={() => navigate("/admin/incidents")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to Incidents
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{incident.camera_name}</h1>
          <p className="text-sm text-slate-500">
            Incident #{incident.id} · Created {new Date(incident.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityStyle[incident.priority]}`}>
            {incident.priority} Priority
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[incident.status]}`}>
            {incident.status}
          </span>
        </div>
      </div>

      {/* Camera Info Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">
          <CameraIcon size={16} className="text-slate-400" />
          Camera Information
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Camera Name</p>
            <p className="text-sm text-slate-800 mt-1">{incident.camera_name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <MapPin size={12} /> Location
            </p>
            <p className="text-sm text-slate-800 mt-1">{incident.camera_location}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Issue Type</p>
            <p className="mt-1">
              {incident.issue_type ? (
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${issueTypeStyle[incident.issue_type]}`}>
                  {incident.issue_type}
                </span>
              ) : (
                <span className="text-sm text-slate-800">—</span>
              )}
            </p>
          </div>
          {incident.camera_ip && (
            <div>
              <p className="text-xs font-medium text-slate-500">IP Address</p>
              <p className="text-sm text-slate-800 mt-1 font-mono">{incident.camera_ip}</p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500">Description</p>
          <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
            {incident.description || "No description provided"}
          </p>
        </div>
      </section>

      {/* Technician Info Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <User size={16} className="text-slate-400" />
            Technician Information
          </div>
          {canAssign && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-700"
            >
              {incident.status === "Rejected" ? "Reassign Technician" : "Assign Technician"}
            </button>
          )}
        </div>

        {incident.technician_name ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Name</p>
              <p className="text-sm text-slate-800 mt-1">{incident.technician_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Phone size={12} /> Phone
              </p>
              <p className="text-sm text-slate-800 mt-1">{incident.technician_phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Mail size={12} /> Email
              </p>
              <p className="text-sm text-slate-800 mt-1">{incident.technician_email || "—"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No technician assigned yet.</p>
        )}
      </section>

      {/* Remark Section (conditional) */}
      {(incident.status === "Rejected" || incident.status === "Completed") && (
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500">
            {incident.status === "Rejected" ? "Rejection Reason" : "Completion Remark"}
          </p>
          <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
            {incident.remarks || "No remark added"}
          </p>
        </section>
      )}

      {/* Timeline Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-slate-400">Created</p>
            <p className="text-slate-600 mt-1 font-mono">{new Date(incident.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400">Assigned</p>
            <p className="text-slate-600 mt-1 font-mono">
              {incident.assigned_at ? new Date(incident.assigned_at).toLocaleString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Completed</p>
            <p className="text-slate-600 mt-1 font-mono">
              {incident.completed_at ? new Date(incident.completed_at).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      </section>

      {showAssignModal && (
        <AssignTechnicianModal
          incident={incident}
          onClose={() => setShowAssignModal(false)}
          onAssigned={loadIncident}
        />
      )}
    </div>
  );
}