import { LoaderCircle } from "lucide-react";

import TaskCard from "./TaskCard";
import TaskEmptyState from "./TaskEmptyState";

export default function TaskList({
  tasks,
  loading,
  search,
  activeFilter,
  updatingTasks,
  onStatusChange,
  onClearSearch,
  readOnly = false,
}) {
  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
        <LoaderCircle
          size={28}
          className="animate-spin text-blue-600"
        />
        <p className="text-sm">Loading your tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <TaskEmptyState
        search={search}
        activeFilter={activeFilter}
        onClearSearch={onClearSearch}
      />
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          isUpdating={updatingTasks.includes(task._id)}
          onStatusChange={onStatusChange}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}