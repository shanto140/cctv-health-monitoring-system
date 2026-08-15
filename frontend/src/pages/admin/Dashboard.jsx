import { useEffect, useState } from "react";
import { Video, Wifi, AlertOctagon, Users, Circle } from "lucide-react";
import { getDashboardStats, getActiveCameraIssues } from "../../api/adminApi";
import Pagination from "../../components/admin/Pagination";
import CreateIncidentModal from "../../components/admin/CreateIncidentModal";

import {
  getMyIncidents,
  acceptIncident,
  rejectIncident,
  completeIncident,
} from "../../api/technicianPortal.api";

function StatCard({ label, value, icon: Icon, accent, live }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
          {live && <Circle size={6} className="fill-emerald-500 text-emerald-500 animate-pulse" />}
          {label}
        </p>
        <p className="font-mono text-2xl font-semibold text-slate-800">{value ?? "--"}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={18} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const loadStats = async () => {
    const statsData = await getDashboardStats();
    setStats(statsData);
  };

  const loadIssues = async (targetPage = 1) => {
    setLoading(true);
    try {
      const result = await getActiveCameraIssues(targetPage, 10);
      setIssues(result.data);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (err) {
      console.error("Failed to load camera issues", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadIssues(1);
  }, []);

  const handleIncidentCreated = () => {
    loadStats();       // stat count আপডেট হবে (Issued Cameras, Incidents Open ইত্যাদি)
    loadIssues(page);  // issue table থেকে linked হওয়া issue টা বাদ যাবে
  };

  const issueBadge = {
    Offline: "bg-red-50 text-red-600",
    Blur: "bg-amber-50 text-amber-600",
    Obstruction: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">
          Cameras & Technicians
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Cameras" value={stats?.totalCameras} icon={Video} accent="bg-slate-100 text-slate-600" />
          <StatCard label="Online Cameras" value={stats?.onlineCameras} icon={Wifi} accent="bg-emerald-50 text-emerald-600" live />
          <StatCard label="Issued Cameras" value={stats?.issuedCameras} icon={AlertOctagon} accent="bg-red-50 text-red-600" />
          <StatCard label="Active Technicians" value={stats?.activeTechnicians} icon={Users} accent="bg-blue-50 text-blue-600" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">
          Incidents by Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Open" value={stats?.incidentsOpen} icon={AlertOctagon} accent="bg-amber-50 text-amber-600" />
          <StatCard label="Assigned" value={stats?.incidentsAssigned} icon={Users} accent="bg-blue-50 text-blue-600" />
          <StatCard label="In Progress" value={stats?.incidentsInProgress} icon={Wifi} accent="bg-violet-50 text-violet-600" />
          <StatCard label="Completed" value={stats?.incidentsCompleted} icon={Video} accent="bg-emerald-50 text-emerald-600" />
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Camera Issues</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Camera</th>
              <th className="px-5 py-3 font-medium">Issue Type</th>
              <th className="px-5 py-3 font-medium">Detected At</th>
              <th className="px-5 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : issues.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">No active camera issues</td></tr>
            ) : (
              issues.map((issue) => (
                <tr key={issue.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-700">{issue.camera_name}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${issueBadge[issue.issue_type]}`}>
                      {issue.issue_type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                    {new Date(issue.detected_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedIssue(issue)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 transition-colors"
                    >
                      Create Incident
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination page={page} totalPages={totalPages} onPageChange={loadIssues} />
      </section>

      {selectedIssue && (
        <CreateIncidentModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onCreated={handleIncidentCreated}
        />
      )}
    </div>
  );
}