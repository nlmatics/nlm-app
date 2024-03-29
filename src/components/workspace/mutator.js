import API from '../../utils/API.js';

export const deleteField = async fieldId => {
  let res = await API.post(`/field/delete/${fieldId}`);
  return res.data;
};

export const renameField = async ({ fieldId, name }) => {
  await API.post(`/field/modify/${fieldId}?action=modify`, { name });
};
