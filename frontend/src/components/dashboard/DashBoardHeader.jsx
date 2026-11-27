import { Bell } from "lucide-react";

export default function DashboardHeader({user,navigate }) {

  const userInitial = (user?.name || "U").trim().slice(0, 1).toUpperCase();

  return (
   <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md sm:px-8 shadow-xs">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
        >
          <Bell size={20} strokeWidth={1.8} />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="group flex items-center gap-3 rounded-2xl p-1.5 pr-3 text-left transition-all hover:bg-slate-100 active:scale-98"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-sm font-bold text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            {userInitial}
          </div>

          <div className="hidden sm:block">
            <p className="max-w-32 truncate text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {user?.name || "TeamHub User"}
            </p>
            <p className="max-w-36 truncate text-xs text-slate-400">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </button>

      </div>
    </header>
  );
}
