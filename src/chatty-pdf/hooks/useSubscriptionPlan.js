import { useQuery, useQueryClient } from 'react-query';
import { fetchSubscriptionPlans } from '../../edgar/hooks/fetcher';

const getQueryKey = () => ['chatty-pdf-subscription-plan'];

export default function useSubscriptionPlan() {
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
    getSubscriptionPlan: () => {
      return data?.find(
        ({ price_options }) =>
          price_options[0].subscriptions.id === 'PREMIUM_TIER'
      );
    },
    useRefetchSubscriptionPlans,
  };
}
