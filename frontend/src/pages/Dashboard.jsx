import {useState } from "react";
import {useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SummaryCards from "../components/dashboard/SummaryCards";
import TeamOrganizationPanel from "../components/dashboard/TeamOrganizationPanel";
import QuickActions from "../components/dashboard/QuickActions";

import useDashboard from "../hooks/useDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [tab, setTab] = useState("teams");

  const {loading,error,summary,teams,organizations,user} = useDashboard();
  
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "there";
  
  return(
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Sidebar 
       mobileOpen={mobileOpen} 
       setMobileOpen={setMobileOpen}
      />

      <div className="min-h-screen lg:pl-64">
        <DashboardHeader
          user={user}
          navigate={navigate}
          onOpenMenu={() => setMobileOpen(true)}
        />

        <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-7 sm:px-7 lg:px-8 lg:py-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">
                Good morning, {firstName}
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Here's what Assigned to your workspace today.
              </p>
            </div>

            <p className="pb-1 text-sm text-slate-500">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {error}
            </div>
          )}

          <SummaryCards
            summary={summary}
            navigate={navigate}
          />

            <TeamOrganizationPanel
              teams={teams}
              organizations={organizations}
              tab={tab}
              setTab={setTab}
              navigate={navigate}
              loading={loading}
            />
      

          <QuickActions navigate={navigate} />
        </main>
      </div>
    </div>
  );
}
