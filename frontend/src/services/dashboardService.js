import api from "./axiosApi";

export async function fetchDashboardData(){
  try{
    const response = await api.get('/dashboard/summary');

    return {data: response.data, err: null };

  }catch(err){
    return { 
      data: null, 
      err: err.response?.data || err.message || "Failed to fetch dashboard data" 
    };
  }

}
