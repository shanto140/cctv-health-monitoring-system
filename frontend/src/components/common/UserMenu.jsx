import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, Mail, MapPin, ShieldCheck, Camera, Loader2, Pencil, Check, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logoutUser, uploadProfileImage, updateProfile } from "../../api/authApi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, matches backend multer limit

const resolveAvatarUrl = (profileImage) => {
  if (!profileImage) return null;
  if (profileImage.startsWith("http")) return profileImage;
  return `${BACKEND_URL}/uploads/${profileImage}`;
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export default function UserMenu() {
  const { user, setUser, clearUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setSaveError("");
    }
  }, [open]);

  const startEditing = () => {
    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setSaveError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveError("");
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim()) {
      setSaveError("Name is required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateProfile(form);
      setUser((prev) => ({
        ...prev,
        name: updated.name,
        phone: updated.phone,
        address: updated.address,
      }));
      setEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);
      setSaveError(err?.response?.data?.message || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      clearUser();
      setLoggingOut(false);
      setOpen(false);
      navigate("/login");
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Image must be under 5MB.");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadProfileImage(file);
      setUser((prev) => ({ ...prev, profile_image: result.profile_image }));
    } catch (err) {
      console.error("Profile image upload failed:", err);
      setUploadError(err?.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl = resolveAvatarUrl(user?.profile_image);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.name || "Profile"}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
            {user?.name ? getInitials(user.name) : <UserIcon size={16} />}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-20">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name || "Profile"}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-semibold">
                  {user?.name ? getInitials(user.name) : <UserIcon size={18} />}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Edit photo"
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white hover:bg-slate-700 disabled:opacity-60"
              >
                {uploading ? <Loader2 size={10} className="animate-spin" /> : <Camera size={10} />}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                className="hidden"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.name || "Unknown user"}
              </p>
              <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                <ShieldCheck size={10} />
                {user?.role || "—"}
              </span>
            </div>
          </div>

          {uploadError && (
            <p className="px-4 pt-2 text-xs text-red-500">{uploadError}</p>
          )}

          {!editing && (
            <div className="px-4 py-3 space-y-2.5 border-b border-slate-100">
              <div className="flex items-start gap-2">
                <Mail size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-700 break-all">{user?.email || "—"}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-700">{user?.address || "No address added"}</p>
              </div>

              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 pt-1"
              >
                <Pencil size={12} />
                Edit profile
              </button>
            </div>
          )}

          {editing && (
            <div className="px-4 py-3 space-y-2.5 border-b border-slate-100">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {saveError && <p className="text-xs text-red-500">{saveError}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Save
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 disabled:opacity-60"
                >
                  <X size={12} />
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            <LogOut size={16} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}