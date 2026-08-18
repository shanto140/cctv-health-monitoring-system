import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Circle, MapPin } from "lucide-react";
import { getCameraById } from "../../api/technicianPortal.api";

const statusStyle = {
  Online: "bg-emerald-50 text-emerald-600",
  Offline: "bg-red-50 text-red-600",
  Degraded: "bg-amber-50 text-amber-600",
};

export default function CameraPreview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [camera, setCamera] = useState(null);
  const [showLive, setShowLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getCameraById(id)
      .then(setCamera)
      .catch(() => setError("ক্যামেরার তথ্য লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-400 text-sm">Loading...</p>;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (!camera) return <p className="text-slate-400 text-sm">Camera not found.</p>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{camera.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin size={13} /> {camera.location}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            statusStyle[camera.current_status] || "bg-slate-50 text-slate-500"
          }`}
        >
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
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Last Status Update</p>
          <p className="text-slate-700">
            {camera.status_updated_at ? new Date(camera.status_updated_at).toLocaleString() : "—"}
          </p>
        </div>
      </section>
    </div>
  );
}