import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Send, ArrowDownLeft } from "lucide-react";
import api from "../../services/axiosApi";
import teamWorkspaceService from "../../services/teamworkspaceService";

const statuses = [
  "Pending",
  "Clarification",
  "Approved",
  "Rejected",
  "InProgress",
  "Completed",
  "Cancelled",
];

const priorities = ["Low", "Medium", "High", "Urgent"];

function getError(error) {
  return error.response?.data?.message || "Something went wrong.";
}

function formatStatus(status = "") {
  return status.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export default function TeamRequestsPanel({ teamId, teamData }) {
  const team = teamData?.team || {};
  const organizationId =
    typeof team.organization_Id === "object"
      ? team.organization_Id?._id
      : team.organization_Id;

  const [requests, setRequests] = useState([]);
  const [otherTeams, setOtherTeams] = useState([]);
  const [direction, setDirection] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [assigningRequestId, setAssigningRequestId] = useState("");

  const [form, setForm] = useState({
    to_Team: "",
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await teamWorkspaceService.getTeamRequests(teamId);
      setRequests(result.requests || []);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    let active = true;

    async function loadOtherTeams() {
      if (!organizationId) return;

      try {
        const response = await api.get(
          `/organizations/${organizationId}/teams`
        );
        const teams = response.data.teams || [];

        if (active) {
          setOtherTeams(teams.filter((item) => item._id !== teamId));
        }
      } catch {
        if (active) setOtherTeams([]);
      }
    }

    loadOtherTeams();

    return () => {
      active = false;
    };
  }, [organizationId, teamId]);

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.to_Team) {
      setError("Choose the team that should receive this request.");
      return;
    }

    setSaving(true);

    try {
      await teamWorkspaceService.createRequest(teamId, {
        toTeamId: form.to_Team,
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate || null,
      });

      setForm({
        to_Team: "",
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
      });
      setShowForm(false);
      setNotice("Request created successfully.");
      setDirection("outgoing");
      setStatusFilter("All");
      await loadRequests();
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  }

  async function runAction(action, successMessage) {
    setError("");
    setNotice("");

    try {
      await action();
      setNotice(successMessage);
      await loadRequests();
    } catch (err) {
      setError(getError(err));
    }
  }

  const visibleRequests = requests.filter((request) => {
    const incoming =
      String(request.to_Team?._id || request.to_Team) === teamId;
    const outgoing =
      String(request.from_Team?._id || request.from_Team) === teamId;

    const matchesDirection =
      direction === "all" ||
      (direction === "incoming" && incoming) ||
      (direction === "outgoing" && outgoing);

    const matchesStatus =
      statusFilter === "All" || request.status === statusFilter;

    return matchesDirection && matchesStatus;
  });

function getAssignedMember(request) {
  const assigned = request.assigned_To;

  if (!assigned) return null;

  // Support legacy array responses.
  const member = Array.isArray(assigned) ? assigned[0] : assigned;

  if (!member) return null;

  // Populated user object.
  if (typeof member === "object") {
    return {
      id: member._id || "",
      name: member.name || member.email || "Assigned member",
    };
  }

  // If the API returns only an ID, resolve it from team members.
  const teamMember = (teamData?.members || []).find(
    (item) => item.user?._id === member
  );

  return {
    id: member,
    name:
      teamMember?.user?.name ||
      teamMember?.user?.email ||
      "Assigned member",
  };
}

function updateAssignmentDraft(request) {
  const currentIds =
    assignmentDrafts[request._id] ?? getAssignedIds(request);

  setAssignmentDrafts((current) => ({
    ...current,
    [request._id]: currentIds,
  }));
}

async function handleAssignMember(request) {
  const assignedTo = assignmentDrafts[request._id];

  if (!assignedTo) {
    setError("Please select a team member.");
    return;
  }

  setAssigningRequestId(request._id);
  setError("");
  setNotice("");

  try {
    await teamWorkspaceService.assignRequestMembers(
      request._id,
      assignedTo
    );

    setNotice("Request member assigned successfully.");

    setAssignmentDrafts((current) => {
      const next = { ...current };
      delete next[request._id];
      return next;
    });

    await loadRequests();
  } catch (err) {
    setError(getError(err));
  } finally {
    setAssigningRequestId("");
  }
}

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Team requests
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Coordinate work with other teams through formal requests.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadRequests}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={16} />
            New request
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
          <h3 className="font-semibold text-gray-900">
            Send a request to another team
          </h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Recipient team *
            </label>
            <select
              required
              value={form.to_Team}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  to_Team: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">Select a team</option>
              {otherTeams.map((otherTeam) => (
                <option key={otherTeam._id} value={otherTeam._id}>
                  {otherTeam.name}
                </option>
              ))}
            </select>

            {otherTeams.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                No other teams were found in this organization, or you don't
                have permission to list them.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Request title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  title: e.target.value,
                }))
              }
              placeholder="e.g. Design the registration poster"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
              placeholder="Explain what you need from the other team..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    priority: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
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
                Requested deadline
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    dueDate: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || otherTeams.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              <Send size={15} />
              {saving ? "Sending..." : "Send request"}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "All requests" },
          { value: "incoming", label: "Incoming" },
          { value: "outgoing", label: "Outgoing" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setDirection(item.value)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              direction === item.value
                ? "bg-gray-900 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Filter by status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="All">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading requests...
        </div>
      ) : visibleRequests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Send className="mx-auto text-gray-400" size={28} />
          <p className="mt-3 font-medium text-gray-800">No requests found</p>
          <p className="mt-1 text-sm text-gray-500">
            Requests matching these filters will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleRequests.map((request) => {
            const fromTeam =
              request.from_Team?.name ||
              (String(request.from_Team?._id || request.from_Team) === teamId
                ? team.name
                : "Another team");

            const toTeam =
              request.to_Team?.name ||
              (String(request.to_Team?._id || request.to_Team) === teamId
                ? team.name
                : "Another team");

            const incoming =
              String(request.to_Team?._id || request.to_Team) === teamId;

            return (
              <article
                key={request._id}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        {incoming ? (
                          <ArrowDownLeft size={14} />
                        ) : (
                          <Send size={13} />
                        )}
                        {incoming ? "Incoming" : "Outgoing"}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {formatStatus(request.status)}
                      </span>
                      <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
                        {request.priority || "Medium"} priority
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900">
                      {request.title}
                    </h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                      {request.description}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      {fromTeam} <span className="px-1">→</span> {toTeam}
                    </p>

                    {request.decision_Note && (
                      <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                        <span className="font-medium">Decision note: </span>
                        {request.decision_Note}
                      </p>
                    )}
                  </div>

                 {incoming &&
  ["Approved", "InProgress"].includes(request.status) &&
  (() => {
    const assignedMember = getAssignedMember(request);

    // Already assigned
    if(assignedMember) {
      return (
        <div className="w-full rounded-lg border border-green-200 bg-green-50 p-3 sm:w-64">
          <p className="mb-2 text-xs font-medium text-green-700">
            Assigned member
          </p>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-800">
              {assignedMember.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {assignedMember.name}
              </p>
              
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full rounded-lg border border-gray-200 p-3 sm:w-64">
        <p className="mb-2 text-sm font-semibold text-gray-800">
          Assign member
        </p>

        <p className="mb-2 text-xs text-gray-500">
          Select one team member responsible for this request.
        </p>

        <select
          value={assignmentDrafts[request._id] ?? ""}
          onChange={(event) =>
            setAssignmentDrafts((current) => ({
              ...current,
              [request._id]: event.target.value,
            }))
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select a member</option>

          {(teamData?.members || [])
            .filter((member) => member.user?._id)
            .map((member) => (
              <option
                key={member.user._id}
                value={member.user._id}
              >
                {member.user.name || member.user.email}
                {member.role === "Head" ? " (Head)" : ""}
              </option>
            ))}
        </select>

        <button
          type="button"
          onClick={() => handleAssignMember(request)}
          disabled={
            !assignmentDrafts[request._id] ||
            assigningRequestId === request._id
          }
          className="mt-3 w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {assigningRequestId === request._id
            ? "Saving..."
            : "Save assignment"}
        </button>
      </div>
    );
  })()}

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    {incoming && request.status === "Pending" && (
                      <>
                        <button
                          onClick={() =>
                            runAction(
                              () =>
                                teamWorkspaceService.decideRequest(request._id, {decision : "Approved"})
                            )
                          }
                          className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            runAction(
                              () =>
                                teamWorkspaceService.decideRequest(
                                  request._id,
                                  "Rejected"
                                ),
                              "Request rejected."
                            )
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {incoming && request.status === "Approved" && (
                      <button
                        onClick={() =>
                          runAction(
                            () =>
                              teamWorkspaceService.updateRequestStatus(
                                request._id,
                                "InProgress"
                              ),
                            "Request marked in progress."
                          )
                        }
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Start work
                      </button>
                    )}

                    {incoming && request.status === "InProgress" && (
                      <button
                        onClick={() =>
                          runAction(
                            () =>
                              teamWorkspaceService.updateRequestStatus(
                                request._id,
                                "Completed"
                              ),
                            "Request marked completed."
                          )
                        }
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Mark completed
                      </button>
                    )}

                    {!incoming &&
                      ["Pending", "Clarification", "Approved"].includes(
                        request.status
                      ) && (
                        <button
                          onClick={() =>
                            runAction(
                              () =>
                                teamWorkspaceService.cancelRequest(request._id),
                              "Request cancelled."
                            )
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Cancel request
                        </button>
                      )}
                  </div>
                </div>

                <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
                  Created{" "}
                  {request.createdAt
                    ? new Date(request.createdAt).toLocaleDateString()
                    : "date unavailable"}
                  {request.deadline || request.dueDate
                    ? ` · Deadline ${new Date(
                        request.deadline || request.dueDate
                      ).toLocaleDateString()}`
                    : ""}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
