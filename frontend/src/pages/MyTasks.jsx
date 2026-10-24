import{ useCallback, useEffect, useState } from "react";
import {
  ArrowDownUp,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ListTodo,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import api from "../services/axiosApi";

import { FILTERS , PRIORITIES , STATUSES , STATUS_LABELS } from "../config/tasksConfig";
import { formatDate , isOverdue , getErrorMessage} from "../utils/myTasksHelper";
import SummaryCard  from "../components/myTasks/SummaryCard";
import TasksHeader from "../components/myTasks/TasksHeader";
import Sidebar from "../components/Sidebar";

export default function MyTasks(){

  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [updatingTasks, setUpdatingTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [currTasks, setCurrTasks] = useState(0);

  const fetchTasks = useCallback(async()=>{
    setLoading(true);
    setPageError("");
    try{
      const params = {};
      
      if (activeFilter !== "All") {
        params.status = activeFilter;
      }

      const response = await api.get("/dashboard/my-tasks", { params });
      const data = response.data;

      if(activeFilter === "All"){
        setTasks(Array.isArray(data.Alltasks) ? data.Alltasks : []);
      }
      else{
        setTasks(Array.isArray(data.filteredTasks) ? data.filteredTasks : [])
      }

      setTotalTasks(data.Allcount ?? 0);
      setCurrTasks(data.currTasks ?? 0);
      setCompletedTasks(data.completedTasks ?? 0);

    }catch(error){
      setPageError(getErrorMessage(error));
    }finally{
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => { fetchTasks() }, [fetchTasks]);

  function changeFilter(value) {
    setActiveFilter(value);
  }

  async function updateStatus(taskId, newStatus) {
    const originalTask = tasks.find((task) => task._id === taskId);

    if(!originalTask || originalTask.status === newStatus) return;

    setUpdatingTasks((previous) => [...previous, taskId]);
    setPageError("");

    // Update the visible task immediately.
    setTasks((previous) =>
      previous.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try{
      await api.patch(`/tasks/${taskId}/status`, {
        status: newStatus,
      });

      // Refresh counts and the current server-side filtered list.
      await fetchTasks();
    }catch(error){
      // Restore the original status if the request fails.
      setTasks((previous) =>
        previous.map((task) =>
          task._id === taskId
            ? { ...task, status: originalTask.status }
            : task
        )
      );

      setPageError(getErrorMessage(error));
      setLoading(false);
    }finally {
      setUpdatingTasks((previous) =>
        previous.filter((id) => id !== taskId)
      );
    }
  }

  const visibleTasks = tasks
    .filter((task) => {
      const query = search.trim().toLowerCase();

      if (!query) return true;

      return [
        task.title,
        task.description,
        task.team_Id?.name,
        task.organization_Id?.name,
        task.created_By?.name,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (sortOrder === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortOrder === "deadline") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return new Date(a.dueDate) - new Date(b.dueDate);
      }

      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar/>
      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:pl-70">

        {/* Page heading */}
        <TasksHeader 
          fetchTasks={fetchTasks}
          loading={loading}
        />

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            icon={<ListTodo size={20} />}
            label="Tasks Assigned"
            value={currTasks}
            iconClass="bg-blue-50 text-blue-700"
          />

          <SummaryCard
            icon={<CheckCircle2 size={20} />}
            label="Tasks Completed"
            value={completedTasks}
            iconClass="bg-emerald-50 text-emerald-700"
          />

          <SummaryCard
            icon={<Clock3 size={20} />}
            label="Total Tasks"
            value={totalTasks}
            iconClass="bg-violet-50 text-violet-700"
          />
        </div>

        {/* Filters */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                    onClick={() => changeFilter(filter.value)}
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tasks, teams or organizations..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="relative">
                  <ArrowDownUp
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
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

          {/* Error message */}
          {pageError && (
            <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-5">
              <CircleAlert size={18} className="mt-0.5 shrink-0" />
              <span className="flex-1">{pageError}</span>
              <button
                type="button"
                onClick={() => setPageError("")}
                aria-label="Dismiss error"
              >
                <XCircle size={17} />
              </button>
            </div>
          )}

          {/* Task list */}
          <div className="p-4 sm:p-5">
            {loading ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
                <LoaderCircle
                  size={28}
                  className="animate-spin text-blue-600"
                />
                <p className="text-sm">Loading your tasks...</p>
              </div>
            ) : visibleTasks.length === 0 ? (
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
                    onClick={() => setSearch("")}
                    className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {visibleTasks.map((task) => (
                  <article
                    key={task._id}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                              PRIORITIES[task.priority] ||
                              PRIORITIES.Medium
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
                            {STATUS_LABELS[task.status] ||
                              task.status}
                          </span>

                          {isOverdue(task) && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                              <CircleAlert size={13} />
                              Overdue
                            </span>
                          )}
                        </div>

                        <h2 className="break-words text-base font-semibold text-slate-900 sm:text-lg">
                          {task.title}
                        </h2>

                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                          {task.description || "No description provided."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="font-medium text-slate-700">
                              Team:
                            </span>
                            {task.team_Id?.name || "Unknown team"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <span className="font-medium text-slate-700">
                              Organization:
                            </span>
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
                            disabled={updatingTasks.includes(task._id)}
                            onChange={(event) =>
                              updateStatus(task._id, event.target.value)
                            }
                            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-wait disabled:opacity-60"
                          >
                            {FILTERS.filter(
                              (filter) => filter.value !== "All"
                            ).map((filter) => (
                              <option
                                key={filter.value}
                                value={filter.value}
                              >
                                {filter.label}
                              </option>
                            ))}
                          </select>

                          {updatingTasks.includes(task._id) && (
                            <LoaderCircle
                              size={16}
                              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600"
                            />
                          )}
                        </div>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Changes are saved to TeamHub.
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}


