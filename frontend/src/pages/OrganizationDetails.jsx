
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, CalendarDays, Users, UsersRound, AlertCircle, LoaderCircle, ShieldCheck } from "lucide-react";

import organizationService from "../services/organizationService";

function OrganizationDetails() {
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const [organization, setOrganization] = useState(null);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [org, allTeams] = await Promise.all([
        organizationService.getOrganizationById(organizationId),
        organizationService.getTeams(organizationId).catch(() => []),
      ]);

      console.log(org);
      console.log(allTeams);

      setOrganization(org);

      const organizationTeams = Array.isArray(allTeams)
        ? allTeams.filter((team) => {
            const teamOrgId =
              team.organization_Id?.id ||
              team.organization_Id?._id ||
              team.organization_Id ||
              team.organizationId;

            return String(teamOrgId) === String(organizationId);
          })
        : [];

      setTeams(allTeams);
    }catch(err) {
      setError(
        err.response?.data?.message ||
          "Unable to load this organization. Check your access and try again."
      );
    }finally{
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if(loading){
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-gray-50 text-gray-500">
        <LoaderCircle size={26} className="animate-spin text-indigo-600" />
        Loading organization...
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8">
          <AlertCircle size={30} className="text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Could not open organization
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {error || "Organization not found."}
          </p>
          <button
            onClick={() => navigate("/organizations")}
            className="mt-6 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Back to organizations
          </button>
        </div>
      </div>
    );
  }

  const organizationName = organization.name || "Organization";
  const createdDate = organization.createdAt
    ? new Date(organization.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const role = organization.role || "Member";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/organizations")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          All organizations
        </button>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Building2 size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {organizationName}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                  {organization.description ||
                    "No description available."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                    <ShieldCheck size={14} />
                    {role}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarDays size={14} />
                    Created {createdDate}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={loadDetails}
              className="self-start rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Refresh details
            </button>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Workspace overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Teams and members associated with this organization.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <UsersRound size={21} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teams</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {teams.length}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Teams</h2>
          <p className="mt-1 text-sm text-gray-500">
            Teams belonging to {organizationName}.
          </p>

          {teams.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {teams.map((team) => (
                <div
                  key={team._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gray-100 p-3 text-gray-600">
                      <UsersRound size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {team.name}
                      </h3>
                    </div>
                  </div>

                  {team.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-500">
                      {team.description}
                    </p>
                  )}
                  
                  <div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                      <span className="text-gray-700">Team Head</span> : {team.head?.name} ({team.head?.email})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <UsersRound className="mx-auto text-gray-400" size={32} />
              <h3 className="mt-3 font-medium text-gray-900">
                No teams found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Teams will appear here when they are available in this organization.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default OrganizationDetails;
