import api from "./axiosApi";

export async function fetchDashboardData(){
  try{
    const results = await api.get('/dashboard/summary');

    return results;

  }catch(err){
    return {
      err
    };
  }

}
