
import {
  LayoutDashboard,
  CheckSquare,
  ArrowLeftRight,
  Building2,
  Users,
  ListTodo,
  FileText,
  CheckCircle2,
  PlusCircle,
  UserRoundPlus,
} from "lucide-react";

export const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "My Tasks", icon: CheckSquare, path: "/my-tasks" },
  { label: "My Requests", icon: ArrowLeftRight, path: "/my-requests" },
  { label: "Organizations", icon: Building2, path: "/organizations" },
  { label: "Teams", icon: Users, path: "/teams" },
  { label: "Tasks", icon: ListTodo, path: "/tasks" },
  { label: "Requests", icon: FileText, path: "/requests" },
];

export const summaryCards = [
  {
    label: "My Tasks",
    key: "assignedTasks",
    icon: CheckCircle2,
    color: "blue",
    path: "/my-tasks",
    noteKey: "overdueTasks",
    note: "overdue",
  },
  {
    label: "My Requests",
    key: "myRequests",
    icon: ArrowLeftRight,
    color: "purple",
    path: "/my-requests",
  },
  {
    label: "My Teams",
    icon: Users,
    color: "green",
    path: "/teams",
  },
  {
    label: "Organizations",
    icon: Building2,
    color: "orange",
    path:"/organizations"
  },
];

export const quickActions = [
  {
    label: "Create Task",
    description: "Add a new task",
    icon: PlusCircle,
    color: "blue",
    path: "/tasks",
  },
  {
    label: "Send Request",
    description: "Request something from another team",
    icon: ArrowLeftRight,
    color: "purple",
    path: "/requests",
  },
  {
    label: "Create Team",
    description: "Start a new team",
    icon: Users,
    color: "green",
    path: "/teams",
  },
  {
    label: "Invite Member",
    description: "Add members to your team or organization",
    icon: UserRoundPlus,
    color: "orange",
    path: "/organizations",
  },
];

export const colors = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    active: "bg-blue-50 text-blue-700",
    dot: "bg-blue-600",
  },
  purple: {
    icon: "bg-violet-50 text-violet-600",
    active: "bg-violet-50 text-violet-700",
    dot: "bg-violet-600",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-600",
    active: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-600",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
    active: "bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
};

