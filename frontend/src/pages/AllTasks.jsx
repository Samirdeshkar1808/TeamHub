
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleAlert,
  ClipboardList,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";

import api from "../services/axiosApi";
import Sidebar from "../components/Sidebar";

import OrganizationSelector from "../components/AllTasks/OrganizationSelector";
import TaskFilters from "../components/myTasks/TaskFilters";
import TaskError from "../components/myTasks/TaskError";
import TaskCards from "../components/myTasks/TaskCards";

import { getErrorMessage } from "../utils/myTasksHelper";

const normalizeRole = (role) =>
  typeof role === "string" ? role.trim().toLowerCase() : "";

const canManageOrganization = (role) =>
  ["admin", "owner"].includes(normalizeRole(role));

export default function AllTasks() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState("");

  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [organizationsLoading, setOrganizationsLoading] =
    useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const selectedOrganization = organizations.find(
    (organization) =>
      organization.id === selectedOrganizationId
  );

  const hasPermission = canManageOrganization(
    selectedOrganization?.role
  );

  // Fetch only the organizations the current user belongs to.
  useEffect(() => {
    let cancelled = false;

    async function fetchOrganizations() {
      setOrganizationsLoading(true);
      setPageError("");

      try {
        const { data } = await api.get("/organizations");
        const memberships = Array.isArray(data.organizations)
          ? data.organizations
          : [];

        if (cancelled) return;

        setOrganizations(memberships);

        setSelectedOrganizationId((currentId) => {
          const stillExists = memberships.some(
            (organization) => organization.id === currentId
          );

          return stillExists
            ? currentId
            : memberships[0]?.id || "";
        });
      } catch (error) {
        if (!cancelled) {
          setPageError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setOrganizationsLoading(false);
        }
      }
    }

    fetchOrganizations();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch organization-wide tasks only for an Admin or Owner.
  useEffect(() => {
    let cancelled = false;

    async function fetchOrganizationTasks() {
      setTasks([]);
      setPageError("");

      if (!selectedOrganizationId || !hasPermission) {
        setTasksLoading(false);
        return;
      }

      setTasksLoading(true);

      try {
        const { data } = await api.get(
          `/dashboard/${selectedOrganizationId}/all-tasks`
        );

        if (cancelled) return;

        setTasks(
          Array.isArray(data.allTasks) ? data.allTasks : []
        );
      } catch (error) {
        if (!cancelled) {
          setPageError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setTasksLoading(false);
        }
      }
    }

    fetchOrganizationTasks();

    return () => {
      cancelled = true;
    };
  }, [selectedOrganizationId, hasPermission]);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks
      .filter((task) => {
        // Filter by task status.
        if (
          activeFilter !== "All" &&
          task.status !== activeFilter
        ) {
          return false;
        }

        if (!query) return true;

        const values = [
          task.title,
          task.description,
          task.team_Id?.name,
          task.organization_Id?.name,
          task.created_By?.name,
          task.assigned_To?.name,
        ];

        return values.some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortOrder === "newest") {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        }

        if (sortOrder === "oldest") {
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        }

        if (sortOrder === "deadline") {
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
  }, [tasks, activeFilter, search, sortOrder]);

  const refreshTasks = useCallback(async () => {
    if (!selectedOrganizationId || !hasPermission) return;

    setTasksLoading(true);
    setPageError("");

    try {
      const { data } = await api.get(
        `/dashboard/${selectedOrganizationId}/all-tasks`
      );

      setTasks(
        Array.isArray(data.allTasks) ? data.allTasks : []
      );
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setTasksLoading(false);
    }
  }, [selectedOrganizationId, hasPermission]);

  const pageLoading = organizationsLoading;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:pl-70">
        {/* Page heading */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <ClipboardList size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Tasks
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage tasks across your organizations.
                </p>
              </div>
            </div>
          </div>

          {hasPermission && (
            <button
              type="button"
              onClick={refreshTasks}
              disabled={tasksLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
            >
              <LoaderCircle
                size={16}
                className={tasksLoading ? "animate-spin" : "hidden"}
              />
              {tasksLoading ? "Refreshing..." : "Refresh tasks"}
            </button>
          )}
        </div>

        {/* Organization selector */}
        {pageLoading ? (
          <div className="flex min-h-32 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
            <LoaderCircle
              size={22}
              className="animate-spin text-blue-600"
            />
            Loading your organizations...
          </div>
        ) : (
          <OrganizationSelector
            organizations={organizations}
            selectedOrganizationId={selectedOrganizationId}
            onOrganizationChange={setSelectedOrganizationId}
          />
        )}

        {/* Error message */}
        <TaskError
          message={pageError}
          onDismiss={() => setPageError("")}
        />

        {/* Empty organization membership */}
        {!pageLoading && organizations.length === 0 && !pageError && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <ClipboardList
              size={30}
              className="mx-auto text-slate-400"
            />
            <h2 className="mt-3 font-semibold">
              No organizations found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              You must belong to an organization to view its tasks.
            </p>
          </div>
        )}

        {/* Permission denied */}
        {!pageLoading &&
          selectedOrganization &&
          !hasPermission && (
            <div
              role="status"
              className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert
                  size={25}
                  className="mt-0.5 shrink-0 text-amber-700"
                />

                <div>
                  <h2 className="font-semibold text-amber-900">
                    Organization admin access required
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    You are not an admin or owner of{" "}
                    <strong>{selectedOrganization.name}</strong>.
                    Only organization admins and owners can view all
                    tasks in this organization.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Organization tasks */}
        {!pageLoading &&
          selectedOrganization &&
          hasPermission && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      All organization tasks
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedOrganization.name}
                    </p>
                  </div>

                  {!tasksLoading && (
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
                      {tasks.length}{" "}
                      {tasks.length === 1 ? "task" : "tasks"}
                    </span>
                  )}
                </div>
              </div>

              <TaskFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                search={search}
                onSearchChange={setSearch}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
              />

              <div className="p-4 sm:p-5">
                <TaskCards
                  tasks={visibleTasks}
                  loading={tasksLoading}
                  search={search}
                  activeFilter={activeFilter}
                  updatingTasks={[]}
                  onStatusChange={() => {}}
                  onClearSearch={() => setSearch("")}
                  readOnly={true}
                />
              </div>
            </section>
          )}
      </main>
    </div>
  );
}
