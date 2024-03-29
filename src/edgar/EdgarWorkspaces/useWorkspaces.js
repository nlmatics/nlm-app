import { useQuery } from 'react-query';
import API from '../../utils/API.js';

export async function fetchWorkspacesByUserId(userId) {
  let response = await API.get(`/workspace/user/${userId}`, {});
  return response.data;
}

export default function useWorkspaces(userId) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    ['workspaces', userId],
    () => fetchWorkspacesByUserId(userId),
    {
      enabled: !!userId,
    }
  );

  if (isError) {
    throw error;
  }

  return {
    data,
    isLoading: isLoading || isIdle,
  };
}
