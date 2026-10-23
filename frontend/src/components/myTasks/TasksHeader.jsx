
import { ListTodo , RefreshCw } from "lucide-react"

export default function TasksHeader({fetchTasks , loading}){
    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
              <ListTodo size={17} />
              My Workspace
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              My Tasks
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Keep track of your assigned work and update your progress.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchTasks}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-slate-100 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
    )
}