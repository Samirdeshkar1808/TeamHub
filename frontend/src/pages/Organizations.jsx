import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Building2, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import organizationService from "../services/organizationService";
import OrganizationHeader from "../components/organizations/OrganizationHeader";
import OrganizationList from "../components/organizations/OrganizationList";
import OrganizationForm from "../components/organizations/OrganizationForm";
import Sidebar from "../components/Sidebar";

function Organizations() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadOrganizations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await organizationService.getOrganizations();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load organizations. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  async function handleCreateOrganization(data) {
    setSubmitting(true);

    try {
      await organizationService.createOrganization(data);
      setShowCreateForm(false);
      setSearch("");
      await loadOrganizations(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelectOrganization(organization) {
    const organizationId = organization.id || organization._id;

    if (!organizationId) {
      setError("This organization does not have a valid ID.");
      return;
    }

    navigate(`/organizations/${organizationId}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar/>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:pl-70">
        <OrganizationHeader
          onCreate={() => setShowCreateForm(true)}
          onRefresh={() => loadOrganizations(true)}
          refreshing={refreshing}
        />

        {!loading && !error && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Building2 size={21} />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Your organizations
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {organizations.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Organization roles</p>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {organizations.filter((org) => org.role === "Owner").length}{" "}
                Owner ·{" "}
                {organizations.filter((org) => org.role === "Admin").length}{" "}
                Admin ·{" "}
                {organizations.filter((org) => org.role === "Member").length}{" "}
                Member
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => loadOrganizations()}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-500">
            <LoaderCircle size={30} className="animate-spin text-indigo-600" />
            <p className="text-sm">Loading your organizations...</p>
          </div>
        ) : (
          <OrganizationList
            organizations={organizations}
            search={search}
            setSearch={setSearch}
            onSelect={handleSelectOrganization}
          />
        )}

        {showCreateForm && (
          <OrganizationForm
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleCreateOrganization}
            submitting={submitting}
          />
        )}
      </main>
    </div>
  );
}

export default Organizations;
