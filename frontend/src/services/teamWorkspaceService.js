
import api from "./axiosApi";

const teamWorkspaceService = {
  getTeam: async (teamId) => {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  getTeamTasks: async (teamId) => {
    const response = await api.get(`/teams/${teamId}/tasks`);
    return response.data;
  },

  createTask: async (teamId, taskData) => {
    const response = await api.post(
      `/teams/${teamId}/tasks`,
      taskData
    );
    return response.data;
  },

  updateTaskStatus: async (taskId, status) => {
    const response = await api.patch(
      `/tasks/${taskId}/status`,
      { status }
    );
    return response.data;
  },

  getTeamRequests: async (teamId) => {
    const response = await api.get(
      `/teams/${teamId}/requests`,
      { params: { direction: "all" } }
    );
    return response.data;
  },

  createRequest: async (teamId, requestData) => {
    const response = await api.post(
      `/teams/${teamId}/requests`,
      requestData
    );
    return response.data;
  },

  decideRequest: async (requestId, data) => {
    const response = await api.patch(
      `/requests/${requestId}/decision`, data
    );
    return response.data;
  },

  updateRequestStatus: async (requestId, status) => {
    const response = await api.patch(
      `/requests/${requestId}/status`,
      { status }
    );
    return response.data;
  },

  cancelRequest: async (requestId) => {
    const response = await api.patch(
      `/requests/${requestId}/cancel`
    );
    return response.data;
  },

  assignRequestMembers: async (requestId, userId) => {
  const response = await api.patch(
    `/requests/${requestId}/assign`, { assigned_To: userId }
  );

  return response.data;
},
};

export default teamWorkspaceService;
