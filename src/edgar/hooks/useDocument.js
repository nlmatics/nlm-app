import { useQuery } from 'react-query';
import { fetchDocument } from './fetcher';

const getQueryKey = ({ workspaceId, documentId }) => [
  'document',
  workspaceId,
  documentId,
];

export default function useDocument({ workspaceId, documentId }) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey({ workspaceId, documentId }),
    () => fetchDocument({ workspaceId, documentId }),
    {
      enabled: !!workspaceId && !!documentId,
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
