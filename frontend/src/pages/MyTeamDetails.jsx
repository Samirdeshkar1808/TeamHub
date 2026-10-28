
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {ArrowLeft,AlertCircle,Crown,LoaderCircle,MailPlus,RefreshCw,ShieldCheck,Trash2,Users, BriefcaseBusiness } from "lucide-react";
import teamService from "../services/teamService";
import Sidebar from "../components/Sidebar";

function TeamDetails() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [newHeadUserId, setNewHeadUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await teamService.getTeamDetails(teamId);

      setTeam(data.team);
      setMembers(Array.isArray(data.members) ? data.members : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load this team. Check your access and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  async function handleAddMember(event) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) return;

    setWorking(true);
    setError("");
    setNotice("");

    try {
      await teamService.addMember(teamId, trimmedEmail);
      setEmail("");
      setNotice("Member added successfully.");
      await loadTeam();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add this member. Check the email and your permissions."
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleRemoveMember(member) {
    const user = member.user;
    const userId = user?._id || user?.id;

    if (!userId) {
      setError("Could not determine this member's user ID.");
      return;
    }

    if (member.role === "Head") {
      setError("Transfer the Team Head role before removing the current Head.");
      return;
    }

    const confirmed = window.confirm(
      `Remove ${user.name || user.email || "this member"} from the team?`
    );

    if (!confirmed) return;

    setWorking(true);
    setError("");
    setNotice("");

    try {
      await teamService.removeMember(teamId, userId);
      setNotice("Member removed successfully.");
      await loadTeam();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to remove this member. Check your permissions."
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleChangeHead(event) {
    event.preventDefault();

    if (!newHeadUserId) {
      setError("Select a team member first.");
      return;
    }
    
    const selectedMember = members.find(
      (member) =>
        String(member.user?._id || member.user?.id) === newHeadUserId
    );

    const confirmed = window.confirm(
      `Transfer Team Head to ${selectedMember?.user?.name || "the selected member"}?`
    );

    if (!confirmed) return;

    setWorking(true);
    setError("");
    setNotice("");

    try {
      await teamService.changeHead(teamId, newHeadUserId);
      setNewHeadUserId("");
      setNotice("Team Head updated successfully.");
      await loadTeam();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to transfer Team Head. Check your permissions."
      );
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-gray-50 text-gray-500">
        <LoaderCircle size={26} className="animate-spin text-indigo-600" />
        Loading team...
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8">
          <AlertCircle size={28} className="text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Unable to open team
          </h1>
          <p className="mt-2 text-sm text-gray-500">{error}</p>

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

  const currentHead =
    members.find((member) => member.role === "Head")?.user ||
    team?.head ||
    null;

  const eligibleMembers = members.filter((member) => {
    const userId = member.user?._id || member.user?.id;

    return userId && member.role !== "Head";
  });

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar/>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:pl-70">
        <Link
          to="/teams"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          All teams
        </Link>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Users size={27} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {team?.name || "Team"}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                  {team?.description || "No team description added."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <Crown size={16} className="text-amber-500" />
                  <span>
                    Team Head:{" "}
                    <span className="font-medium text-gray-900">
                      {currentHead?.name || currentHead?.email || "Not available"}
                    </span>
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <Link to={`/teams/${team._id}/workspace`}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                  >
                   <BriefcaseBusiness size={17} />
                   Open workspace
                  </Link>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={loadTeam}
              disabled={working}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {notice && (
          <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Team members
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {members.length} {members.length === 1 ? "member" : "members"} in this team.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {members.length > 0 ? (
              members.map((member, index) => {
                const user = member.user || {};
                const userId = user._id || user.id;
                const isHead = member.role === "Head";

                return (
                  <div
                    key={userId || member._id || index}
                    className="flex flex-col gap-4 border-b border-gray-100 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                        {(user.name || user.email || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {user.name || "Team member"}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {user.email || ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        isHead
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {isHead ? <Crown size={13} /> : <ShieldCheck size={13} />}
                        {member.role || "Member"}
                      </span>

                      {!isHead && (
                        <button
                          type="button"
                          disabled={working || !userId}
                          onClick={() => handleRemoveMember(member)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                No members found.
              </div>
            )}
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <MailPlus size={21} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Add a member</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add an existing organization user using their registered email.
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Note: Add user to organization before adding to Team.Use organization panel.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddMember} className="mt-5 space-y-3">
              <label htmlFor="member-email" className="block text-sm font-medium text-gray-700">
                Member email
              </label>
              <input
                id="member-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="member@example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="submit"
                disabled={working}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {working ? "Please wait..." : "Add member"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Crown size={21} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Transfer Team Head</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Assign leadership to another existing team member.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangeHead} className="mt-5 space-y-3">
              <label htmlFor="new-team-head" className="block text-sm font-medium text-gray-700">
                New Team Head
              </label>

              <select
                id="new-team-head"
                value={newHeadUserId}
                onChange={(event) => setNewHeadUserId(event.target.value)}
                disabled={eligibleMembers.length === 0 || working}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
              >
                <option value="">Select a member</option>
                {eligibleMembers.map((member) => {
                  const user = member.user;
                  const userId = user._id || user.id;

                  return (
                    <option key={userId} value={userId}>
                      {user.name || user.email || userId}
                    </option>
                  );
                })}
              </select>

              <button
                type="submit"
                disabled={working || !newHeadUserId}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Transfer leadership
              </button>

              {eligibleMembers.length === 0 && (
                <p className="text-xs leading-5 text-gray-500">
                  Add another member before transferring leadership.
                </p>
              )}
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default TeamDetails;
