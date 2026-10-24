import {useState } from "react";
import { Users, Settings, LogOut, X } from "lucide-react";
import { navigation } from "../config/dashboardConfig";
import {useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({mobileOpen , setMobileOpen}){

  const navigate = useNavigate();
  const location = useLocation();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", {replace: true});
  }

  const activePath = location.pathname.replace(/\/$/, "") || "/dashboard";
  
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[74px] items-center gap-3 border-b border-slate-100 px-7">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Users size={23} strokeWidth={2.5} />
          </div>

          <span className="text-[23px] font-bold tracking-tight text-slate-900">
            TeamHub
          </span>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigation.map(({ label, icon: Icon, path }) => (
            <button
              type="button"
              key={label}
              onClick={() => {
                navigate(path);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                activePath === path
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={19} strokeWidth={1.9} />
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-1 border-t border-slate-100 px-3 py-4">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              navigate("/settings");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Settings size={19} />
            Settings
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
