import { Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-10">
      <h1 className="text-base font-semibold text-slate-800">Admin Panel</h1>

      <div className="flex items-center gap-5">
        {/* Notification bell — UI only, logic যোগ হবে শেষে আলাদা session এ */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={20} className="text-slate-600" />
        </button>

        <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <User size={16} className="text-slate-500" />
          </div>
        </button>
      </div>
    </header>
  );
}