
import { ChevronRight, PlusCircle } from "lucide-react";
import { quickActions, colors } from "../../config/dashboardConfig";

export default function QuickActions({ navigate }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <PlusCircle size={21} className="text-slate-700" />
        <h2 className="text-base font-semibold text-slate-900">
          Quick Actions
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {quickActions.map(
          ({label, description, icon: Icon, color, path}) => (
            <button
              type="button"
              key={label}
              onClick={() => navigate(path)}
              className="group flex min-h-[125px] items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-slate-50/60"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${colors[color].icon}`}
              >
                <Icon size={22} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  {label}
                </span>

                <span className="mt-1.5 block text-xs leading-5 text-slate-500">
                  {description}
                </span>
              </span>

              <ChevronRight
                size={17}
                className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
              />
            </button>
          )
        )}
      </div>
    </section>
  );
}
