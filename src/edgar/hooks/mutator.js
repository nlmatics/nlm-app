import API from '../../utils/API.js';

export const subscribeToWorkspace = async workspaceId => {
  let res = await API.post(`workspace/subscribe/${workspaceId}`);
  return res.data;
};

export const joinWaitList = async repoName => {
  return await API.post('/waitList', {
    appName: 'nlmatics SEC',
    waitListType: repoName,
  });
};
