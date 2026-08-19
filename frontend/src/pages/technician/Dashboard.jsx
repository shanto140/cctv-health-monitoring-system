import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Wrench, CheckCircle2, Award } from "lucide-react";
import { getTechnicianDashboardStats} from "../../api/technicianPortal.api";

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">{label}</p>
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData] = await Promise.all([getTechnicianDashboardStats()]);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      
      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">My Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Pending Accept" value={stats?.assignedPending} icon={Clock} accent="bg-blue-50 text-blue-600" />
          <StatCard label="In Progress" value={stats?.inProgress} icon={Wrench} accent="bg-amber-50 text-amber-600" />
          <StatCard label="Completed (7 days)" value={stats?.completedThisWeek} icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600" />
          <StatCard label="Total Completed" value={stats?.totalCompleted} icon={Award} accent="bg-slate-100 text-slate-600" />
        </div>
      </section>


    </div>
  );
}