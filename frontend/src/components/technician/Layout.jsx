import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import UserMenu from "../common/UserMenu.jsx";
import NotificationBell from "../common/NotificationBell.jsx";

export default function TechnicianLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-10">
          <h1 className="text-base font-semibold text-slate-800">Technician Panel</h1>
           <div className="flex items-center gap-5">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}