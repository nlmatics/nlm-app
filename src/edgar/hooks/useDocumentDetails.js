import { useQuery } from 'react-query';
import { fetchDocumentDetails } from './fetcher';

const getQueryKey = documentId => ['document-details', documentId];

export default function useDocumentDetails(documentId) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(documentId),
    () => fetchDocumentDetails(documentId),
    {
      enabled: !!documentId,
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
