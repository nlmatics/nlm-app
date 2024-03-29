import { useQuery } from 'react-query';
import { fetchFieldBundleExtractionDataForDoc } from '../../fetcher';

const getQueryKey = queryData => [
  'field-bundle-extraction-data-for-doc',
  ...queryData,
];
export default function useFieldBundleExtractionDataForDoc({
  fieldBundleId,
  documentId,
}) {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey([fieldBundleId, documentId]),
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
    isLoading: isLoading || isIdle,
  };
}
