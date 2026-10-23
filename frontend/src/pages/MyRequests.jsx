import { useCallback, useEffect, useMemo, useState } from "react";
import {CalendarDays,Check,Clock3,FileText,Inbox,LoaderCircle,MessageSquareText,RefreshCw,Search,Send,X,XCircle} from "lucide-react";

import api from "../services/axiosApi";

import { STATUSES , STATUS_LABELS , STATUS_STYLES , PRIORITY_STYLES} from "../config/myRequestsConfig";
import { formatDateTime , getErrorMessage } from "../utils/myRequestsHelper";

import SummaryCard  from "../components/myRequests/SummaryCard";
import ActionButton from "../components/myRequests/ActionButton";
import EmptyState from "../components/myRequests/EmptyState";
import ErrorBanner from "../components/myRequests/ErrorBanner";


export default function MyRequests() {
  const [direction, setDirection] = useState("incoming");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [decisionNotes, setDecisionNotes] = useState({});
  const [noteTarget, setNoteTarget] = useState("");

  const loadRequests = useCallback(async () => {

    setLoadingRequests(true);
    setPageError("");

    try{
      const response = await api.get(`/requests/assigned-requests`);
      console.log(response);
      const list = response.data.requests;

      setRequests(list);
    }catch(error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

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


  async function makeDecision(request, status) {
    setBusyId(request._id);
    setActionError("");

    try {
      await api.patch(`/requests/${request._id}/decision`, {
        decision,
        note: decisionNotes[request._id] || "",
      });

      setNoteTarget("");
      setDecisionNotes((previous) => {
        const next = { ...previous };
        delete next[request._id];
        return next;
      });

      await loadRequests();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusyId("");
    }
  }

  async function updateProgress(request, status) {
    setBusyId(request._id);
    setActionError("");

    try {
      await api.patch(`/requests/${request._id}/status`, {
        status,
      });

      await loadRequests();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusyId("");
    }
  }

  async function cancelRequest(request) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this request?"
    );

    if (!confirmed) return;

    setBusyId(request._id);
    setActionError("");

    try {
      await api.patch(`/api/requests/${request._id}/cancel`);
      await loadRequests();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
              <Send size={17} />
              Cross-team coordination
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              My Requests
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Send work between teams, review incoming requests, and track
              decisions in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              loadRequests();
            }}
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

        {pageError && (
          <ErrorBanner message={pageError} onClose={() => setPageError("")} />
        )}

        {actionError && (
          <ErrorBanner
            message={actionError}
            onClose={() => setActionError("")}
          />
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryCard
            icon={<Inbox size={20} />}
            label="Total Requests"
            value={requests.length}
            iconClass="bg-violet-50 text-violet-700"
          />

          <SummaryCard
            icon={<Send size={20} />}
            label="Completed Request"
            value={0}
            iconClass="bg-blue-50 text-blue-700"
          />
        </div>

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
                    : direction === "incoming"
                      ? "No incoming requests"
                      : "No outgoing requests"
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
                  const busy = busyId === request._id;
                  const canDecide =
                    direction === "incoming" &&
                    ["Pending", "Clarification"].includes(request.status);
                  const canProgress =
                    direction === "incoming" &&
                    ["Approved", "InProgress"].includes(request.status);
                  const canCancel =
                    direction === "outgoing" &&
                    !["Completed", "Rejected", "Cancelled"].includes(
                      request.status
                    );

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

                            <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                              {request.description ||
                                "No description provided."}
                            </p>

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

                            {request.decision_Note && (
                              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
                                  <MessageSquareText size={16} />
                                  Decision note
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-6 text-blue-900/80">
                                  {request.decision_Note}
                                </p>
                                {request.decision_At && (
                                  <p className="mt-2 text-xs text-blue-800/60">
                                    Updated{" "}
                                    {formatDateTime(request.decision_At)}
                                  </p>
                                )}
                              </div>
                            )}

                            {canDecide && (
                              <div className="rounded-xl border border-slate-200 p-4">
                                <label
                                  htmlFor={`note-${request._id}`}
                                  className="mb-2 block text-sm font-semibold"
                                >
                                  Decision note (optional)
                                </label>

                                <textarea
                                  id={`note-${request._id}`}
                                  rows={3}
                                  value={decisionNotes[request._id] || ""}
                                  onChange={(event) =>
                                    setDecisionNotes((previous) => ({
                                      ...previous,
                                      [request._id]: event.target.value,
                                    }))
                                  }
                                  placeholder="Explain your decision or request clarification..."
                                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <ActionButton
                                    disabled={busy}
                                    onClick={() =>
                                      makeDecision(request, "Approved")
                                    }
                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                  >
                                    <Check size={15} />
                                    Approve
                                  </ActionButton>

                                  <ActionButton
                                    disabled={busy}
                                    onClick={() =>
                                      makeDecision(request, "Clarification")
                                    }
                                    className="border border-violet-200 text-violet-700 hover:bg-violet-50"
                                  >
                                    <MessageSquareText size={15} />
                                    Ask clarification
                                  </ActionButton>

                                  <ActionButton
                                    disabled={busy}
                                    onClick={() =>
                                      makeDecision(request, "Rejected")
                                    }
                                    className="border border-red-200 text-red-700 hover:bg-red-50"
                                  >
                                    <X size={15} />
                                    Reject
                                  </ActionButton>
                                </div>
                              </div>
                            )}

                            {canProgress && (
                              <div className="rounded-xl border border-slate-200 p-4">
                                <p className="mb-3 text-sm font-semibold">
                                  Update request progress
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  {request.status === "Approved" && (
                                    <ActionButton
                                      disabled={busy}
                                      onClick={() =>
                                        updateProgress(request, "InProgress")
                                      }
                                      className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                      Mark in progress
                                    </ActionButton>
                                  )}

                                  <ActionButton
                                    disabled={busy}
                                    onClick={() =>
                                      updateProgress(request, "Completed")
                                    }
                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                  >
                                    <Check size={15} />
                                    Mark completed
                                  </ActionButton>
                                </div>
                              </div>
                            )}

                            {canCancel && (
                              <div>
                                <ActionButton
                                  disabled={busy}
                                  onClick={() => cancelRequest(request)}
                                  className="border border-red-200 text-red-700 hover:bg-red-50"
                                >
                                  <XCircle size={15} />
                                  Cancel request
                                </ActionButton>
                              </div>
                            )}

                            {busy && (
                              <p className="flex items-center gap-2 text-xs text-slate-500">
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin"
                                />
                                Saving changes...
                              </p>
                            )}
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
      </main>
    </div>
  );
}








