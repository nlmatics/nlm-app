import { useMutation, useQuery, useQueryClient } from 'react-query';
import { fetchFieldsMetaData } from '../fetcher';
import { deleteField, renameField } from '../mutator';

const getQueryKey = fieldBundleId => ['fields', fieldBundleId];

const useFields = fieldBundleId => {
  const { data, error, isLoading, isError, isIdle } = useQuery(
    getQueryKey(fieldBundleId),
    () => fetchFieldsMetaData({ fieldBundleId }),
    {
      enabled: !!fieldBundleId,
    }
  );

  if (isError) {
    throw error;
  }

  return {
    data,
    isLoading: isLoading || isIdle,
  };
};

const useDeleteField = fieldBundleId => {
  const queryClient = useQueryClient();

  return useMutation(fieldId => deleteField(fieldId), {
    onSuccess: () => {
      queryClient.invalidateQueries(getQueryKey(fieldBundleId));
    },
  });
};

const useRenameField = fieldBundleId => {
  const queryClient = useQueryClient();

  return useMutation(({ fieldId, name }) => renameField({ fieldId, name }), {
    onSuccess: () => {
      queryClient.invalidateQueries(getQueryKey(fieldBundleId));
    },
  });
};

const useRefetchFields = () => {
  const queryClient = useQueryClient();
  return fieldBundleId =>
    queryClient.invalidateQueries(getQueryKey(fieldBundleId));
};

export default function useFieldManager() {
  return {
    useFields,
    useDeleteField,
    useRenameField,
    useRefetchFields,
  };
}
