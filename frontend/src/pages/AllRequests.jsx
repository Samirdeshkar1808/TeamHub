import { useEffect, useMemo, useState } from "react";
import {CalendarDays,Check,Clock3,FileText,Inbox,LoaderCircle,MessageSquareText,ShieldAlert,ClipboardList,RefreshCw,Search,Send,X,XCircle} from "lucide-react";

import api from "../services/axiosApi";

import { STATUSES , STATUS_LABELS , STATUS_STYLES , PRIORITY_STYLES} from "../config/myRequestsConfig";
import { formatDateTime , getErrorMessage } from "../utils/myRequestsHelper";

import EmptyState from "../components/myRequests/EmptyState";
import Sidebar from "../components/Sidebar";
import OrganizationSelector from "../components/AllTasks/OrganizationSelector";


export default function AllRequests() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [organizationsLoading, setOrganizationsLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [pageError, setPageError] = useState("");
  const [expandedId, setExpandedId] = useState("");

  const pageLoading = organizationsLoading;

  const normalizeRole = (role) => typeof role === "string" ? role.trim().toLowerCase() : "";

  const canManageOrganization = (role) =>
  ["admin", "owner"].includes(normalizeRole(role));

  const selectedOrganization = organizations.find(
    (organization) => organization.id === selectedOrganizationId
  );

  const hasPermission = canManageOrganization(
    selectedOrganization?.role
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchOrganizations() {
      setOrganizationsLoading(true);
      setPageError("");

      try{
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

  useEffect(() =>{

    let cancelled = false;
    
    async function  loadRequests(){

     setRequests([]);
     setPageError("");

     if(!selectedOrganizationId || !hasPermission) {
        setLoadingRequests(false);
        return;
     }
     setLoadingRequests(true);

     try{
       const response = await api.get(`/dashboard/${selectedOrganizationId}/all-requests`);
       const list = response.data.allrequests;

       setRequests(list);
     }catch(error) {
      setPageError(getErrorMessage(error));
     } finally {
      setLoadingRequests(false);
     }
    }

    loadRequests();
    return () => {
      cancelled = true;
    };
  },[selectedOrganizationId, hasPermission])


  const visibleRequests = useMemo(() => {
    const filtered = requests.filter((request) =>{
      
      const query = search.trim().toLowerCase();

     if(!query) return true;

      return [
        request.title,
        request.description,
        request.from_Team?.name,
        request.to_Team?.name,
        request.created_By?.name,
        request.status,
        request.priority,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });

    return filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [requests, search]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar/>
      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:pl-70">
        
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Send size={23} />
                </div>
        
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                     Requests
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                     Manage requests across your organizations.
                    </p>
                </div>
          </div>
          
          <button
            type="button"
            onClick={() => {}}
            disabled={loadingRequests}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-slate-100 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={ loadingRequests ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

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
              You must belong to an organization to view its requests.
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
                    requests in this organization.
                  </p>
                </div>
              </div>
            </div>
          )}
        
        {!pageLoading && selectedOrganization && hasPermission && (

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search requests..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 sm:w-48"
              >
                <option value="All">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {loadingRequests ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
                <LoaderCircle
                  size={28}
                  className="animate-spin text-blue-600"
                />
                <p className="text-sm">Loading requests...</p>
              </div>
            ): visibleRequests.length === 0 ? (
              <EmptyState
                title={
                  search
                    ? "No matching requests"
                    :  "No Requests Found"
                }
                description={
                  search
                    ? "Try changing your search or status filter."
                    : "Requests for this team will appear here when available."
                }
              />
            ) : (
              <div className="space-y-4">
                {visibleRequests.map((request) => {
                  const expanded = expandedId === request._id;

                  return (
                    <article
                      key={request._id}
                      className="rounded-xl border border-slate-200 transition hover:border-slate-300"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                                  PRIORITY_STYLES[request.priority] ||
                                  PRIORITY_STYLES.Medium
                                }`}
                              >
                                {request.priority || "Medium"} Priority
                              </span>

                              <span
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                                  STATUS_STYLES[request.status] ||
                                  "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {STATUS_LABELS[request.status] ||
                                  request.status}
                              </span>
                            </div>

                            <h2 className="break-words text-base font-semibold sm:text-lg">
                              {request.title}
                            </h2>
                            
                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                              <span>
                                <span className="font-medium text-slate-700">
                                  From:
                                </span>{" "}
                                {request.from_Team?.name || "Unknown team"}
                              </span>

                              <span>
                                <span className="font-medium text-slate-700">
                                  To:
                                </span>{" "}
                                {request.to_Team?.name || "Unknown team"}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={15} />
                                Deadline: {formatDateTime(request.deadline)}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 size={15} />
                                Created {formatDateTime(request.createdAt)}
                              </span>
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                              Requested by{" "}
                              <span className="font-medium text-slate-700">
                                {request.created_By?.name || "Unknown"}
                              </span>
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(expanded ? "" : request._id)
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-slate-50"
                          >
                            <FileText size={16} />
                            {expanded ? "Hide details" : "View details"}
                          </button>
                        </div>

                        {expanded && (
                          <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
                            <div>
                              <h3 className="mb-2 text-sm font-semibold">
                                Full description
                              </h3>
                              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                {request.description ||
                                  "No description provided."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        )}
      </main>
    </div>
  );
}