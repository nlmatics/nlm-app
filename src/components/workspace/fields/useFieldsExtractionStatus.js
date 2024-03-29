import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchFieldsInfo } from '../fetcher';

const FIELD_EXTRACTION_STATUS = {
  IN_PROGRESS: 'extracting',
  COMPLETED: 'done',
};

export default function useFieldsExtractionStatus(fieldBundleId) {
  const [fieldsExtractionStatus, setFieldsExtractionStatus] = useState([]);

  const intervalRef = useRef();

  useEffect(() => {
    const isExtractionDoneForAllFields = fieldsExtractionStatus.every(
      ({ status: { progress } }) => {
        return progress === FIELD_EXTRACTION_STATUS.COMPLETED;
      }
    );
    if (intervalRef.current && isExtractionDoneForAllFields) {
      console.debug(
        'Stop fetching fieldsExtractionStatus:',
        fieldBundleId,
        fieldsExtractionStatus
      );
      clearInterval(intervalRef.current);
    }
  }, [fieldBundleId, fieldsExtractionStatus]);

  useEffect(() => {
    let stopPolling = () => {};
    async function getFieldsExtractionStatus(fieldBundleId) {
      const fieldsExtractionStatus = await fetchFieldsInfo(fieldBundleId);
      console.debug(
        'Fetched fieldsExtractionStatus:',
        fieldBundleId,
        fieldsExtractionStatus
      );
      setFieldsExtractionStatus(
        fieldsExtractionStatus.filter(({ status }) => !!status)
      );
    }

    const isExtractionInProgressForSomeField = fieldsExtractionStatus.some(
      ({ status: { progress } }) => {
        return progress === FIELD_EXTRACTION_STATUS.IN_PROGRESS;
      }
    );

    if (fieldBundleId && isExtractionInProgressForSomeField) {
      console.debug('Start polling fieldsExtractionStatus...', fieldBundleId);
      intervalRef.current = setInterval(() => {
        getFieldsExtractionStatus(fieldBundleId);
      }, 6000);

      stopPolling = () => {
        console.debug(
          'Stop fetching fieldsExtractionStatus:',
          fieldBundleId,
          fieldsExtractionStatus
        );
        clearInterval(intervalRef.current);
      };
    }

    return stopPolling;
  }, [fieldBundleId, fieldsExtractionStatus]);

  useEffect(() => {
    async function getFieldsExtractionStatus(fieldBundleId) {
      const fieldsExtractionStatus = await fetchFieldsInfo(fieldBundleId);
      console.debug(
        'Fetched fieldsExtractionStatus:',
        fieldBundleId,
        fieldsExtractionStatus
      );
      setFieldsExtractionStatus(
        fieldsExtractionStatus.filter(({ status }) => !!status)
      );
    }

    fieldBundleId && getFieldsExtractionStatus(fieldBundleId);
  }, [fieldBundleId]);

  return {
    fieldsExtractionStatus: fieldsExtractionStatus,
    updateFieldsExtractionStatus: useCallback(() => {
      async function getFieldsExtractionStatus(fieldBundleId) {
        const fieldsExtractionStatus = await fetchFieldsInfo(fieldBundleId);
        console.debug(
          'Fetched fieldsExtractionStatus:',
          fieldBundleId,
          fieldsExtractionStatus
        );
        setFieldsExtractionStatus(
          fieldsExtractionStatus.filter(({ status }) => !!status)
        );
      }
      fieldBundleId && getFieldsExtractionStatus(fieldBundleId);
    }, [fieldBundleId]),
    isExtractionInProgress: () =>
      fieldsExtractionStatus.some(({ status: { progress } }) => {
        return progress === FIELD_EXTRACTION_STATUS.IN_PROGRESS;
      }),
    isExtractionCompleted: () =>
      fieldsExtractionStatus.every(({ status: { progress } }) => {
        return progress === FIELD_EXTRACTION_STATUS.COMPLETED;
      }),
  };
}
