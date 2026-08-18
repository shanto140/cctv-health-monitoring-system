import { useEffect, useState } from "react";
import { AlertTriangle, FilePlus2, UserCheck, CheckCircle2 } from "lucide-react";
import { getEventHistory, getCameras } from "../../api/adminApi";
import Pagination from "../../components/admin/Pagination";

const EVENT_TYPES = ["", "Alert", "Incident Created", "Assigned", "Resolved"];

const eventStyle = {
  Alert: { icon: AlertTriangle, badge: "bg-red-50 text-red-600" },
  "Incident Created": { icon: FilePlus2, badge: "bg-amber-50 text-amber-600" },
  Assigned: { icon: UserCheck, badge: "bg-blue-50 text-blue-600" },
  Resolved: { icon: CheckCircle2, badge: "bg-emerald-50 text-emerald-600" },
};

export default function EventHistory() {
  const [events, setEvents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [cameraId, setCameraId] = useState("");
  const [eventType, setEventType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // ফিল্টার ড্রপডাউনের জন্য ক্যামেরা লিস্ট একবার লোড
  useEffect(() => {
    getCameras({ limit: 100 })
      .then((res) => setCameras(res.data))
      .catch(() => setCameras([]));
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const result = await getEventHistory({ page, limit: 15, cameraId, eventType });
      setEvents(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, cameraId, eventType]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Event History</h2>
        {/* <p className="text-sm text-slate-500">সব ক্যামেরার alert, incident ও resolution-এর সম্পূর্ণ টাইমলাইন</p> */}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={cameraId}
          onChange={(e) => {
            setCameraId(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white"
        >
          <option value="">All Cameras</option>
          {cameras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "" ? "All Event Types" : t}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">Loading...</div>
        ) : events.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">No history still created</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {events.map((e, idx) => {
              const style = eventStyle[e.event_type] || { icon: AlertTriangle, badge: "bg-slate-50 text-slate-500" };
              const Icon = style.icon;
              return (
                <div key={idx} className="flex items-start gap-3 px-5 py-4">
                  <span className={`mt-0.5 p-2 rounded-lg ${style.badge}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
                        {e.event_type}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{e.camera_name}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{e.message}</p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {new Date(e.event_time).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}