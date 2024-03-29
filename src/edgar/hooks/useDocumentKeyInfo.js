import { useQuery } from 'react-query';
import { fetchDocumentKeyInfo } from './fetcher';

const getQueryKey = documentId => ['document-key-info', documentId];

export default function useDocumentKeyInfo(documentId) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(documentId),
    () => fetchDocumentKeyInfo(documentId),
    {
      enabled: !!documentId,
    }
  );

  if (isError) {
    throw error;
  }

  return {
    data,
    getDocumentData: () => {
      return {
        docSectionSummary: data?.sectionSummary || [],
        docMetadata: data?.metadata || {},
        docKeyValuePairs: data?.keyValuePairs,
        docEnt: data?.docEnt,
        referenceDefinitions: data?.referenceDefinitions,
      };
    },
    isLoading: isLoading || isIdle,
  };
}
