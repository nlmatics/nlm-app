import { useQuery, useQueryClient } from 'react-query';
import { useAuth } from '../utils/use-auth';
import { fetchUserInfo } from './fetcher';

const getQueryKey = userId => ['user-info', userId];

export default function useUserInfo() {
  const { user } = useAuth();
  let userId;
  let tokens = user.displayName.split('#');
  if (tokens.length > 1) {
    userId = tokens[1];
  }
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(userId),
    () => fetchUserInfo(userId),
    {
      enabled: !!userId,
    }
  );

  if (isError) {
    throw error;
  }

  const useRefetchUserInfo = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries(getQueryKey(userId));
  };

  return {
    data,
    isLoading: isLoading || isIdle,
    isFeatureIncluded: feature => {
      return (
        data &&
        data.includedFeatures &&
        data.includedFeatures.indexOf(feature) != -1
      );
    },
    FEATURES: {
      EXTRACTION: 'extraction',
      VISUALIZATION: 'visualization',
      RELATION_EXTRACTION: 'relationExtraction',
    },
    getSubscriptionById: workspaceId => {
      return data?.stripeConf?.subscriptions?.find(
        ({ stripe_resource_id }) => stripe_resource_id === workspaceId
      );
    },
    useRefetchUserInfo,
    isRestrictedWorkspace: workspaceId =>
      data?.restrictedWorkspaces
        ? data?.restrictedWorkspaces.includes(workspaceId)
        : true,
  };
}
