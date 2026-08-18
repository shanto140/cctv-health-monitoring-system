import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Circle, Search, MapPin, Video } from "lucide-react";
import { getCameras } from "../../api/technicianPortal.api";
import Pagination from "../../components/admin/Pagination";

const statusStyle = {
  Online: "bg-emerald-50 text-emerald-600",
  Offline: "bg-red-50 text-red-600",
  Degraded: "bg-amber-50 text-amber-600",
};

export default function Cameras() {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const loadCameras = async (targetPage = 1) => {
    setLoading(true);
    try {
      const result = await getCameras({ page: targetPage, limit: 12, search, status });
      setCameras(result.data);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (err) {
      console.error("Failed to load cameras", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadCameras(1), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Cameras</h2>
        <p className="text-sm text-slate-500">সিস্টেমে রেজিস্টার করা সব ক্যামেরা — status ও live preview দেখুন</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
          <option value="Degraded">Degraded</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-400">
          Loading...
        </div>
      ) : cameras.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-400">
          কোনো ক্যামেরা পাওয়া যায়নি
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((cam) => (
            <button
              key={cam.id}
              onClick={() => navigate(`/technician/cameras/${cam.id}`)}
              className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-800 text-sm truncate">{cam.name}</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    statusStyle[cam.current_status] || "bg-slate-50 text-slate-500"
                  }`}
                >
                  <Circle size={6} className="fill-current" />
                  {cam.current_status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                <MapPin size={12} />
                {cam.location}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Video size={13} />
                View Camera
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        <Pagination page={page} totalPages={totalPages} onPageChange={loadCameras} />
      </div>
    </div>
  );
}