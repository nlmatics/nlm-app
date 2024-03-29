import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWorkspaceDocumentsData } from './fetcher';

const DOCUMENT_INGESTION_STATUS = {
  READY_FOR_INGESTION: 'ready_for_ingestion',
  IN_PROGRESS: 'ingest_inprogress',
  COMPLETED: 'ingest_ok',
  FAILED: 'ingest_failed',
};

export default function useWorkspaceDocumentsIngestionStatus(
  workspaceId,
  documents
) {
  const [
    workspaceDocumentsIngestionStatus,
    setWorkspaceDocumentsIngestionStatus,
  ] = useState([]);

  const intervalRef = useRef();

  useEffect(() => {
    const isIngestionDoneForAllDocuments =
      workspaceDocumentsIngestionStatus.every(({ status }) => {
        return (
          status === DOCUMENT_INGESTION_STATUS.COMPLETED ||
          status === DOCUMENT_INGESTION_STATUS.FAILED
        );
      });
    if (intervalRef.current && isIngestionDoneForAllDocuments) {
      console.debug(
        'Stop fetching workspaceDocumentsIngestionStatus:',
        workspaceId,
        workspaceDocumentsIngestionStatus
      );
      clearInterval(intervalRef.current);
    }
  }, [workspaceId, workspaceDocumentsIngestionStatus]);

  useEffect(() => {
    let stopPolling = () => {};
    async function getWorkspaceDocumentsData(workspaceId) {
      const workspaceDocumentsIngestionStatus =
        await fetchWorkspaceDocumentsData(workspaceId);
      console.debug(
        'Fetched workspaceDocumentsIngestionStatus:',
        workspaceId,
        workspaceDocumentsIngestionStatus
      );
      setWorkspaceDocumentsIngestionStatus(workspaceDocumentsIngestionStatus);
    }

    const isIngestionInProgressForSomeDocument =
      workspaceDocumentsIngestionStatus.some(({ status }) => {
        return (
          status === DOCUMENT_INGESTION_STATUS.READY_FOR_INGESTION ||
          status === DOCUMENT_INGESTION_STATUS.IN_PROGRESS
        );
      });

    if (workspaceId && isIngestionInProgressForSomeDocument) {
      console.debug(
        'Start polling workspaceDocumentsIngestionStatus...',
        workspaceId
      );
      intervalRef.current = setInterval(() => {
        getWorkspaceDocumentsData(workspaceId);
      }, 6000);

      stopPolling = () => {
        console.debug(
          'Stop fetching workspaceDocumentsIngestionStatus:',
          workspaceId,
          workspaceDocumentsIngestionStatus
        );
        clearInterval(intervalRef.current);
      };
    }

    return stopPolling;
  }, [workspaceId, workspaceDocumentsIngestionStatus]);

  useEffect(() => {
    async function getWorkspaceDocumentsData(workspaceId) {
      const workspaceDocumentsIngestionStatus =
        await fetchWorkspaceDocumentsData(workspaceId);
      console.debug(
        'Fetched workspaceDocumentsIngestionStatus:',
        workspaceId,
        workspaceDocumentsIngestionStatus
      );
      setWorkspaceDocumentsIngestionStatus(workspaceDocumentsIngestionStatus);
    }

    workspaceId && documents.length && getWorkspaceDocumentsData(workspaceId);
  }, [workspaceId, documents]);

  return {
    workspaceDocumentsIngestionStatus,
    updateWorkspaceDocumentsIngestionStatus: useCallback(() => {
      async function getWorkspaceDocumentsData(workspaceId) {
        const workspaceDocumentsIngestionStatus =
          await fetchWorkspaceDocumentsData(workspaceId);
        console.debug(
          'Fetched workspaceDocumentsIngestionStatus:',
          workspaceId,
          workspaceDocumentsIngestionStatus
        );
        setWorkspaceDocumentsIngestionStatus(workspaceDocumentsIngestionStatus);
      }
      workspaceId && getWorkspaceDocumentsData(workspaceId);
    }, [workspaceId]),
    isReadyForIngestion: () =>
      workspaceDocumentsIngestionStatus.some(({ status }) => {
        return status === DOCUMENT_INGESTION_STATUS.READY_FOR_INGESTION;
      }),
    isIngestionInProgress: () =>
      workspaceDocumentsIngestionStatus.some(({ status }) => {
        return status === DOCUMENT_INGESTION_STATUS.IN_PROGRESS;
      }),
    isIngestionCompleted: () =>
      workspaceDocumentsIngestionStatus.every(({ status }) => {
        return status === DOCUMENT_INGESTION_STATUS.COMPLETED;
      }),
    isIngestionFailed: () =>
      workspaceDocumentsIngestionStatus.length &&
      workspaceDocumentsIngestionStatus.every(({ status }) => {
        return status === DOCUMENT_INGESTION_STATUS.FAILED;
      }),
  };
}
