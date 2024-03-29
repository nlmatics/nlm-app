import { CloseOutlined, ExclamationCircleTwoTone } from '@ant-design/icons';
import { message } from 'antd';
import fileDownload from 'js-file-download';
import API from './API.js';
import { searchCriteriaDefaults } from './constants.js';
import {
  constructFileTreeData,
  handleDocumentUploadError,
  selectCurrentWorkspace,
} from './helpers.js';

export const createAPIKey = async () => {
  try {
    let res = await API.post(
      `/developerApiKey`,
      {},
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  } catch (err) {
    showError(err);
  }
};

export const startTraining = async () => {
  try {
    await API.get(`/startTraining`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    showError(err);
  }
};

export const getUsageMetrics = async () => {
  try {
    let res = await API.get(`/usageMetrics`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  } catch (err) {
    showError(err);
  }
};

export const approveFieldValue = async fieldValue => {
  try {
    await API.get(
      `/fieldValue/bulkApprove?fieldId=${fieldValue.fieldId}&docId=${fieldValue.docId}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    message.info('Field Approved');
  } catch (err) {
    showError(err);
  }
};

export const approveAllFields = async (fieldBundleId, docId) => {
  try {
    await API.get(
      `/fieldValue/bulkApprove?fieldBundleId=${fieldBundleId}&docId=${docId}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    message.info('All Field Approved');
  } catch (err) {
    showError(err);
  }
};

export const unapproveFieldValue = async fieldValue => {
  try {
    await API.get(
      `/fieldValue/bulkDisapprove?fieldId=${fieldValue.fieldId}&docId=${fieldValue.docId}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    message.info('Unapproved Field');
  } catch (err) {
    showError(err);
  }
};

export const unapproveAllFields = async (fieldBundleId, docId) => {
  try {
    await API.get(
      `/fieldValue/bulkDisapprove?fieldBundleId=${fieldBundleId}&docId=${docId}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    message.info('Unapproved all Fields');
  } catch (err) {
    showError(err);
  }
};

export const removeAudit = async (docId, fieldId, fieldBundleId) => {
  try {
    let res = await API.post(
      `/fieldValue/field/delete/${docId}/${fieldId}`,
      null,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          fieldBundleId,
        },
      }
    );
    return res.data;
  } catch (err) {
    showError(err);
  }
};

export const findDocumentById = (docId, workspaceContext) => {
  let selectedDocument = null;
  for (let element of workspaceContext.documents) {
    if (docId === element.id) {
      selectedDocument = element;
      break;
    }
  }
  return selectedDocument;
};

export const getDocumentInfoBySourceUrl = async (user, sourceUrl) => {
  try {
    let data = {
      headers: {
        'Cache-Control': 'no-cache',
      },
    };
    sourceUrl = encodeURIComponent(sourceUrl);
    const res = await API.get(`/document/sourceUrl?url=${sourceUrl}`, data);
    return res.data;
  } catch (err) {
    // should there be an alert here? - KR
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;
    console.error(errMessage);
  }
};
export const updateTrainingSampleStatus = async (id, status) => {
  try {
    var params = { id: id, status: status };
    await API.post(`trainingSamples/modify`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    showError(err);
  }
};

export const deleteSavedSearchResult = async (
  workspaceContext,
  docId,
  uniqueId,
  setLoading,
  callback
) => {
  try {
    if (setLoading) {
      setLoading(true);
    }
    let res = await API.post(
      `searchResult/delete?docId=${docId}&uniqueId=${uniqueId}`,
      {}
    );
    if (callback) {
      callback(res.data);
    }
  } catch (err) {
    showError(err);
  } finally {
    setLoading(false);
  }
};

export const getSavedSearchesByAction = async (
  docId,
  action,
  setLoading,
  callback
) => {
  try {
    if (setLoading) {
      setLoading(true);
    }
    let res = await API.get(`savedSearchResults/${docId}/${action}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (callback) {
      callback(res.data);
    }
  } catch (err) {
    showError(err);
  } finally {
    setLoading(false);
  }
};

export const fetchWorkspaces = async (user, workspaceContext, name) => {
  return fetchWorkspacesWithId(user, workspaceContext, name, null);
};

export const fetchWorkspacesWithId = async user => {
  try {
    let userId;
    let tokens = user.displayName.split('#');
    if (tokens.length > 1) {
      userId = tokens[1];
    }

    return await API.get(`/workspace/user/${userId}`, {});
  } catch (err) {
    console.error('fetchWorkspacesWithId error ', err);
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;
    message.error({
      icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
      content: (
        <span>
          {`Error: ${errMessage}`}
          <CloseOutlined
            style={{
              marginLeft: '10px',
              marginRight: '0px',
              fontSize: '14px',
            }}
            onClick={() => message.destroy()}
          />
        </span>
      ),
      duration: 3,
    });
  }
};

// Gets the workspaces based on the user ID, which come from the backend in 4 sorted lists:
// 1. private_workspaces
// 2. collaborated_workspaces
// 3. subscribed_workspaces
// 4. public_workspaces
export const fetchGroupedWorkspacesByUser = async (user, workspaceContext) => {
  try {
    let userId;
    let tokens = user.displayName.split('#');
    if (tokens.length > 1) {
      userId = tokens[1];
    }

    let res = await API.get(`/workspace/user/${userId}`, {});

    let allWorkspaces = [
      ...res.data['private_workspaces'],
      ...res.data['collaborated_workspaces'],
      ...res.data['subscribed_workspaces'],
      ...res.data['public_workspaces'],
    ];
    workspaceContext.setWorkspaces(allWorkspaces);
    workspaceContext.setSortedWorkspaces(res.data);

    return res.data;
  } catch (err) {
    showError(err);
  }
};

export const reIngestWorkspace = async (workspaceId, applyOcr) => {
  return await reIngest(workspaceId, false, applyOcr);
};
export const reIngestDocument = async (documentId, applyOcr) => {
  return await reIngest(documentId, true, applyOcr);
};
export const reIngest = async (id, isFileLevel, applyOcr) => {
  try {
    var url = null;
    if (isFileLevel) {
      url = `/document/reIngestDocument/${id}`;
    } else {
      url = `/document/reIngestWorkspace/${id}`;
    }
    await API.get(url, {
      params: {
        applyOcr,
      },
    });
  } catch (err) {
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;

    message.error({
      icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
      content: (
        <span>
          {`error: ${errMessage}`}
          <CloseOutlined
            style={{
              marginLeft: '10px',
              marginRight: '0px',
              fontSize: '14px',
            }}
            onClick={() => message.destroy()}
          />
        </span>
      ),
      duration: 3,
    });
  }
};

export const archiveWorkspace = async (
  user,
  workspaceContext,
  setDeleteVisible,
  setWorkspaceEditorVisible,
  setLoading
) => {
  try {
    await API.post(`/workspace/delete/${workspaceContext.currentWorkspaceId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // update drop down switch to most recent workspace
    });
    setLoading(false);
    message.success(
      `Archiving workspace ${workspaceContext.currentWorkspaceName} succeeded.`
    );
    setDeleteVisible(false);
    setWorkspaceEditorVisible(false);
    fetchWorkspaces(user, workspaceContext);
    // call delete api, currently to soft delete
  } catch (err) {
    if (err.message === 'Exception: <Response [500]>') {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: (
          <span>
            {`error: 500 Error: We're sorry. Something went wrong. Please try again later.`}
            <CloseOutlined
              style={{
                marginLeft: '10px',
                marginRight: '0px',
                fontSize: '14px',
              }}
              onClick={() => message.destroy()}
            />
          </span>
        ),
        duration: 3,
      });
    } else {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: (
          <span>
            {`Deleting workspace ${workspaceContext.currentWorkspaceName} failed.`}
            <CloseOutlined
              style={{
                marginLeft: '10px',
                marginRight: '0px',
                fontSize: '14px',
              }}
              onClick={() => message.destroy()}
            />
          </span>
        ),
        duration: 3,
      });
    }
  }
};

export const getFieldDefinition = async (fieldId, setCallback, setLoading) => {
  try {
    if (setLoading) setLoading(true);
    let res = await API.get(`field/${fieldId}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    var fieldDefinition = res.data;
    setCallback(fieldDefinition);
    return fieldDefinition;
  } catch (err) {
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;

    message.error({
      icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
      content: (
        <span>
          {`error: ${errMessage}`}
          <CloseOutlined
            style={{
              marginLeft: '10px',
              marginRight: '0px',
              fontSize: '14px',
            }}
            onClick={() => message.destroy()}
          />
        </span>
      ),
      duration: 3,
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const getMLBBoxes = async docId => {
  try {
    let res = await API.get(`document/getMlBbox/${docId}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    return res.data;
  } catch (err) {
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;

    message.error({
      icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
      content: (
        <span>
          {`error: ${errMessage}`}
          <CloseOutlined
            style={{
              marginLeft: '10px',
              marginRight: '0px',
              fontSize: '14px',
            }}
            onClick={() => message.destroy()}
          />
        </span>
      ),
      duration: 3,
    });
  }
};

export const getSavedBBoxes = async docId => {
  try {
    let res = await API.get(`bbox/${docId}?auditedOnly=true`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    return res.data;
  } catch (err) {
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;

    message.error({
      icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
      content: (
        <span>
          {`error: ${errMessage}`}
          <CloseOutlined
            style={{
              marginLeft: '10px',
              marginRight: '0px',
              fontSize: '14px',
            }}
            onClick={() => message.destroy()}
          />
        </span>
      ),
      duration: 3,
    });
  }
};

export const deleteFieldDefinition = async fieldId => {
  try {
    let res = await API.post(`field/delete/${fieldId}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    return res.data;
  } catch (err) {
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;

    message.error({
      icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
      content: (
        <span>
          {`error: ${errMessage}`}
          <CloseOutlined
            style={{
              marginLeft: '10px',
              marginRight: '0px',
              fontSize: '14px',
            }}
            onClick={() => message.destroy()}
          />
        </span>
      ),
      duration: 3,
    });
  }
};

export const saveFieldBundle = async (user, fieldBundleId, fieldBundle) => {
  try {
    await API.post(`/fieldBundle/modify/${fieldBundleId}`, fieldBundle, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });
  } catch (err) {
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;
    message.error({
      icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
      content: (
        <span>
          {`error: ${errMessage}`}
          <CloseOutlined
            style={{
              marginLeft: '10px',
              marginRight: '0px',
              fontSize: '14px',
            }}
            onClick={() => message.destroy()}
          />
        </span>
      ),
      duration: 3,
    });
  }
};

export const saveBBox = async (documentId, bboxInfo) => {
  try {
    await API.post(`/bbox/${documentId}`, bboxInfo, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });
    message.success('Saved table outline');
  } catch (err) {
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;
    message.error({
      icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
      content: (
        <span>
          {`error: ${errMessage}`}
          <CloseOutlined
            style={{
              marginLeft: '10px',
              marginRight: '0px',
              fontSize: '14px',
            }}
            onClick={() => message.destroy()}
          />
        </span>
      ),
      duration: 3,
    });
  }
};

export const deleteFieldSetId = async ({
  workspaceId,
  fieldBundleId,
  fieldBundleName,
}) => {
  try {
    await API.post(
      `/fieldBundle/delete/${fieldBundleId}?workspaceId=${workspaceId}`,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    message.success(`Successfully deleted ${fieldBundleName} field set.`);
  } catch (err) {
    if (err.message === 'Exception: <Response [500]>') {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: (
          <span>
            {`error: 500 Error: We're sorry. Something went wrong. Please try again later.`}
            <CloseOutlined
              style={{
                marginLeft: '10px',
                marginRight: '0px',
                fontSize: '14px',
              }}
              onClick={() => message.destroy()}
            />
          </span>
        ),
        duration: 3,
      });
    } else {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: (
          <span>
            {`Deleting file ${fieldBundleName} failed.`}
            <CloseOutlined
              style={{
                marginLeft: '10px',
                marginRight: '0px',
                fontSize: '14px',
              }}
              onClick={() => message.destroy()}
            />
          </span>
        ),
        duration: 3,
      });
    }
  }
};

// TODO: can we remove some of these arguments?
export const fetchDocuments = async (
  user,
  currentWorkspaceId,
  docPerPage,
  docOffset,
  setLoading,
  setDocuments,
  setFileTreeData,
  workspaceContext
) => {
  // nosonar
  workspaceContext.setLoadingDocuments(true);
  if (setLoading) {
    setLoading(true);
  }
  try {
    if (currentWorkspaceId !== 'all') {
      let res = await API.get(
        `/documentFolder/root?workspaceId=${currentWorkspaceId}&docPerPage=${docPerPage}&offset=${docOffset}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setDocuments(res.data.documents);
      if (setFileTreeData) {
        // if the callback existss
        setFileTreeData(constructFileTreeData([...res.data.documents]));
      }
      workspaceContext.setTotalDocCount(res.data.totalDocCount);
      if (setLoading) {
        setLoading(false);
      }
      workspaceContext.setLoadingDocuments(false);
      return res.data.documents;
    }
  } catch (err) {
    if (setLoading) {
      setLoading(false);
    }
    workspaceContext.setLoadingDocuments(false);
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;
    message.error({
      icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
      content: (
        <span>
          {`error: ${errMessage}`}
          <CloseOutlined
            style={{
              marginLeft: '10px',
              marginRight: '0px',
              fontSize: '14px',
            }}
            onClick={() => message.destroy()}
          />
        </span>
      ),
      duration: 3,
    });
  }
};

// Fetches documents based on the pagination information given.
// Requires the current workspace ID, the number of documents to fetch, the offset to get a certain page's documents, and the
// workspaceContext object. Also can take in the sort method.
// Note: this doesn't use the workspaceContext's loading variable because it was causing <DocumentList> to unmount and remount when
// we want that component to persist. Loading parameters are taken care of by the component calling this function.
export const fetchPaginatedDocuments = async (
  currentWorkspaceId,
  docPerPage,
  docOffset,
  workspaceContext,
  sortMethod,
  sortOrder
) => {
  try {
    let sorting = sortOrder ? sortOrder : false;
    let res;
    if (sortMethod) {
      res = await API.get(
        `/documentFolder/root?workspaceId=${currentWorkspaceId}&docPerPage=${docPerPage}&offset=${docOffset}&sortMethod=${sortMethod}&reverseSort=${sorting}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      res = await API.get(
        `/documentFolder/root?workspaceId=${currentWorkspaceId}&docPerPage=${docPerPage}&offset=${docOffset}&reverseSort=${sorting}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    workspaceContext.setDocuments(res.data.documents);
    workspaceContext.setTotalDocCount(res.data.totalDocCount);
  } catch (err) {
    showError(err);
  }
};

// Fetches documents based on the filter information given
// Requires the current workspace ID, the filter information (name filter characters), and the workspace context object
// Adds this filtered document list to a new context variable, documentsDropdown, since we don't want to change the document list anywhere
// else in the app
export const fetchFilteredDocuments = async (workspaceId, filter) => {
  try {
    let res = await API.get(
      `/documentFolder/root?workspaceId=${workspaceId}&docPerPage=1000000&offset=0&nameContains=${filter}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data.documents;
  } catch (err) {
    showError(err);
  }
};

// TODO: Refactor to reduce complexity
export const fetchDashboardData = async (
  workspaceContext,
  workspaceId,
  documents
) => {
  // nosonar
  try {
    let res = await API.get(
      `/history/getWorkspaceDashboardData/${workspaceId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (res.data.recently_accessed) {
      let recentDocuments = [];
      let docId2DocMap = {};
      for (let doc of documents) {
        docId2DocMap[doc.id] = doc;
      }
      for (let recentDocInfo of res.data.recently_accessed) {
        let recentDoc = docId2DocMap[recentDocInfo.doc_id];
        if (recentDoc && !recentDocuments.includes(recentDoc)) {
          recentDocuments.push(recentDoc);
        }
        for (let recentDocInfo2 of res.data.recently_accessed) {
          let recentDoc2 = docId2DocMap[recentDocInfo2.doc_id];
          if (recentDoc2 && !recentDocuments.includes(recentDoc2)) {
            recentDocuments.push(recentDoc2);
          }
        }
        workspaceContext.setRecentDocuments(recentDocuments);
      }
    }
  } catch (err) {
    console.error(err.stack);
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;
    message.error({
      icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
      content: (
        <span>
          {`error: ${errMessage}`}
          <CloseOutlined
            style={{
              marginLeft: '10px',
              marginRight: '0px',
              fontSize: '14px',
            }}
            onClick={() => message.destroy()}
          />
        </span>
      ),
      duration: 3,
    });
  }
};

export const getSearchHistoryFull = async workspaceId => {
  let params = {
    days: Number(process.env.REACT_APP_SEARCH_HISTORY_DAYS),
    idType: 'question',
    workspaceId,
  };
  let res = await API.get(`searchHistory`, {
    params,
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  return Array.from(new Set(res.data));
};

export const getSearchHistory = async workspaceId => {
  try {
    var historyData = await getSearchHistoryFull(workspaceId);
    var questions = historyData.map(q =>
      q.searchCriteria.criterias[0]
        ? q.searchCriteria.criterias[0].question
        : ''
    );
    let optionSet = new Set(questions);
    return [...optionSet].map(pastQuestion => {
      return {
        value: pastQuestion,
        label: (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{pastQuestion}</span>
          </div>
        ),
      };
    });
  } catch (err) {
    let errMessage =
      err.message === 'Exception: <Response [500]>'
        ? "500 Error: We're sorry. Something went wrong. Please try again later."
        : err.message;
    message.error({
      icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
      content: (
        <span>
          {`error: ${errMessage}`}
          <CloseOutlined
            style={{
              marginLeft: '10px',
              marginRight: '0px',
              fontSize: '14px',
            }}
            onClick={() => message.destroy()}
          />
        </span>
      ),
      duration: 3,
    });
  }
};

export const deleteFile = async (
  user,
  workspaceContext,
  setLoading,
  rightClickNode,
  setFileTreeData,
  setDeleteVisible
) => {
  try {
    setLoading(true);
    await API.post(`/document/delete/${rightClickNode.key}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    fetchDocuments(
      user,
      workspaceContext.currentWorkspaceId,
      workspaceContext.docListDocPerPage,
      0,
      setLoading,
      workspaceContext.setDocuments,
      setFileTreeData,
      workspaceContext
    );
    message.success(`Deleting file ${rightClickNode.title} succeeded.`);
    setDeleteVisible(false);
  } catch (err) {
    if (err.message === 'Exception: <Response [500]>') {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: (
          <span>
            {`error: 500 Error: We're sorry. Something went wrong. Please try again later.`}
            <CloseOutlined
              style={{
                marginLeft: '10px',
                marginRight: '0px',
                fontSize: '14px',
              }}
              onClick={() => message.destroy()}
            />
          </span>
        ),
        duration: 3,
      });
    } else {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: (
          <span>
            {`Deleting file ${rightClickNode.title} failed.`}
            <CloseOutlined
              style={{
                marginLeft: '10px',
                marginRight: '0px',
                fontSize: '14px',
              }}
              onClick={() => message.destroy()}
            />
          </span>
        ),
        duration: 3,
      });
    }
  }
};

export const deleteFileId = async (workspaceContext, documentId, name) => {
  try {
    workspaceContext.setLoadingDocuments(true);
    await API.post(`/document/delete/${documentId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    message.success(`Deleting file ${name} succeeded.`);
    let currentDocuments = [];
    workspaceContext.documents.forEach(element => {
      if (element.id !== documentId) {
        currentDocuments.push(element);
      }
    });
    await workspaceContext.setDocuments(currentDocuments);
    return documentId;
  } catch (err) {
    if (err.message === 'Exception: <Response [500]>') {
      showError(err);
    } else {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: (
          <span>
            {`Deleting file ${workspaceContext.currentDocument.title} failed.`}
            <CloseOutlined
              style={{
                marginLeft: '10px',
                marginRight: '0px',
                fontSize: '14px',
              }}
              onClick={() => message.destroy()}
            />
          </span>
        ),
        duration: 3,
      });
    }
  } finally {
    workspaceContext.setLoadingDocuments(false);
  }
};

export const renameFile = async (
  user,
  workspaceContext,
  setLoading,
  rightClickNode,
  setFileTreeData,
  setRenameVisible
) => {
  try {
    setLoading(true);
    await API.post(
      `/document/rename/${rightClickNode.key}`,
      {
        newName: rightClickNode.title,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    await (user,
    workspaceContext.currentWorkspaceId,
    setLoading,
    workspaceContext.setDocuments,
    setFileTreeData,
    workspaceContext);
    message.success(`Renaming file to ${rightClickNode.title} succeeded.`);
    setRenameVisible(false);
  } catch (err) {
    if (err.message === 'Exception: <Response [500]>') {
      showError(err);
    } else {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: (
          <span>
            {`Renaming file to ${rightClickNode.title} failed.`}
            <CloseOutlined
              style={{
                marginLeft: '10px',
                marginRight: '0px',
                fontSize: '14px',
              }}
              onClick={() => message.destroy()}
            />
          </span>
        ),
        duration: 3,
      });
    }
  }
};

export const renameFileCrud = async ({
  user,
  workspaceContext,
  newDocumentName,
  setLoading,
  setRenameFileVisible,
  setNewDocumentName,
  documentId,
  workspaceId,
}) => {
  try {
    setLoading(true);
    let currentDocument = workspaceContext.currentDocument;
    await API.post(
      `/document/rename/${documentId}`,
      {
        newName: newDocumentName,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    fetchDocuments(
      user,
      workspaceId,
      workspaceContext.docListDocPerPage,
      0,
      setLoading,
      workspaceContext.setDocuments,
      null,
      workspaceContext
    );
    message.success(`Renaming file to ${newDocumentName} succeeded.`);
    setRenameFileVisible(false);
    setNewDocumentName('');
    currentDocument.name = newDocumentName;
    workspaceContext.setCurrentDocument(currentDocument);
    // clear new document name
  } catch (err) {
    if (err.message === 'Exception: <Response [500]>') {
      showError(err);
    } else {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: (
          <span>
            {`Renaming file to ${newDocumentName} failed.`}
            <CloseOutlined
              style={{
                marginLeft: '10px',
                marginRight: '0px',
                fontSize: '14px',
              }}
              onClick={() => message.destroy()}
            />
          </span>
        ),
        duration: 3,
      });
    }
  }
};

export const reingestFile = async (
  user,
  workspaceContext,
  setLoading,
  rightClickNode,
  setFileTreeData,
  setReingestVisible
) => {
  try {
    setLoading(true);
    await API.get(`/document/reIngestDocument/${rightClickNode.key}`, {});
    setLoading(false);
    message.success(`Re-ingesting file ${rightClickNode.title} succeeded.`);
    setReingestVisible(false);
  } catch (err) {
    if (err.message === 'Exception: <Response [500]>') {
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: (
          <span>
            {`error: 500 Error: We're sorry. Something went wrong. Please try again later.`}
            <CloseOutlined
              style={{
                marginLeft: '10px',
                marginRight: '0px',
                fontSize: '14px',
              }}
              onClick={() => message.destroy()}
            />
          </span>
        ),
        duration: 3,
      });
    } else {
      showError(err);
    }
  }
};

export const getTemplateList = async (
  user,
  workspaceContext,
  setTemplateMenu
) => {
  try {
    let res = await API.get(
      `/templateToFile/${workspaceContext.currentWorkspaceId}`,
      {}
    );
    setTemplateMenu(
      res.data.map(temp => ({
        name: temp.name,
        id: temp.id,
      }))
    );
  } catch (err) {
    showError(err);
  }
};

export const downloadTemplateResult = async (
  user,
  workspaceContext,
  extractionTemplate,
  documentId,
  fieldBundleId
) => {
  try {
    message.loading({ content: 'Downloading reports..', key: 'reports' });
    let res = await API.get(`/templateToFile/download`, {
      params: {
        fieldBundleId,
        documentId,
        extractionTemplateId: extractionTemplate.id,
      },
      headers: {
        'Cache-Control': 'no-cache',
      },
      responseType: 'blob',
    });
    fileDownload(res.data, extractionTemplate.name);
  } catch (err) {
    showError(err);
  }
};

export const getFieldsInfo = async (
  user,
  fieldSetId,
  setFieldOptions,
  setFieldLoading,
  setSelectDisable
) => {
  try {
    if (setFieldLoading) {
      setFieldLoading(true);
    }
    let res = await API.get(`/fieldIdsInfo/${fieldSetId}`, {});
    setFieldOptions({ fieldBundleId: fieldSetId, fieldDescriptions: res.data });
    if (setFieldLoading) {
      setFieldLoading(false);
    }
    if (setSelectDisable) {
      setSelectDisable(false);
    }
  } catch (err) {
    showError(err);
  }
};

export const saveWorkflowField = async (fieldId, fieldDefinition) => {
  let response = null;
  try {
    if (fieldId) {
      let action = 'modify';
      await API.post(
        `/field/modify/${fieldId}?action=${action}`,
        fieldDefinition,
        {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        }
      );
      message.info('Workflow field updated');
      return fieldId;
    } else {
      response = await API.post(`/field`, fieldDefinition, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
      message.info('Workflow field created');
      return response.data;
    }
  } catch (err) {
    showError(err);
  }
};

export const saveDerivedField = async (fieldId, fieldDefinition) => {
  let response = null;
  try {
    if (fieldId) {
      let action = 'replace';
      await API.post(
        `/field/modify/${fieldId}?action=${action}`,
        fieldDefinition,
        {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        }
      );
      message.info('Derived field updated');
      return fieldId;
    } else {
      response = await API.post(`/field`, fieldDefinition, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
      message.info('Derived field created');
      return response.data;
    }
  } catch (err) {
    showError(err);
  }
};

export const updateFieldInfo = async (
  user,
  fieldId,
  fieldDefinition,
  action,
  workspaceContext
) => {
  try {
    workspaceContext.setFieldUpdateInProgress(true);
    let prevDocPerPage = fieldDefinition.searchCriteria.docPerPage;
    fieldDefinition.searchCriteria.docPerPage =
      searchCriteriaDefaults.DOC_PER_PAGE;
    if (
      workspaceContext.searchResults &&
      workspaceContext.searchResults.fileFacts.length > 0
    ) {
      let resolvedCriterias =
        workspaceContext.searchResults.fileFacts[0].criterias;
      for (let i = 0; i < resolvedCriterias.length; i++) {
        if (resolvedCriterias[i].is_bool_question) {
          fieldDefinition.searchCriteria.criterias[i].expectedAnswerType =
            'bool';
        } else {
          fieldDefinition.searchCriteria.criterias[i].expectedAnswerType =
            resolvedCriterias[i].expected_answer_type;
        }
      }
    }
    await API.post(
      `/field/modify/${fieldId}?action=${action}`,
      fieldDefinition,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    fieldDefinition.searchCriteria.docPerPage = prevDocPerPage;
    message.info('Field update queued.');
    workspaceContext.setFieldUpdateInProgress(false);
    workspaceContext.setSavedBundleId([fieldDefinition.parentBundleId]);
  } catch (err) {
    showError(err);
  }
};

export const saveNewFieldInfo = async (
  user,
  fieldDefinition,
  setCurrentWorkspaceFields,
  setSavedFieldId,
  setSavedBundleId,
  setUpdateFieldSelectorEdit,
  workspaceContext
) => {
  try {
    let prevDocPerPage = fieldDefinition.searchCriteria.docPerPage;
    workspaceContext.setFieldUpdateInProgress(true);
    fieldDefinition.searchCriteria.docPerPage =
      searchCriteriaDefaults.DOC_PER_PAGE;
    fieldDefinition.searchCriteria.docPerPage = prevDocPerPage;
    if (
      workspaceContext.searchResults &&
      workspaceContext.searchResults.fileFacts.length > 0
    ) {
      let resolvedCriterias =
        workspaceContext.searchResults.fileFacts[0].criterias;
      for (let i = 0; i < resolvedCriterias.length; i++) {
        if (resolvedCriterias[i].is_bool_question) {
          fieldDefinition.searchCriteria.criterias[i].expectedAnswerType =
            'bool';
        } else {
          fieldDefinition.searchCriteria.criterias[i].expectedAnswerType =
            resolvedCriterias[i].expected_answer_type;
        }
      }
    }
    let response = await API.post(`/field`, fieldDefinition, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });
    message.info('Field creation scheduled.');
    let res = await API.get(
      `/fieldIdsInfo/${fieldDefinition.parentBundleId}`,
      {}
    );
    workspaceContext.setFieldUpdateInProgress(false);
    setSavedBundleId([fieldDefinition.parentBundleId]);
    setCurrentWorkspaceFields(res.data);
    setSavedFieldId(response.data.id);
    setUpdateFieldSelectorEdit(true);
    return response.data.id;
  } catch (err) {
    showError(err);
  }
};

export const saveSearchResult = async (
  workspaceContext,
  workspaceId,
  docId,
  searchResult,
  searchCriteria,
  action
) => {
  try {
    let data = {
      workspaceId: workspaceId,
      docId: docId, // attribute needs to be renamed
      action: action,
      status: 'created',
      searchResult: searchResult,
      searchCriteria: searchCriteria,
    };
    console.log('will save:', data);
    await API.post(`/searchResult`, data, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });
    if (action !== 'bookmark') {
      message.success('Thank you for the feedback!');
    } else {
      message.success('Pinned successfully');
    }
  } catch (err) {
    showError(err);
  }
};

export const getSearchTests = async (user, wsId, docId, setSearchTests) => {
  try {
    let response = await API.get(
      `/searchTestCase?wsId=${wsId}&docId=${docId}`,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    if (setSearchTests) {
      setSearchTests(response.data.data);
    }
  } catch (err) {
    showError(err);
  }
};

export const getFlaggedSearchTests = async (
  user,
  wsId,
  docId,
  setFlaggedSearchTests
) => {
  try {
    let response = await API.get(
      `/searchTestCase/flag?wsId=${wsId}&docId=${docId}`,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    setFlaggedSearchTests(response.data.data);
  } catch (err) {
    showError(err);
  }
};

export const runSearchTest = async (user, wsId, docId, setDevSearchResults) => {
  try {
    let response = await API.get(
      `/searchTestCase/runTest?workspaceId=${wsId}&docId=${docId}`,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    setDevSearchResults(response.data.data);
  } catch (err) {
    showError(err);
  }
};

// Loads a document based on the document ID
// Takes in the docId as a string and returns the document data
export const reloadDocument = async docId => {
  try {
    let res = await API.get(`/document/${docId}`);
    return res.data;
  } catch (err) {
    showError(err);
  }
};

// Loads all the documents for a workspace based on the workspace ID
// Takes in the  workspaceId as a string and returns the list of documents
export const reloadWorkspaceDocuments = async workspaceId => {
  try {
    let res = await API.get(`/document/workspace/${workspaceId}`);
    return res.data.documents;
  } catch (err) {
    showError(err);
  }
};

// Loads the current workspace for the user by looking at their default workspace
// Takes in the user ID as a string
export const findCurrentWorkspace = async userId => {
  try {
    let res = await API.get(`/workspace/defaultWorkspace/${userId}`);
    return res.data;
  } catch (err) {
    showError(err);
  }
};

// Upload a file(s) to a workspace
// Takes workspaceId as a string and the data to upload
export const uploadFile = async (workspaceId, data) => {
  try {
    return await API.post(`/document/workspace/${workspaceId}`, data, {
      headers: {
        'Content-Type':
          'multipart/form-data; boundary=----WebKitFormBoundaryqTqJIxvkWFYqvP5s',
      },
    });
  } catch (error) {
    handleDocumentUploadError(error);
  }
};

export const indexWebsite = async (workspaceId, data) => {
  try {
    await API.post(`/document/uploadByUrl/${workspaceId}`, data, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });
    message.success(
      'Indexing task submitted. This will take a long time, check open tasks for updates.'
    );
  } catch (err) {
    showError(err);
  }
};

// Clones a workspace
// Takes in the workspace ID of the workspace to be cloned, the name of the new workspace, and the workspace context object
// Once the workspace is created, it redirects the user to that new workspace
export const cloneWorkspace = async (
  workspaceId,
  newName,
  workspaceContext
) => {
  try {
    workspaceContext.setLoadingDocuments(true);
    // create clone
    let res = await API.post(
      `/workspace/clone/${workspaceId}`,
      { name: newName },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    // get all clone's info
    res = await API.get(`/workspace/${res.data.id}`);
    let newWorkspace = res.data;

    if (workspaceContext.currentWorkspaceId !== 'all') {
      workspaceContext.setPrevOpenedWorkspaceId(
        workspaceContext.currentWorkspaceId
      );
    }
    // workspaceContext.setCurrentWorkspace(newWorkspace.data);
    // workspaceContext.setCurrentWorkspaceId(newWorkspace.data.id);
    // workspaceContext.setCurrentWorkspaceName(newWorkspace.data.name);
    workspaceContext.setWorkspaces(
      workspaceContext.workspaces.concat([newWorkspace])
    );
    let sortedWorkspaces = workspaceContext.sortedWorkspaces;
    let private_workspaces = sortedWorkspaces['private_workspaces'].concat([
      newWorkspace,
    ]);
    sortedWorkspaces['private_workspaces'] = private_workspaces;
    workspaceContext.setSortedWorkspaces(sortedWorkspaces);
    // workspaceContext.setLoadingDocuments(false);
    workspaceContext.setFieldSets([]);
    selectCurrentWorkspace(workspaceContext, newWorkspace);
  } catch (err) {
    workspaceContext.setLoadingDocuments(false);
    showError(err);
  }
};

// Clones a field set to another workspace
// Takes the field set ID and the workspace ID
// Returns the id of the new field set
export const cloneFieldSet = async (fieldSetId, workspaceId) => {
  try {
    let res = await API.get(`/replicateFieldBundle/workspace/${workspaceId}`, {
      params: { fieldBundleId: fieldSetId },
    });
    return res.data.bundle_id;
  } catch (err) {
    showError(err);
  }
};

export const showError = err => {
  console.error('got error below', err.message, err.response);
  console.error(err);
  let errMessage =
    err.message === 'Exception: <Response [500]>'
      ? "500 Error: We're sorry. Something went wrong. Please contact support@nlmatics.com for help."
      : err.message;
  if (process.env.REACT_APP_APP_NAME === 'CHATTY_PDF') {
    errMessage = 'Our servers are busy. Please try again in a few minutes.';
  }
  if (err.response && err.response.data && err.response.data.status === 403) {
    errMessage = err.response.data.detail;
  }
  message.error({
    icon: <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />,
    content: (
      <span>
        {`error: ${errMessage}`}
        <CloseOutlined
          style={{
            marginLeft: '10px',
            marginRight: '0px',
            fontSize: '14px',
          }}
          onClick={() => message.destroy()}
        />
      </span>
    ),
    duration: 3,
  });
};

export const subscribeToSearchCriteria = async ({
  workspaceId,
  searchCriteria,
}) => {
  try {
    await API.post(
      `/searchCriteriaWorkflow`,
      { actions: ['email'], searchCriteria, workspaceId },
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );
    message.success('Subscribed to search criteria successfully.');
  } catch (err) {
    showError(err);
  }
};
