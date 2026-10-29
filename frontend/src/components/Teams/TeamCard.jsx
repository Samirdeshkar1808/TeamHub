import { Users, ChevronRight, Crown } from "lucide-react";
function TeamCard({ team, onClick }) {
  const headName = team.head?.name || "Not specified";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Users size={23} />
        </div>

        <ChevronRight
          size={20}
          className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
        />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {team.name}
      </h3>

      <p className="mt-2 min-h-10 line-clamp-2 text-sm leading-5 text-gray-500">
        {team.description || "No team description added."}
      </p>

      <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
        <Crown size={15} className="text-amber-500" />
        <span>Head: {headName}</span>
      </div>

    </button>

  );
}

export default TeamCard;
