import { useQuery } from 'react-query';
import { fetchTrainingSampleStatuses } from './fetcher';

const getQueryKey = () => ['training-sample-statuses'];

export default function useTrainingSampleStatuses() {
  const { data, error, isLoading, isError } = useQuery(getQueryKey(), () =>
    fetchTrainingSampleStatuses()
  );

  if (isError) {
    throw error;
  }

  return {
    data,
    isLoading: isLoading,
  };
}
