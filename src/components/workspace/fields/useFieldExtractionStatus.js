import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchFieldsMetaData } from '../fetcher';

const FIELD_EXTRACTION_STATUS = {
  IN_PROGRESS: 'extracting',
  COMPLETED: 'done',
};

export default function useFieldExtractionStatus({ fieldBundleId, fieldId }) {
  const [fieldMetaData, setFieldMetaData] = useState([]);

  const intervalRef = useRef();

  useEffect(() => {
    const isExtractionDone =
      fieldMetaData?.status?.progress === FIELD_EXTRACTION_STATUS.COMPLETED;

    if (intervalRef.current && isExtractionDone) {
      console.debug(
        'Stop fetching fieldExtractionStatus:',
        fieldBundleId,
        fieldMetaData
      );
      clearInterval(intervalRef.current);
    }
  }, [fieldBundleId, fieldMetaData]);

  useEffect(() => {
    let stopPolling = () => {};
    async function getFieldMetaData({ fieldBundleId, fieldId }) {
      const [fieldMetaData] = await fetchFieldsMetaData({
        fieldBundleId,
        fieldIds: [fieldId],
        returnOnlyStatus: true,
      });
      console.debug(
        'Fetched fieldExtractionStatus:',
        fieldBundleId,
        fieldMetaData
      );
      setFieldMetaData(fieldMetaData);
    }

    const isExtractionInProgress =
      fieldMetaData?.status?.progress === FIELD_EXTRACTION_STATUS.IN_PROGRESS;

    if (fieldBundleId && fieldId && isExtractionInProgress) {
      console.debug('Start polling fieldExtractionStatus...', fieldBundleId);
      intervalRef.current = setInterval(() => {
        getFieldMetaData({ fieldBundleId, fieldId });
      }, 6000);

      stopPolling = () => {
        console.debug(
          'Stop fetching fieldExtractionStatus:',
          fieldBundleId,
          fieldMetaData
        );
        clearInterval(intervalRef.current);
      };
    }

    return stopPolling;
  }, [fieldBundleId, fieldMetaData, fieldId]);

  useEffect(() => {
    async function getFieldsExtractionStatus({ fieldBundleId, fieldId }) {
      const [fieldMetaData] = await fetchFieldsMetaData({
        fieldBundleId,
        fieldIds: [fieldId],
        returnOnlyStatus: true,
      });
      console.debug(
        'Fetched fieldExtractionStatus:',
        fieldBundleId,
        fieldMetaData
      );
      setFieldMetaData(fieldMetaData);
    }

    fieldBundleId &&
      fieldId &&
      getFieldsExtractionStatus({ fieldBundleId, fieldId });
  }, [fieldBundleId, fieldId]);

  return {
    fieldExtractionStatus: fieldMetaData,
    updateFieldsExtractionStatus: useCallback(() => {
      async function getFieldMetaData({ fieldBundleId, fieldId }) {
        const [fieldMetaData] = await fetchFieldsMetaData({
          fieldBundleId,
          fieldIds: [fieldId],
          returnOnlyStatus: true,
        });
        console.debug(
          'Fetched fieldExtractionStatus:',
          fieldBundleId,
          fieldMetaData
        );
        setFieldMetaData(fieldMetaData);
      }
      fieldBundleId && fieldId && getFieldMetaData({ fieldBundleId, fieldId });
    }, [fieldBundleId, fieldId]),
    isExtractionInProgress: () =>
      fieldMetaData?.status?.progress === FIELD_EXTRACTION_STATUS.IN_PROGRESS,
    isExtractionCompleted: () =>
      fieldMetaData?.status?.progress === FIELD_EXTRACTION_STATUS.COMPLETED,
  };
}
