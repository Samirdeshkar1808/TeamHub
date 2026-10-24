import api from "./axiosApi";

const organizationService = {
  async getOrganizations() {
    const response = await api.get("/organizations");
    return response.data.organizations ?? [];
  },

  async createOrganization(data) {
    const response = await api.post("/organizations", data);
    return response.data;
  },

  async getOrganizationInfoById(organizationId) {
    const response = await api.get(`dashboard/organization/${organizationId}`
    );

    return response.data;
  },

  async getTeams(organizationId) {
    const response = await api.get(`/organizations/${organizationId}/teams`);
    return(
      response.data.teams ??
      response.data.data ??
      response.data.results ??
      []
    );
  },
};

export default organizationService;
