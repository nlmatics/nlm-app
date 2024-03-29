import {
  ExclamationCircleTwoTone,
  SwapOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { makeStyles } from '@material-ui/styles';
import { Button, Card, Col, Empty, Layout, Row, Spin, message } from 'antd';
import { useCallback, useContext, useEffect, useState } from 'react';
import fullLogoDarkTheme from '../assets/images/chattypdf-logo-vertical-black-bg.svg';
import fullLogoLightTheme from '../assets/images/chattypdf-logo-vertical-white-bg.svg';
import useUserInfo from '../hooks/useUserInfo';
import useWorkspaces from '../pages/Workspaces/useWorkspaces';
import API from '../utils/API.js';
import { reloadDocument } from '../utils/apiCalls';
import {
  fetchWorkspaces,
  getDocumentInfoBySourceUrl,
} from '../utils/apiCalls.js';
import { useAuth } from '../utils/use-auth';
import { WorkspaceContext } from './WorkspaceContext';
import DocSearchView from './workspace/Document/DocInfoViewer/DocSearchView';
import ThemeContext from '../contexts/theme/ThemContext';
import { handleDocumentUploadError } from '../utils/helpers';
const { Content } = Layout;

const useStyles = makeStyles({
  logo: {
    width: '120px',
    height: '36px',
  },
  navItem: {
    cursor: 'pointer',
    lineHeight: '40px !important',
  },
  searchWrapper: {
    width: '100%',
  },
  emptyDiv: {
    margin: '20px 0',
    marginBottom: '20px',
    padding: '30px 50px',
    textAlign: 'center',
    borderRadius: '4px',
  },
});

// TODO: Refactor to improve complexity
export default function Importer() {
  const workspaceContext = useContext(WorkspaceContext);
  const { theme, THEMES, switchTheme } = useContext(ThemeContext);
  const validDomain = '*';
  const classes = useStyles();
  const [checkingDocExists, setCheckingDocExists] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useAuth();
  const [percentCompleted, setPercentCompleted] = useState(0.0); // nosonar
  console.debug({ percentCompleted });
  const [uploadStatus, setUploadStatus] = useState('normal');
  const [docId, setDocId] = useState(null);

  const { data: userInfo } = useUserInfo();
  const { data: workspaces } = useWorkspaces(userInfo?.id);

  const getMyWorkspaceId = useCallback(
    () =>
      workspaces?.private_workspaces && workspaces?.private_workspaces[0].id,
    [workspaces]
  );

  const getDocIfExists = async url => {
    try {
      var docInfo = await getDocumentInfoBySourceUrl(user, url);
      setCheckingDocExists(false);
      if (docInfo.id) {
        setDocId(docInfo.id);
        setShowSearch(true);
      }
    } catch (err) {
      console.log(err);
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: err.message,
        duration: 3,
      });
    }
  };

  const checkIngestionStatus = docId => {
    let intervalId = setInterval(async () => {
      console.log(
        "Executing useDocIngestionStatus loop. Make sure that this doesn't run indefinitely)"
      );
      const newDocData = await reloadDocument(docId);
      const ingestionStatus = [
        { id: newDocData.id, status: newDocData.status },
      ];
      if (
        ingestionStatus[0].status !== 'ingest_inprogress' &&
        ingestionStatus[0].status !== 'ready_for_ingestion'
      ) {
        console.log('Finishing loop because document status ', ingestionStatus);
        setUploadStatus('ready');
        setShowSearch(true);
        clearInterval(intervalId);
      }
    }, 6000);
  };
  const invokeUpload = useCallback(
    async params => {
      var allowedtype = [
        'application/pdf',
        'text/plain',
        'text/x-markdown',
        'text/markdown',
        'text/html',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      const data = new FormData();
      var blob = params.blob;
      data.append('file', blob, params.url);
      try {
        if (allowedtype.includes(blob.type)) {
          setUploadStatus('active');
          let response = await API.post(
            `/document/workspace/${getMyWorkspaceId()}`,
            data,
            {
              headers: {
                'Content-Type':
                  'multipart/form-data; boundary=----WebKitFormBoundaryqTqJIxvkWFYqvP5s',
              },
              onUploadProgress: function (progressEvent) {
                setPercentCompleted(
                  Math.round((progressEvent.loaded * 100) / progressEvent.total)
                );
              },
            }
          );
          setDocId(response.data.id);
          checkIngestionStatus(response.data.id);
        } else {
          console.error('unsupported content type: ', blob.type);
        }
      } catch (error) {
        setUploadStatus('exception');
        handleDocumentUploadError(error);
      }
    },
    [getMyWorkspaceId]
  );

  const uploadFile = () => {
    if (window && window.parent) {
      // TODO: replace window.parent with the verified element
      window.parent.postMessage({ action: 'upload' }, validDomain); // nosonar
    }
  };

  const handleMessage = useCallback(
    event => {
      var eventMessage = event.data;
      // Do we trust the sender of this message?  (might be
      // different from what we originally opened, for example).
      if (!event.origin.startsWith('chrome-extension://')) return;
      let validIds = ['iheimffbcmagfabfckkgnlmhfofldpge'];
      let allowedSource = false;
      for (let validId of validIds) {
        if (event.origin.endsWith(validId)) {
          allowedSource = true;
          break;
        }
      }
      if (!allowedSource) {
        return;
      }

      if (eventMessage.action == 'upload') {
        invokeUpload(eventMessage);
      } else if (eventMessage.action == 'sourceUrl') {
        getDocIfExists(eventMessage.url);
      }
    },
    [invokeUpload]
  );
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    fetchWorkspaces(user, workspaceContext, null);
    // TODO: replace window.parent with verified element
    window.parent.postMessage({ action: 'ready' }, validDomain); // nosonar
    return function cleanup() {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  // displays the upload button is there are no files
  const displayUpload =
    uploadStatus === 'active' ? (
      <div className={classes.emptyDiv}>
        <Spin tip="Indexing.." size="large"></Spin>
      </div>
    ) : (
      <Empty
        style={{ height: '100%' }}
        description="Please upload this page to start searching"
      >
        <Button
          icon={<UploadOutlined />}
          type="primary"
          onClick={event => {
            uploadFile(event);
          }}
        >
          Upload
        </Button>
      </Empty>
    );

  // displays spinners or an upload button idk
  const displayStatus = checkingDocExists ? (
    <div className={classes.emptyDiv}>
      <Spin tip="Initializing.." size="large"></Spin>
    </div>
  ) : (
    <Card style={{ height: 'calc(100vh - 120px)' }}>{displayUpload}</Card>
  );

  return (
    <Layout style={{ padding: 15 }}>
      <Row style={{ marginBottom: 10 }}>
        <Col span={2}></Col>
        <Col span={20} style={{ textAlign: 'center' }}>
          <img
            width={100}
            src={
              theme === THEMES.LIGHT ? fullLogoLightTheme : fullLogoDarkTheme
            }
            alt="Chatty PDF Logo"
          />
        </Col>
        <Col span={2}>
          <Button type="link" icon={<SwapOutlined />} onClick={switchTheme} />
        </Col>
      </Row>

      <Content>
        {showSearch ? (
          <DocSearchView documentId={docId} workspaceId={getMyWorkspaceId()} />
        ) : (
          displayStatus
        )}
      </Content>
    </Layout>
  );
}
