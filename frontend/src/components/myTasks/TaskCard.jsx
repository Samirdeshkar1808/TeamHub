import {
  CalendarDays,
  CircleAlert,
  LoaderCircle,
} from "lucide-react";

import {
  FILTERS,
  PRIORITIES,
  STATUSES,
  STATUS_LABELS,
} from "../../config/tasksConfig";

import {
  formatDate,
  isOverdue,
} from "../../utils/myTasksHelper";

export default function TaskCard({
  task,
  isUpdating,
  onStatusChange,
  readOnly = false,
}) {
  return (
    <article className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {/* Priority and status */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                PRIORITIES[task.priority] || PRIORITIES.Medium
              }`}
            >
              {task.priority || "Medium"} Priority
            </span>

            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                STATUSES[task.status] ||
                "bg-slate-100 text-slate-700"
              }`}
            >
              {STATUS_LABELS[task.status] || task.status}
            </span>

            {isOverdue(task) && (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                <CircleAlert size={13} />
                Overdue
              </span>
            )}
          </div>

          {/* Task information */}
          <h2 className="break-words text-base font-semibold text-slate-900 sm:text-lg">
            {task.title}
          </h2>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
            {task.description || "No description provided."}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
            <span>
              <span className="font-medium text-slate-700">
                Team:
              </span>{" "}
              {task.team_Id?.name || "Unknown team"}
            </span>

            <span>
              <span className="font-medium text-slate-700">
                Organization:
              </span>{" "}
              {task.organization_Id?.name ||
                "Unknown organization"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={15} />
              Due: {formatDate(task.dueDate)}
            </span>

            <span>
              Created by{" "}
              <span className="font-medium text-slate-700">
                {task.created_By?.name || "Unknown"}
              </span>
            </span>
          </div>
        </div>

        {/* Status update */}
        {!readOnly && (
          <div className="w-full shrink-0 lg:w-44">
          <label
            htmlFor={`status-${task._id}`}
            className="mb-2 block text-xs font-semibold text-slate-600"
          >
           Update status
          </label>

          <div className="relative">
           <select
            id={`status-${task._id}`}
            value={task.status}
            disabled={isUpdating || task.status === "Done"}
            onChange={(event) =>
              onStatusChange(task._id, event.target.value)
            }
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-wait disabled:opacity-60"
           >

           <option value={task.status}>
            {task.status === "Done" ? "Completed" : task.status}
           </option>

           {task.status === "Todo" && (
            <option value="InProgress">In Progress</option>
           )}

           {task.status === "InProgress" && (
            <option value="Done">Completed</option>
           )}
           </select>

           {isUpdating && (
            <LoaderCircle
              size={16}
              aria-label="Saving status"
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600"
            />
           )}
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
           {task.status === "Todo" && "Move this task to In Progress."}
           {task.status === "InProgress" && "Mark this task as Completed."}
           {task.status === "Done" && "This task is completed."}
          </p>
         </div>
        )}

      </div>
    </article>
  );
}