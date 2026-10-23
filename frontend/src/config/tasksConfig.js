export const FILTERS = [
  { label: "All Tasks", value: "All" },
  { label: "To Do", value: "Todo" },
  { label: "In Progress", value: "InProgress" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Completed", value: "Done" },
];

export const PRIORITIES = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Urgent: "bg-red-50 text-red-700",
};

export const STATUSES = {
  Todo: "bg-slate-100 text-slate-700",
  InProgress: "bg-blue-50 text-blue-700",
  Cancelled: "bg-red-50 text-red-700",
  Done: "bg-emerald-50 text-emerald-700",
};

export const STATUS_LABELS = {
  Todo: "To Do",
  InProgress: "In Progress",
  Cancelled: "Cancelled",
  Done: "Completed",
};