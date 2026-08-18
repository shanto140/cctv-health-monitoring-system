import { NavLink, useNavigate } from "react-router-dom";
import { ListChecks, Camera, LogOut } from "lucide-react";
import { logoutUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/technician/dashboard", label: "My Incidents", icon: ListChecks },
  { to: "/technician/cameras", label: "Cameras", icon: Camera },
];

export default function TechnicianSidebar() {
  const navigate = useNavigate();
  const { clearUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    } finally {
      clearUser();
      navigate("/login");
    }
  };

  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="font-mono text-cyan-400 text-sm tracking-widest">CCTV/TECH</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-cyan-400" />
                )}
                <Icon size={18} strokeWidth={2} className={isActive ? "text-cyan-400" : ""} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          Logout
        </button>
      </div>
    </aside>
  );
}