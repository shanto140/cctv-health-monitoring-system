import { Bell } from "lucide-react";
import UserMenu from "../common/UserMenu.jsx";

export default function Navbar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-10">
      <h1 className="text-base font-semibold text-slate-800">Admin Panel</h1>

      <div className="flex items-center gap-5">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={20} className="text-slate-600" />
        </button>

        <UserMenu />
      </div>
    </header>
  );
}