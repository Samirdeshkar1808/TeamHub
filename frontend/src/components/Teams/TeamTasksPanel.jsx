import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, ClipboardList } from "lucide-react";
import teamWorkspaceService from "../../services/teamWorkspaceService";

const priorities = ["Low", "Medium", "High", "Urgent"];
const statuses = ["Todo", "InProgress", "Cancelled", "Done"];

function getError(error) {
  return error.response?.data?.message || "Something went wrong.";
}

function formatStatus(status = "") {
  return status.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export default function TeamTasksPanel({ teamId, members = [] }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assigned_To: "",
  });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await teamWorkspaceService.getTeamTasks(teamId);
      setTasks(result.tasks || []);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setSaving(true);

    try {
      await teamWorkspaceService.createTask(teamId, {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate || null,
        assigneduserId: form.assigned_To,
      });

      setForm({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        assigned_To: "",
      });
      setShowForm(false);
      setNotice("Task created successfully.");
      await loadTasks();
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(taskId, status) {
    setError("");
    setNotice("");

    try {
      await teamWorkspaceService.updateTaskStatus(taskId, status);
      setNotice("Task status updated.");
      await loadTasks();
    } catch (err) {
      setError(getError(err));
    }
  }

  const visibleTasks =
    statusFilter === "All"
      ? tasks
      : tasks.filter((task) => task.status === statusFilter);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Team tasks
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create, assign, and track your team's work.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadTasks}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={16} />
            Create task
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {notice}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5"
        >
          <h3 className="font-semibold text-gray-900">New task</h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              placeholder="e.g. Prepare the event page"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              placeholder="Describe the work to be done..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => updateForm("priority", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Due date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => updateForm("dueDate", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Assign to team member
            </label>
            {members.length === 0 ? (
              <p className="text-sm text-gray-500">
                No members available to assign.
              </p>
            ) : (
              <select
                value={form.assigned_To}
                onChange={(e) => updateForm("assigned_To", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white"
              >
                <option value="">Unassigned</option>
                {members.map((member) => {
                  const user = member.user || {};
                  if (!user._id) return null;

                  return (
                    <option key={user._id} value={user._id}>
                      {user.name || user.email} {member.role === "Head" ? "(Head)" : ""}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create task"}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {["All", ...statuses].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              statusFilter === status
                ? "bg-gray-900 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {status === "All" ? "All tasks" : formatStatus(status)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading team tasks...
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <ClipboardList className="mx-auto text-gray-400" size={30} />
          <p className="mt-3 font-medium text-gray-800">No tasks found</p>
          <p className="mt-1 text-sm text-gray-500">
            Tasks matching this filter will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleTasks.map((task) => {
            const assignee = task.assigned_To;

            const assigneeName = assignee !== null ? assignee.name || assignee.email || "Assigned member"
                : members.find((m) => m.user?._id === assignee)?.user?.name || "Assigned member";

            return (
              <article
                key={task._id}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <span className="h-fit w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {task.priority || "Medium"} priority
                  </span>
                </div>

                <div className="mt-4 flex flex-col justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
                  <div className="text-sm text-gray-500">
                    <p>
                      Assigned To: {assigneeName}
                    </p>
                    <p className="mt-1">
                      Due:{" "}
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No due date"}
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    Status
                    <select
                      value={task.status || "Todo"}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}