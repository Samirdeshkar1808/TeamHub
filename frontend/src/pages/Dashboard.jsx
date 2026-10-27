import {useState } from "react";
import {useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SummaryCards from "../components/dashboard/SummaryCards";
import TeamOrganizationPanel from "../components/dashboard/TeamOrganizationPanel";
import QuickActions from "../components/dashboard/QuickActions";

import { useCallback } from "react";
import { fetchDashboardData } from "../services/dashboardService";
import { useEffect } from "react";

export default function Dashboard() {
  const [summary , setSummary] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [tab, setTab] = useState("teams");

  const loadSummary = useCallback(async ()=>{
    setLoading(true);
    setError("");

    try{
      const results = await fetchDashboardData();
      if(results.err) {
        throw new Error(results.err.message || "Failed to fetch dashboard data");
      }
      setSummary(results.data.summary);
    }
    catch(err){
      setError(err.message || "Unable to load dashboard information.");
    }
    finally{
      setLoading(false);
    }
  } , []);

  useEffect(()=>{
   loadSummary()
  },[loadSummary]);
  
  const firstName = summary.user?.name?.trim()?.split(/\s+/)[0] || "there";

  return(
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Sidebar />

      <div className="min-h-screen lg:pl-64">
        <DashboardHeader
          user={summary.user}
          navigate={navigate}
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
              summary={summary}
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
