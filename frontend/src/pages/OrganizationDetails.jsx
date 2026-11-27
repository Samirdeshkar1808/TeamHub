
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, CalendarDays, User, UsersRound, AlertCircle, LoaderCircle, ShieldCheck , ChevronDown , ChevronUp} from "lucide-react";

import organizationService from "../services/organizationService";
import Sidebar from "../components/Sidebar";
import { AddOrganizationMember , RemoveOrganizationMember } from "../components/organizations/OrganizationMember";

function OrganizationDetails() {
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const [organization, setOrganization] = useState(null);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role , setRole] = useState("")

  const [activeTab, setActiveTab] = useState(null);

  const toggleView = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [org, allTeams] = await Promise.all([
        organizationService.getOrganizationInfoById(organizationId),
        organizationService.getTeams(organizationId).catch(() => []),
      ]);

      setOrganization(org.organization);
      setTeams(allTeams);
      setMembers(org.members);
      setRole(org.userMembership.role);
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

  const canManage = role === "Admin" || role === "Owner";

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar/>
      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:pl-70">
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
              <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => toggleView('teams')}
              className="w-full flex items-center justify-between text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>{activeTab === 'teams' ? 'Hide Teams' : 'View All Teams'}</span>
              {activeTab === 'teams' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                 <User size={21} />
                </div>
                <div>
                 <p className="text-sm text-gray-500">Total Members</p>
                 <p className="mt-1 text-2xl font-bold text-gray-900">
                 {members.length}
                 </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => toggleView('members')}
              className="w-full flex items-center justify-between text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>{activeTab === 'members' ? 'Hide Members' : 'View All Members'}</span>
              {activeTab === 'members' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
            </div>

          </div>
        </section>

        {activeTab === 'teams' && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-5 transition-all">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Teams</h3>
          {teams.length === 0 ? (
            <p className="text-sm text-gray-500">No teams found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teams.map((team) => (
                <div key={team._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gray-100 p-3 text-gray-600">
                      <UsersRound size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{team.name}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                  <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Team Head:</span> {team.head.name} ({team.head.email})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 transition-all">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Members Breakdown</h3>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500">No members found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {members.map((member) => (
                <div key={member._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-gray-100 p-3 text-gray-600">
                        <User size={20} />
                      </div>
                      <div>
                       <h4 className="font-semibold text-gray-800 mt-1">{member.user_Id.name}</h4>
                      </div>
                      <div>
                       <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mt-1.5">{member.role}</p>
                      </div>
                    </div>

                    <p className="text-xs px-2 text-gray-600 font-medium  mt-2">Email : {member.user_Id.email}</p>
                
                
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        {canManage && (
          <section className="mt-10 pt-6 border-t border-gray-200">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Member Management</h2>
              <p className="mt-1 text-sm text-gray-500">Add or remove users from this organization.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AddOrganizationMember 
                organizationId={organizationId} 
                onSuccess={loadDetails} 
              />
              <RemoveOrganizationMember 
                organizationId={organizationId} 
                onSuccess={loadDetails} 
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default OrganizationDetails;
