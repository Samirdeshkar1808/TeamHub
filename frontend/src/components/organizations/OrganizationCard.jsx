import { Building2, CalendarDays, ChevronRight, ShieldCheck } from "lucide-react";

function OrganizationCard({ organization, onClick }){
    
  const createdDate = organization.createdAt
    ? new Date(organization.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const isAdmin = ["Owner", "Admin"].includes(organization.role);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-gray-200 bg-white p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Building2 size={23} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {organization.name}
            </h3>

            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
              {isAdmin && <ShieldCheck size={13} />}
              {organization.role || "Member"}
            </span>
          </div>
        </div>

        <ChevronRight
          size={20}
          className="mt-1 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
        />
      </div>

      <p className="mt-4 min-h-12 line-clamp-2 text-sm leading-6 text-gray-500">
        {organization.description || "No description added yet."}
      </p>

      <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
        <CalendarDays size={15} />
        <span>Created {createdDate}</span>
      </div>
    </button>
  );
}

export default OrganizationCard;
