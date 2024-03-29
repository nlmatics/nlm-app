import { useQuery } from 'react-query';
import { fetchTrainingSamples } from './fetcher';

const getQueryKey = statuses => ['training-samples', statuses];

export default function useTrainingSamples(statuses) {
  const { data, error, isLoading, isError } = useQuery(
    getQueryKey(statuses),
    () => fetchTrainingSamples(statuses)
  );

  if (isError) {
    throw error;
  }

  return {
    data,
    isLoading: isLoading,
  };
}
