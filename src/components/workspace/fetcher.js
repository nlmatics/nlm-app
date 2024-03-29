import API from '../../utils/API.js';

const headers = {
  'Content-Type': 'application/json',
};

export async function fetchFieldBundles(workspaceId) {
  let response = await API.get(`/fieldBundle`, {
    params: {
      workspaceId: workspaceId,
    },
    headers,
  });
  return response.data;
}

export async function fetchFieldBundleExtractionDataForDoc({
  fieldBundleId,
  documentId,
}) {
  let response = await API.get(`extractFieldBundle/doc/${documentId}`, {
    params: {
      fieldBundleId,
    },
    headers,
  });
  return response.data;
}

export async function fetchFieldsMetaData({
  fieldBundleId,
  fieldIds,
  returnOnlyStatus,
}) {
  var params = {
    fieldBundleId,
    returnOnlyStatus,
  };

  if (fieldIds) {
    params['fieldIds'] = fieldIds.join(',');
  }
  let response = await API.get('/field', {
    params,
    headers,
  });
  console.debug('fetchFieldsMetaData', response.data);
  return response.data;
}

export async function fetchFieldMetaData(fieldId) {
  let response = await API.get(`/field/${fieldId}`, {});
  console.debug('fetchFieldMetaData', response.data);
  return response.data;
}

export const fetchFieldsInfo = async fieldBundleId => {
  let response = await API.get(`/fieldIdsInfo/${fieldBundleId}`, {
    headers,
  });
  return response.data;
};

export const fetchFieldBundleStats = async ({ workspaceId, fieldBundleId }) => {
  return await API.get(`/fieldValue/stats`, {
    params: {
      fieldBundleId,
      workspaceId,
    },
    headers,
  });
};

export const fetchWorkspaceDocumentsData = async workspaceId => {
  let response = await API.get(`/document/workspace/${workspaceId}`, {
    params: {
      returnOnlyStatus: true,
    },
  });
  return response.data?.documents;
};

export const fetchFieldData = async ({
  workspaceId,
  fieldBundleId,
  gridQuery,
  fieldIds,
}) => {
  const payload = {
    workspaceId,
    fieldBundleId,
    gridQuery,
    ...(fieldIds ? { fieldIds } : {}),
  };
  const response = await API.post('/extractFieldBundle/gridData', payload, {
    headers,
  });
  return response.data;
};

export const fetchFilterOptions = async ({ gridState, fieldId }) => {
  const payload = {
    ...gridState,
    distinctField: fieldId,
  };
  const response = await API.post('/extractFieldBundle/gridData', payload, {
    headers,
  });
  return response;
};

export const downloadAllFields = async ({ fieldBundleId, fieldBundleName }) => {
  try {
    const response = await API.get(`fieldBundle/export/${fieldBundleId}`, {
      responseType: 'blob',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    const href = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', `${fieldBundleName}.txt`);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  } catch (err) {
    console.error(err);
  }
};

export const uploadAllFields = async ({ file, fieldBundleId }) => {
  const data = new FormData();
  data.append('file', file);
  return await API.post(`/fieldBundle/${fieldBundleId}`, data, {
    headers: {
      'Content-Type':
        'multipart/form-data; boundary=----WebKitFormBoundaryqTqJIxvkWFYqvP5s',
    },
  });
};

export const downloadAllData = async ({
  workspaceId,
  fieldBundleId,
  workspaceName,
  fieldBundleName,
}) => {
  let response = await API.get(`/extractFieldBundle/download`, {
    params: {
      workspaceId,
      fieldBundleId,
    },

    headers: { Accept: 'application/vnd.ms-excel' },
    responseType: 'blob',
  });

  const href = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = href;
  const fileName = `${workspaceName}-${fieldBundleName}`;
  link.setAttribute(
    'download',
    `${fileName.replaceAll(' ', '_').replaceAll('.', '_')}`
  );
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

export async function fetchWorkspaceIngestionStats(workspaceId) {
  let response = await API.get(`/document/status/${workspaceId}`, {
    headers,
  });
  return response.data;
}

export const fetchWorkspaceSearchPrompts = async workspaceId => {
  let response = await API.get('promptLibrary', {
    params: {
      workspaceId,
      queryScope: 'workspace',
    },
  });
  return response.data;
};
