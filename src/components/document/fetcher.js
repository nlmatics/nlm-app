import API from '../../utils/API.js';

export const fetchDocumentData = async documentId => {
  let response = await API.get(`/document/${documentId}`);
  return response.data;
};
