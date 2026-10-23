
import { Search, Bell, Menu } from "lucide-react";

export default function DashboardHeader({user, onOpenMenu, navigate }) {
  return (
    <header className="sticky top-0 z-30 flex h-[74px] items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <Menu size={21} />
      </button>

      <div className="relative max-w-[510px] flex-1">
        <Search
          size={19}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          placeholder="Search teams, organizations, tasks..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-50"
        />
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative ml-auto rounded-lg p-2.5 text-slate-500 hover:bg-slate-50"
      >
        <Bell size={21} strokeWidth={1.8} />
      </button>

      <button
        type="button"
        onClick={() => navigate("/settings")}
        className="flex items-center gap-3 rounded-lg py-1 pl-1 pr-2 text-left hover:bg-slate-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
          {(user?.name || "U").trim().slice(0, 1).toUpperCase()}
        </div>

        <div className="hidden sm:block">
          <p className="max-w-36 truncate text-sm font-medium text-slate-900">
            {user?.name || "TeamHub User"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {user?.email || "E-mail"}
          </p>
        </div>
      </button>
    </header>
  );
}
