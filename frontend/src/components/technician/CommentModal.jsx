import { useState } from "react";
import { X } from "lucide-react";

/**
 * mode: "reject" | "complete"
 * onSubmit(comment) — parent এই ফাংশনটা কল করে API হিট করবে
 */
export default function CommentModal({ mode, incident, onClose, onSubmit }) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isReject = mode === "reject";

  const handleSubmit = async () => {
    if (isReject && !comment.trim()) {
      setError("Reject করার কারণ লেখা আবশ্যক");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(comment.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">
            {isReject ? "Reject Incident" : "Complete Incident"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Camera</label>
            <p className="text-sm font-medium text-slate-800 mt-1">{incident.camera_name}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">
              {isReject ? "Reason for rejecting" : "Resolution note (optional)"}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={
                isReject
                  ? "কেন এই incident-টা reject করছেন লিখুন..."
                  : "কী করে সমস্যাটা সমাধান করা হয়েছে লিখুন (ঐচ্ছিক)..."
              }
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${
              isReject ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {submitting
              ? "Submitting..."
              : isReject
              ? "Reject Incident"
              : "Mark as Completed"}
          </button>
        </div>
      </div>
    </div>
  );
}