import api from "./axiosApi";

const teamService = {
  async getOrganizations() {
    const response = await api.get("/organizations");
    return response.data.organizations ?? [];
  },

  async getTeams(organizationId) {
    const response = await api.get(
      `/organizations/${organizationId}/teams`
    );

    return response.data.teams ?? [];
  },

  async getMyTeams(organizationId){
    const response = await api.post('/teams' , {organizationId});

    return response.data.teams ?? [];
  },

  async createTeam(organizationId, data) {
    const response = await api.post(
      `/organizations/${organizationId}/teams`,
      data
    );

    return response.data.team;
  },

  async getTeamDetails(teamId) {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  async addMember(teamId, email) {
    const response = await api.post(`/teams/${teamId}/members`, {
      email,
    });

    return response.data;
  },

  async removeMember(teamId, userId) {
    const response = await api.delete(
      `/teams/${teamId}/members/${userId}`
    );

    return response.data;
  },

  async changeHead(teamId, newHeadUserId) {
    const response = await api.post(`/teams/${teamId}/head`, {
      newHeadUserId,
    });

    return response.data;
  },
};

export default teamService;
