import { useQuery } from 'react-query';
import { fetchFieldBundleExtractionDataForDoc } from '../../fetcher';

export default function useDocumentFieldsSummary({
  fieldBundleId,
  documentId,
}) {
  const { data, error, isLoading, isError } = useQuery(
    ['nlm-document-fields-summary', fieldBundleId, documentId],
    () =>
      fetchFieldBundleExtractionDataForDoc({
        fieldBundleId,
        documentId,
      }),
    {
      enabled: !!fieldBundleId && !!documentId,
    }
  );

  if (isError) {
    throw error;
  }

  return {
    data,
    isLoading: isLoading,
  };
}
