import { ChevronRight } from "lucide-react";
import { colors } from "../../config/dashboardConfig";

export default function SummaryCard({ item, summary, navigate }) {
  const Icon = item.icon;
  const style = colors[item.color];

  const count = item.key ? summary?.[item.key] : null;

  const noteCount = item.noteKey ? summary ?.[item.noteKey] : null;

  return (
    <button
      type="button"
      onClick={() => navigate(item.path)}
      className="group min-w-0 rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100 sm:p-6"
    >
      <div className="flex items-start justify-between">
        <span className={`flex h-12 w-12 items-center justify-center rounded-full ${style.icon}`}>
          <Icon size={24} strokeWidth={2} />
        </span>

        <ChevronRight
          size={19}
          className="mt-1 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
        />
      </div>

      <p className="mt-4 text-sm font-medium text-slate-600">
        {item.label}
      </p>

      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
        {count === null ? "-" : count}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {noteCount !== null
          ? `${noteCount} ${item.note}`
          : ""}
      </p>
    </button>
  );
}
