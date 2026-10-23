import { Building2, ChevronRight, LoaderCircle, Users } from "lucide-react";
import { getId, getName } from "../../utils/dashboardHelpers";

export default function TeamOrganizationPanel({teams,organizations,tab,setTab,navigate,loading}) {
  const items = tab === "teams" ? teams : organizations;

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">

      <div className="flex items-center gap-3 px-5 pb-2 pt-5 sm:px-6">
        <Users size={21} className="text-slate-700" />
        <h2 className="text-base font-semibold text-slate-900">
          My Teams & Organizations
        </h2>
      </div>

      <div className="flex border-b border-slate-100 px-5 sm:px-6">
        {[ {id:"teams",label: "My Teams",count: teams.length },
           {id: "organizations",label: "My Organizations",count: organizations.length},
        ].map((item)=>(
          <button 
            type="button"
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`border-b-2 px-3 py-3 text-sm font-medium transition ${
              tab === item.id
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      <div className="px-4 pb-3 sm:px-5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading workspace...
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-500">
              {tab === "teams" ? <Users size={21} /> : <Building2 size={21} />}
            </div>

            <p className="mt-3 text-sm font-medium text-slate-800">
              No {tab === "teams" ? "teams" : "organizations"} yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              They will appear here once you join or create one.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const id = getId(item);
            const name = getName(item);

            const role =
              item.role ||
              item.membership?.role ||
              item.myRole ||
              item.userRole ||
              "";
            
            return (
              <button
                type="button"
                key={id || name}
                onClick={() =>
                  navigate(
                    tab === "teams"
                      ? `/teams/${id}`
                      : `/organizations/${id}`
                  )
                }
                className="group flex w-full items-center gap-4 border-b border-slate-100 px-2 py-5 text-left last:border-b-0 hover:bg-slate-50/70"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    tab === "teams"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {name.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-900">
                      {name}
                    </span>

                    {role && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                        {role}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.description ? `${item.description}`: ""}
                  </p>
                </div>

                <ChevronRight
                  size={19}
                  className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                />
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
