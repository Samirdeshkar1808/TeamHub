
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Send } from "lucide-react";

import teamWorkspaceService from "../services/teamworkspaceService";
import TeamTasksPanel from "../components/Teams/TeamTasksPanel";
import TeamRequestsPanel from "../components/Teams/TeamRequestsPanel";

const tabs = [
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "requests", label: "Requests", icon: Send },
];

export default function TeamWorkspace() {
  const { teamId } = useParams();

  const [teamData, setTeamData] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await teamWorkspaceService.getTeam(teamId);
      setTeamData(result);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load this team workspace."
      );
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading team workspace...
      </div>
    );
  }

  if (error || !teamData?.team) {
    return (
      <div className="space-y-4 p-6">
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to teams
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Team not found."}
        </div>

        <button
          onClick={loadTeam}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Try again
        </button>
      </div>
    );
  }

  const team = teamData.team;
  const members = teamData.members || [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <Link
        to={`/teams/${teamId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to team details
      </Link>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">Team workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
            {team.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            {team.description || "Manage your team's work and coordination."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
          <ClipboardList size={16} />
          {members.length} {members.length === 1 ? "member" : "members"}
        </div>
      </header>

      <div className="border-b border-gray-200">
        <nav className="flex gap-5 overflow-x-auto" aria-label="Team workspace">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition ${
                activeTab === id
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "tasks" && (
        <TeamTasksPanel teamId={teamId} members={members} />
      )}

      {activeTab === "requests" && (
        <TeamRequestsPanel teamId={teamId} teamData={teamData} />
      )}
    </div>
  );
}
