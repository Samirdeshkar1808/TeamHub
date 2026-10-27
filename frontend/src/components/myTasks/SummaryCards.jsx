import {ListTodo,CheckCircle2,Clock3} from "lucide-react";
import SummaryCard from "./SummaryCard";

export default function SummaryCards({currTasks,completedTasks,totalTasks}) {
  return (
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
  );
}