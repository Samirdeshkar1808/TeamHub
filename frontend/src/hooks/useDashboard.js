import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardData } from "../services/dashboardService";
import { getList } from "../utils/dashboardHelpers";

export default function useDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({});
  const [teams, setTeams] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const token = localStorage.getItem("token");

      if(!token) {
        navigate("/login", {replace: true});
        return;
      }

      setLoading(true);
      setError("");

      try{
        const results = await fetchDashboardData(token);
        if(cancelled) return;

        const expired = results.some(
          (result) =>
            result.status === "rejected" &&
            [401, 403].includes(result.reason?.status)
        );

        if(expired){
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", {replace: true});
          return;
        }

        const [summaryResult,teamsResult, orgsResult, userResult] = results;

        if(summaryResult.status === "fulfilled") {
          setSummary(summaryResult.value?.summary);
        }else {
          setError("Some dashboard information could not be loaded.");
        }
        
        if(teamsResult.status === "fulfilled") {
          setTeams( getList(teamsResult.value, ["teams", "data", "items"]));
        } 
      
        if(orgsResult.status === "fulfilled") {
          setOrganizations(
            getList(orgsResult.value, ["organizations","data","items"])
          );
        }
        if(userResult.status === "fulfilled") {
          const result = userResult.value;
          setUser(result?.user);
        }
      }catch{
        if(!cancelled) {
          setError("Unable to load dashboard information.");
        }
      }finally{
        if(!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    
    return () =>{
      cancelled = true;
    };
  },[navigate]);

  return { 
    loading, error, summary, teams, organizations,user
  };
}
