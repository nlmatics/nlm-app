import API from './../../../utils/API';
export const fetchVisualizations = async workspaceId => {
  const response = await API.get(`/workspaceFilter`, {
    params: {
      workspaceId,
    },
  });
  return response.data;
};

export const saveVisualization = async ({
  name,
  rowGroupCols,
  filterModel,
  workspaceId,
  fieldSetId,
  userId,
  valueCols,
  chartType,
}) => {
  return await API.post(`/workspaceFilter`, {
    isUserDefined: true,
    name,
    options: {
      fieldSetId,
      rowGroupCols,
      filterModel,
      isVisualization: true,
      valueCols,
      chartType,
    },
    userId,
    workspaceId,
  });
};

export const deleteVisualization = async viewId => {
  return await API.post(`/workspaceFilter/delete/${viewId}`);
};
