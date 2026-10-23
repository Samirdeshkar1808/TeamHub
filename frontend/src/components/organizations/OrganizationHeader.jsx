
import { Building2, Plus, RefreshCw } from "lucide-react";

function OrganizationHeader({ onCreate, onRefresh, refreshing }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 size={16} />
          <span>Workspace</span>
          <span>/</span>
          <span className="text-gray-900">Organizations</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Organizations
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Manage your organizations and explore their teams.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Create organization
        </button>
      </div>
    </div>
  );
}

export default OrganizationHeader;
