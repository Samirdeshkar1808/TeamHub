
import { useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import TasksHeader from "../components/myTasks/TasksHeader";
import SummaryCards from "../components/myTasks/SummaryCards";
import TaskFilters from "../components/myTasks/TaskFilters";
import TaskError from "../components/myTasks/TaskError";
import TaskCards from "../components/myTasks/TaskCards";

import useMyTasks from "../hooks/useMyTasks";

export default function MyTasks() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const {
    tasks,
    loading,
    pageError,
    updatingTasks,
    totalTasks,
    completedTasks,
    currTasks,
    fetchTasks,
    updateStatus,
    dismissError,
  } = useMyTasks(activeFilter);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks
      .filter((task) => {
        if (!query) return true;

        const searchableValues = [
          task.title,
          task.description,
          task.team_Id?.name,
          task.organization_Id?.name,
          task.created_By?.name,
        ];

        return searchableValues.some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortOrder === "newest") {
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        }

        if (sortOrder === "oldest") {
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );
        }

        if (sortOrder === "deadline") {
          // Tasks without a deadline appear last.
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;

          return (
            new Date(a.dueDate).getTime() -
            new Date(b.dueDate).getTime()
          );
        }

        return 0;
      });
  }, [tasks, search, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:pl-70">
        <TasksHeader
          fetchTasks={fetchTasks}
          loading={loading}
        />

        <SummaryCards
          currTasks={currTasks}
          completedTasks={completedTasks}
          totalTasks={totalTasks}
        />

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <TaskFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            search={search}
            onSearchChange={setSearch}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />

          <TaskError
            message={pageError}
            onDismiss={dismissError}
          />

          <div className="p-4 sm:p-5">
            <TaskCards
              tasks={visibleTasks}
              loading={loading}
              search={search}
              activeFilter={activeFilter}
              updatingTasks={updatingTasks}
              onStatusChange={updateStatus}
              onClearSearch={() => setSearch("")}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
