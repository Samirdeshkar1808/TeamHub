export default function OrganizationSelector({
  organizations,
  selectedOrganizationId,
  onOrganizationChange,
}) {
  const selectedOrganization = organizations.find(
    (organization) => organization.id === selectedOrganizationId
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <label
        htmlFor="organization-select"
        className="mb-2 block text-base font-semibold text-slate-800"
      >
        Select organization
      </label>

      <select
        id="organization-select"
        value={selectedOrganizationId}
        onChange={(event) =>
          onOrganizationChange(event.target.value)
        }
        disabled={organizations.length === 0}
        className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-5 py-4 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
      >
        {organizations.length === 0 && (
          <option value="">No organizations available</option>
        )}

        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>

      {selectedOrganization && (
        <p className="mt-4 text-sm text-slate-500 sm:text-base">
          Showing teams for{" "}
          <span className="font-semibold text-slate-800">
            {selectedOrganization.name}
          </span>
        </p>
      )}
    </section>
  );
}