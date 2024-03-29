import { useQuery, useQueryClient } from 'react-query';
import { fetchSubscriptionPlans } from './fetcher';

const getQueryKey = () => ['subscription-plans'];

export default function useSubscriptionPlans() {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(),
    () => fetchSubscriptionPlans()
  );

  if (isError) {
    throw error;
  }

  const useRefetchSubscriptionPlans = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries(getQueryKey());
  };
  return {
    data,
    isLoading: isLoading || isIdle,
    getSubscriptionPlanById: workspaceId => {
      return data?.find(
        ({ price_options }) => price_options[0]?.workspace?.id === workspaceId
      );
    },
    useRefetchSubscriptionPlans,
  };
}
