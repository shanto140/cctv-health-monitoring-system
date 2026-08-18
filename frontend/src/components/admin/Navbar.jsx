import UserMenu from "../common/UserMenu.jsx";
import NotificationBell from "../common/NotificationBell.jsx";

export default function Navbar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-10">
      <h1 className="text-base font-semibold text-slate-800">Admin Panel</h1>

      <div className="flex items-center gap-5">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}