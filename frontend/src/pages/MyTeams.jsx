import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, LoaderCircle, Plus, RefreshCw, Search, UsersRound } from "lucide-react";

import teamService from "../services/teamService";
import TeamCard from "../components/Teams/TeamCard";
import CreateTeamModal from "../components/Teams/CreateTeamModal";
import Sidebar from "../components/Sidebar";

function Teams() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [onlyMyTeams , setOnlyMyTeams] = useState(false);

  const loadOrganizations = useCallback(async () => {
    const data = await teamService.getOrganizations();

    setOrganizations(data);

    setSelectedOrgId((current) => {
      if(current && data.some((org) => String(org.id || org._id) === current)) {
        return current;
      }

      return data.length ? String(data[0].id || data[0]._id) : "";
    });

    return data;
  }, []);

  const loadTeams = useCallback(async (organizationId, isRefresh = false) => {
    if(!organizationId) {
      setTeams([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if(isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try{
      const data = onlyMyTeams ? await teamService.getMyTeams(organizationId) : await teamService.getTeams(organizationId);
      setTeams(data);
    } catch (err) {
      setTeams([]);
      setError(
        err.response?.data?.message ||
          "Could not load teams for this organization."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onlyMyTeams]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      setLoading(true);
      setError("");

      try {
        const data = await teamService.getOrganizations();

        if (!active) return;

        setOrganizations(data);
        setSelectedOrgId((current) => {
          if (current && data.some((org) => String(org.id || org._id) === current)) {
            return current;
          }

          return data.length ? String(data[0].id || data[0]._id) : "";
        });
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Could not load your organizations."
          );
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    loadTeams(selectedOrgId);
  }, [selectedOrgId, loadTeams]);

  async function handleCreateTeam(data) {
    if (!selectedOrgId) {
      throw new Error("Select an organization first.");
    }

    setSubmitting(true);

    try {
      await teamService.createTeam(selectedOrgId, data);
      setShowCreate(false);
      await loadTeams(selectedOrgId, true);
    } catch (err) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  const filteredTeams = teams.filter((team) => {
    const query = search.toLowerCase();

    return (
      team.name?.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query) ||
      team.head?.name?.toLowerCase().includes(query)
    );
  });

  const selectedOrganization = organizations.find(
    (org) => String(org.id || org._id) === selectedOrgId
  );

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar/>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:pl-70">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <UsersRound size={16} />
              Workspace / Teams
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              Teams
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage team workspaces and their members.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadTeams(selectedOrgId, true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              disabled={!selectedOrgId}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={18} />
              Create team
            </button>
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
          <label htmlFor="organization-select" className="mb-2 block text-sm font-medium text-gray-700">
            Select organization
          </label>

          <select
            id="organization-select"
            value={selectedOrgId}
            onChange={(event) => setSelectedOrgId(event.target.value)}
            className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            {organizations.length === 0 && (
              <option value="">No organizations available</option>
            )}

            {organizations.map((org) => (
              <option key={org.id || org._id} value={org.id || org._id}>
                {org.name}
              </option>
            ))}
          </select>
          <div className="inline-flex items-center gap-1 rounded-2xl border border-gray-200 bg-white mx-2 p-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3">
              Show : 
            </span>
            <button
              type="button"
              onClick={() => setOnlyMyTeams(true)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                onlyMyTeams ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-900"
                }`}
              >
              My Teams
              </button>
              <button
                type="button"
                onClick={() => setOnlyMyTeams(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  !onlyMyTeams 
                    ? "bg-gray-100 text-gray-900 shadow-sm" 
                    : "text-gray-900 hover:text-gray-900"
                }`}
              >
                All Teams
            </button>
          </div>

          {selectedOrganization && (
            <p className="mt-3 text-sm text-gray-500">
              Showing {onlyMyTeams ? "Your" : "All"} teams in {" "}
              <span className="font-medium text-gray-800">
                {selectedOrganization.name}
              </span>
            </p>
          )}
        </section>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => loadOrganizations().then((data) => {
                  const id = selectedOrgId || String(data[0]?.id || data[0]?._id || "");
                  return loadTeams(id);
                }).catch(() => {})}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && teams.length > 0 && (
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              {teams.length} {teams.length === 1 ? "team" : "teams"}
            </p>

            <div className="relative w-full sm:max-w-xs">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search teams..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-500">
            <LoaderCircle size={28} className="animate-spin text-indigo-600" />
            <p className="text-sm">Loading teams...</p>
          </div>
        ) : !error && filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team._id || team.id}
                team={team}
                onClick={() => navigate(`/teams/${team._id || team.id}`)}
              />
            ))}
          </div>
        ) : !error ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <UsersRound size={36} className="mx-auto text-gray-400" />
            <h2 className="mt-4 font-semibold text-gray-900">
              {search ? "No matching teams" : "No teams yet"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try a different search term."
                : "Create a team in this organization to get started."}
            </p>
          </div>
        ) : null}
      </main>

      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateTeam}
          submitting={submitting}
        />
      )}
    </div>
  );
}

export default Teams;
