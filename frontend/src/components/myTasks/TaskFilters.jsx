import {ArrowDownUp,Search,SlidersHorizontal} from "lucide-react";
import {FILTERS} from "../../config/tasksConfig";

export default function TaskFilters({activeFilter,onFilterChange,search,onSearchChange,sortOrder,onSortChange}) {
  return (
    <div className="border-b border-slate-100 p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <SlidersHorizontal size={17} />
          Filter and manage tasks
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onFilterChange(filter.value)}
              aria-pressed={activeFilter === filter.value}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                activeFilter === filter.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                onSearchChange(event.target.value)
              }
              placeholder="Search tasks, teams or organizations..."
              aria-label="Search tasks"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="relative">
            <ArrowDownUp
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={sortOrder}
              onChange={(event) =>
                onSortChange(event.target.value)
              }
              aria-label="Sort tasks"
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-blue-500 sm:w-auto"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="deadline">Nearest deadline</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}