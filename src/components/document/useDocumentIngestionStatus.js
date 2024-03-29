import { useEffect, useRef, useState } from 'react';
import { usePrevious } from '../../utils/usePrevious';
import { fetchDocumentData } from './fetcher';

const DOCUMENT_INGESTION_STATUS = {
  READY_FOR_INGESTION: 'ready_for_ingestion',
  IN_PROGRESS: 'ingest_inprogress',
  COMPLETED: 'ingest_ok',
  FAILED: 'ingest_failed',
};

export function useDocumentIngestionStatus(documentId) {
  const [documentIngestionStatus, setDocumentIngestionStatus] = useState('');
  const previousDocumentIngestionStatus = usePrevious(documentIngestionStatus);
  const intervalRef = useRef();

  useEffect(() => {
    if (
      intervalRef.current &&
      (documentIngestionStatus === DOCUMENT_INGESTION_STATUS.COMPLETED ||
        documentIngestionStatus === DOCUMENT_INGESTION_STATUS.FAILED)
    ) {
      console.debug(
        'Stop fetching documentIngestionStatus:',
        documentId,
        documentIngestionStatus
      );
      clearInterval(intervalRef.current);
    }
  }, [documentId, documentIngestionStatus]);

  useEffect(() => {
    let stopPolling = () => {};
    async function getDocumentData(documentId) {
      const documentData = await fetchDocumentData(documentId);
      console.debug(
        'Fetched documentIngestionStatus:',
        documentId,
        documentData.status
      );
      setDocumentIngestionStatus(documentData.status);
    }

    if (
      documentId &&
      (documentIngestionStatus ===
        DOCUMENT_INGESTION_STATUS.READY_FOR_INGESTION ||
        documentIngestionStatus === DOCUMENT_INGESTION_STATUS.IN_PROGRESS)
    ) {
      console.debug('Start polling documentIngestionStatus...', documentId);
      intervalRef.current = setInterval(() => {
        getDocumentData(documentId);
      }, 6000);

      stopPolling = () => {
        console.debug(
          'Stop fetching documentIngestionStatus:',
          documentId,
          documentIngestionStatus
        );
        clearInterval(intervalRef.current);
      };
    }

    return stopPolling;
  }, [documentId, documentIngestionStatus]);

  useEffect(() => {
    async function getDocumentData(documentId) {
      const documentData = await fetchDocumentData(documentId);
      console.debug(
        'Fetched documentIngestionStatus:',
        documentId,
        documentData.status
      );
      setDocumentIngestionStatus(documentData.status);
    }

    documentId && getDocumentData(documentId);
  }, [documentId]);

  return {
    documentIngestionStatus,
    isDocumentIngestionSuccessfullyCompletedJustNow: () => {
      return (
        previousDocumentIngestionStatus ===
          DOCUMENT_INGESTION_STATUS.IN_PROGRESS &&
        documentIngestionStatus === DOCUMENT_INGESTION_STATUS.COMPLETED
      );
    },
    isDocumentIngestionFailedJustNow: () => {
      return (
        previousDocumentIngestionStatus ===
          DOCUMENT_INGESTION_STATUS.IN_PROGRESS &&
        documentIngestionStatus === DOCUMENT_INGESTION_STATUS.FAILED
      );
    },
    updateDocumentIngestionStatus: () => {
      async function getDocumentData(documentId) {
        const documentData = await fetchDocumentData(documentId);
        console.debug(
          'Fetched documentIngestionStatus:',
          documentId,
          documentData.status
        );
        setDocumentIngestionStatus(documentData.status);
      }
      documentId && getDocumentData(documentId);
    },
    isReadyForIngestion: () =>
      documentIngestionStatus === DOCUMENT_INGESTION_STATUS.READY_FOR_INGESTION,
    isIngestionInProgress: () =>
      documentIngestionStatus === DOCUMENT_INGESTION_STATUS.IN_PROGRESS,
    isIngestionCompleted: () =>
      documentIngestionStatus === DOCUMENT_INGESTION_STATUS.COMPLETED,
    isIngestionFailed: () =>
      documentIngestionStatus === DOCUMENT_INGESTION_STATUS.FAILED,
  };
}
