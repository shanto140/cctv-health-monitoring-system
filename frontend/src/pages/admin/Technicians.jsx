import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Circle } from "lucide-react";
import { getTechnicians, toggleTechnicianStatus } from "../../api/adminApi";
import Pagination from "../../components/common/Pagination";
import RegisterTechnicianModal from "../../components/admin/RegisterTechnicianModal";

export default function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();

  const loadTechnicians = async (targetPage = 1) => {
    setLoading(true);
    try {
      const result = await getTechnicians({ page: targetPage, limit: 10, search });
      setTechnicians(result.data);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (err) {
      console.error("Failed to load technicians", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadTechnicians(1), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleStatus = async (technician) => {
    try {
      await toggleTechnicianStatus(technician.id, !technician.is_active);
      loadTechnicians(page);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Technicians</h1>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700"
        >
          <Plus size={16} /> Add Technician
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </div>

      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : technicians.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">No technicians found</td></tr>
            ) : (
              technicians.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-700">{t.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${t.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                      <Circle size={6} className="fill-current" />
                      {t.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/admin/technicians/${t.id}`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-700"
                    >
                      Show Detail
                    </button>
                    <button
                      onClick={() => handleToggleStatus(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        t.is_active
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {t.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={loadTechnicians} />
      </section>

      {showRegisterModal && (
        <RegisterTechnicianModal
          onClose={() => setShowRegisterModal(false)}
          onCreated={() => loadTechnicians(1)}
        />
      )}
    </div>
  );
}