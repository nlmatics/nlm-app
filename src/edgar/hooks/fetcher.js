import API from '../../utils/API.js';

export const fetchWorkspaceById = async workspaceId => {
  const response = await API.get(`/workspace/${workspaceId}`, {});
  return response.data;
};

export const fetchDocumentsById = async workspaceId => {
  let response = await API.get('/documentFolder/root', {
    params: {
      workspaceId,
      docPerPage: 5000,
      offset: 0,
      projectionParams: [
        'id',
        'meta.title',
        'meta.pubDate',
        'meta.description',
      ].join(','),
    },
  });
  return response.data.documents;
};

export const fetchDocument = async ({ workspaceId, documentId }) => {
  const response = await API.get(`/document/download/${documentId}`, {
    params: {
      workspaceId,
      renderFormat: 'original',
    },
    responseType: 'blob',
  });
  return response.data;
};

export const fetchDocumentDetails = async documentId => {
  let response = await API.get(`/document/${documentId}`);
  return response.data;
};

export const fetchDocumentKeyInfo = async documentId => {
  let response = await API.get(`/document/keyInfo/${documentId}`);
  return response.data;
};

export const fetchSubscriptionPlans = async () => {
  let response = await API.get(`/subscription/getPlans`);
  return response.data;
};
