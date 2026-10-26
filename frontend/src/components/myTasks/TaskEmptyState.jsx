import { ListTodo } from "lucide-react";

export default function TaskEmptyState({
  search,
  activeFilter,
  onClearSearch,
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <ListTodo size={26} />
      </div>

      <h2 className="text-base font-semibold">
        {search
          ? "No matching tasks"
          : activeFilter === "All"
            ? "No tasks assigned yet"
            : "No tasks in this category"}
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {search
          ? "Try another search term."
          : "Tasks assigned to you will appear here. Check back when your team assigns new work."}
      </p>

      {search && (
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Clear search
        </button>
      )}
    </div>
  );
}