import api from "./axiosApi";

export async function fetchDashboardData(){
  const results = await Promise.allSettled([
    api.get("/dashboard/summary"),
    api.get("/teams"),
    api.get("/organizations"),
    api.get("/me"),
  ]);

  // Extracting data
  return results.map((result) => {
    if(result.status === "fulfilled") {
      return {status:"fulfilled", value: result.value.data};
    }
    
    const err = result.reason;
    const path = err.config?.url || "resource";
    
    let message = `Unable to load ${path}.`;
    if (!err.response && err.request) {
      message = `Cannot connect to the server for ${path}.`;
    }

    return {
      status: "rejected",
      reason: new Error(message),
    };
  });
}
