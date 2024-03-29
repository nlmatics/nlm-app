import API from '../../../utils/API';

export const fetchRelations = async workspaceId => {
  const { data } = await API.get(`/fields/relations/${workspaceId}`);
  return data;
};
