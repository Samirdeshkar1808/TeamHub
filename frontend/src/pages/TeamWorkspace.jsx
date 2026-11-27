
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Send , AlertCircle} from "lucide-react";

import teamWorkspaceService from "../services/teamWorkspaceService";
import TeamTasksPanel from "../components/Teams/TeamTasksPanel";
import TeamRequestsPanel from "../components/Teams/TeamRequestsPanel";
import Sidebar from "../components/Sidebar";

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
  const [canManage , setCanManage] = useState(false);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await teamWorkspaceService.getTeam(teamId);
      setTeamData(result);
      setCanManage(result.canManage);

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

  const permissionError = !canManage ? "Workspace can be accessed by Team Head and Admin/Owner only." : null;

  const displayError = error || permissionError;

  if (displayError || !teamData?.team) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8">
          <AlertCircle size={28} className="text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-gray-700">{displayError}</p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={loadTeam}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Try again
            </button>

            <button
              onClick={() => navigate("/teams")}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Back to teams
            </button>
          </div>
        </div>
      </div>
    );
  }

  const team = teamData.team;
  const members = teamData.members || [];

  return (
   <div className="min-h-screen bg-slate-50 text-slate-900">
    <Sidebar/>
    
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:pl-70">
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
   </div>
  );
}
