import API from '../utils/API.js';

export async function fetchUserInfo(userId) {
  const response = await API.get(`/user/${userId}`, {});
  return response.data;
}
export const fetchTrainingSamples = async (statuses = []) => {
  const response = await API.get(`/trainingSamples`, {
    params: {
      ...(statuses?.length ? { status: statuses.join(',') } : {}),
    },
  });
  return response.data;
};

export const fetchTrainingSampleStatuses = async () => {
  const response = await API.get(`/trainingSamples/status`);
  return response.data;
};

export const fetchExtractionViews = async workspaceId => {
  const response = await API.get(`/workspaceFilter`, {
    params: {
      workspaceId,
    },
  });
  return response.data;
};

export const fetchViews = async workspaceId => {
  const response = await API.get(`/workspaceFilter`, {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    params: {
      workspaceId,
    },
  });
  return response.data;
};
