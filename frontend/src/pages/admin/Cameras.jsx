import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Circle, Search, Plus, Pencil, Trash2 } from "lucide-react";
import { getCameras, deleteCamera } from "../../api/adminApi";
import Pagination from "../../components/admin/Pagination";
import AddCameraModal from "../../components/admin/AddCameraModal";
import EditCameraModal from "../../components/admin/EditCameraModal";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";

const statusStyle = {
  Online: "bg-emerald-50 text-emerald-600",
  Offline: "bg-red-50 text-red-600",
  Degraded: "bg-amber-50 text-amber-600",
};

export default function Cameras() {
  const [cameras, setCameras] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [deletingCamera, setDeletingCamera] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  const loadCameras = async (targetPage = 1) => {
    setLoading(true);
    try {
      const result = await getCameras({ page: targetPage, limit: 10, search, status });
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
  }, [search, status]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteCamera(deletingCamera.id);
      setDeletingCamera(null);
      loadCameras(page);
    } catch (err) {
      console.error("Failed to delete camera", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Cameras</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700"
        >
          <Plus size={16} /> Add Camera
        </button>
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

      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Location</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : cameras.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">No cameras found</td></tr>
            ) : (
              cameras.map((cam) => (
                <tr key={cam.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-700">{cam.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{cam.location}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[cam.current_status]}`}>
                      <Circle size={6} className="fill-current" />
                      {cam.current_status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/admin/cameras/${cam.id}`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-700"
                    >
                      Show Detail
                    </button>
                    <button
                      onClick={() => setEditingCamera(cam)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingCamera(cam)}
                      className="p-1.5 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={loadCameras} />
      </section>

      {showAddModal && (
        <AddCameraModal onClose={() => setShowAddModal(false)} onCreated={() => loadCameras(1)} />
      )}

      {editingCamera && (
        <EditCameraModal
          camera={editingCamera}
          onClose={() => setEditingCamera(null)}
          onUpdated={() => loadCameras(page)}
        />
      )}

      {deletingCamera && (
        <DeleteConfirmModal
          title="Delete Camera"
          message={`Are you sure you want to delete "${deletingCamera.name}"? This camera will be hidden but its history will be preserved.`}
          onCancel={() => setDeletingCamera(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}