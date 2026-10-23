
import { Building2, Search } from "lucide-react";
import OrganizationCard from "./OrganizationCard";

function OrganizationList({organizations, search, setSearch, onSelect}){

   const filteredOrganizations = organizations.filter((organization) =>{
    const query = search.toLowerCase();

    return (
      organization.name?.toLowerCase().includes(query) ||
      organization.description?.toLowerCase().includes(query) ||
      organization.role?.toLowerCase().includes(query)
    );
  });

  return (
    <section>
      <div className="relative mb-6 max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search organizations..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {filteredOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrganizations.map((organization) => (
            <OrganizationCard
              key={organization.id || organization._id}
              organization={organization}
              onClick={() => onSelect(organization)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <Building2 className="mx-auto text-gray-400" size={36} />

          <h3 className="mt-4 font-semibold text-gray-900">
            No organizations found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {search
              ? "Try another search term."
              : "Create an organization to get started."}
          </p>
        </div>
      )}
    </section>
  );
}

export default OrganizationList;
