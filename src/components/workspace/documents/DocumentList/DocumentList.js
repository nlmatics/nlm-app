import {
  CheckCircleOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FileOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  List,
  Modal,
  Pagination,
  Result,
  Row,
  Segmented,
  Space,
  Spin,
  Statistic,
  Tooltip,
  Typography,
  Grid,
} from 'antd';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DocumentContext from '../../../../contexts/document/DocumentContext.js';
import {
  fetchDashboardData,
  fetchDocuments,
  fetchPaginatedDocuments,
} from '../../../../utils/apiCalls.js';
import { roles } from '../../../../utils/constants';
import { dateDisplayFormat } from '../../../../utils/dateUtils.js';
import { useAuth } from '../../../../utils/use-auth.js';
import DataUpload from '../../../DataUpload';
import FileUpload from '../../../FileUpload';
import SiteIndexForm from '../../../SiteIndexForm.js';
import DocumentFieldsSummary from '../DocumentFieldsSummary/DocumentFieldsSummary.js';
import DocumentSelector from '../../DocumentSelector/DocumentSelector.js';
import useWorkspaceIngestionStats from '../../useWorkspaceIngestionStats.js';
import { WorkspaceContext } from '../../../WorkspaceContext';

import './index.less';
import AppContext from '../../../../contexts/app/AppContext.js';

// taken from https://plnkr.co/edit/CLmtxmVyxdjOlltp from https://github.com/ag-grid/ag-grid/issues/3458
// Fills in the Status column with the appropriate symbol. The forwardRef stops it from duplicating
// 'ready_for_ingestion' displays a clock
// 'ingest_inprogress' displays a spinner
// 'ingest_ok' displays a green check mark
// 'ingest_failed' displays a red exclamation mark
// unknown displays a question mark
const statusIconMap = {
  total: (
    <Tooltip title="Total documents">
      <FileOutlined />
    </Tooltip>
  ),
  ingest_ok: (
    <Tooltip title="Processed Successfully">
      <CheckCircleOutlined style={{ color: 'var(--success-color-green)' }} />
    </Tooltip>
  ),
  ingest_failed: (
    <Tooltip title="Processing Failed">
      <ExclamationCircleOutlined style={{ color: 'var(--error-color-red)' }} />
    </Tooltip>
  ),
  ingest_inprogress: (
    <Tooltip title="Processing...">
      <SyncOutlined spin />
    </Tooltip>
  ),
  ready_for_ingestion: (
    <Tooltip title="Queued for Processing">
      <LoadingOutlined />
    </Tooltip>
  ),
};

const progressMessages = {
  ready_for_ingestion: 'Creating table of contents...',
  ingest_inprogress: 'Linking and hilighting key terms...',
};

const isDocumentProcessed = (workspaceDocumentsIngestionStatus, docId) => {
  const docStatus = workspaceDocumentsIngestionStatus.find(
    ({ id }) => id === docId
  )?.status;
  return 'ingest_ok' === docStatus || 'ingest_failed' === docStatus;
};

// TODO: Refactor to limit functional complexity
export default function DocumentList({ workspaceDocumentsIngestionStatus }) {
  const { useBreakpoint } = Grid;
  const breakpoints = useBreakpoint();
  const { showDocument } = useContext(DocumentContext);
  const { isChattyPdf } = useContext(AppContext);
  let { workspaceId } = useParams();
  const { user } = useAuth();
  const workspaceContext = useContext(WorkspaceContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPage] = useState(false);
  const [dataUploadVisible, setDataUploadVisible] = useState(false);
  const [siteIndexFormVisible, setSiteIndexFormVisible] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [fetchingDocuments, setFetchingDocuments] = useState(false);
  const [documents, setDocuments] = useState(workspaceContext.documents);
  const [showUploadDocs, setShowUploadDocs] = useState(false);
  const [docListType, setDocListType] = useState('ALL');
  const [document, setDocument] = useState(null);
  const {
    data: workspaceIngestionStats = {},
    isLoading: isFetchingWorkspaceIngestionStats,
    useRefetchWorkspaceIngestionStats,
  } = useWorkspaceIngestionStats(workspaceId);
  const refetchWorkspaceIngestionStats = useRefetchWorkspaceIngestionStats();

  // From File Browser component inside LeftSider
  useEffect(() => {
    if (workspaceId) {
      (async () => {
        setFetchingDocuments(true);
        let documents = await fetchDocuments(
          user,
          workspaceId,
          workspaceContext.docListDocPerPage,
          0,
          null,
          workspaceContext.setDocuments,
          null,
          workspaceContext
        );
        fetchDashboardData(workspaceContext, workspaceId, documents);
        setFetchingDocuments(false);
      })();
    }
  }, [workspaceId]);

  useEffect(() => {
    setDocument(null);
  }, [workspaceId]);

  useEffect(() => {
    setDocuments(workspaceContext.documents);
  }, [workspaceContext.documents]);

  useEffect(() => {
    setDocuments(
      workspaceContext.documents.map(document => {
        const status = workspaceDocumentsIngestionStatus.find(
          ({ id }) => id === document.id
        )?.status;
        return {
          ...document,
          ...(status ? { status } : {}),
        };
      })
    );
  }, [workspaceDocumentsIngestionStatus, workspaceContext.documents]);

  useEffect(() => {
    if (workspaceDocumentsIngestionStatus && workspaceId) {
      refetchWorkspaceIngestionStats(workspaceId);
    }
  }, [workspaceDocumentsIngestionStatus, workspaceId]);

  // Updates the appropriate variables when the pagination page or size changes
  const handleDocListPageChange = async (page, pageSize) => {
    setCurrentPage(page);
    setLoadingDocs(true);
    await fetchPaginatedDocuments(
      workspaceId,
      pageSize,
      (page - 1) * pageSize,
      workspaceContext,
      'name'
    );
    setLoadingDocs(false);
  };

  const handleUploadMenuClick = params => {
    if (params.key === '1') {
      setDataUploadVisible(true);
    } else if (params.key === '2') {
      setSiteIndexFormVisible(true);
    }
  };

  const uploadOptions = isChattyPdf() ? null : (
    <Dropdown.Button
      menu={{
        items: [
          {
            key: '1',
            label: 'Import Data from Spreadsheet',
            icon: <FileExcelOutlined />,
          },
          {
            key: '2',
            label: 'Index Website Pages',
            icon: <CloudUploadOutlined />,
          },
        ],
        onClick: handleUploadMenuClick,
      }}
    >
      More Options
    </Dropdown.Button>
  );

  // Decides if it should display the file upload for when there are no found files
  const displayNoFilesUpload = () => {
    if (workspaceContext.currentUserRole !== roles.VIEWER) {
      return workspaceContext.currentWorkspace &&
        !workspaceContext.loadingDocuments ? (
        <Row justify="center">
          <Col span={breakpoints?.xs ? 24 : 8}>
            <Result
              title={
                <>
                  <span>No files in workspace.</span>
                  <br /> <span>Please upload a file to get started.</span>
                </>
              }
              extra={
                <>
                  <Row style={{ marginRight: 0, marginBottom: 15 }}>
                    <Col span={8} offset={16} style={{ textAlign: 'right' }}>
                      {uploadOptions}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <FileUpload
                        showInline={true}
                        workspaceDocumentsIngestionStatus={
                          workspaceDocumentsIngestionStatus
                        }
                      ></FileUpload>
                    </Col>
                  </Row>
                </>
              }
            />
          </Col>
        </Row>
      ) : (
        ''
      );
    } else {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
            flexDirection: 'column',
          }}
        >
          {fetchingDocuments ? (
            <Spin />
          ) : (
            <Result
              title={
                <>
                  <span>No files in workspace.</span>
                  <br />
                  <span>
                    Wait for the workspace owner to upload a file to view it.
                  </span>
                </>
              }
            />
          )}
        </div>
      );
    }
  };

  if (fetchingDocuments) {
    return <Spin style={{ width: '100%' }} />;
  }

  return (
    <>
      <DataUpload
        onClose={() => {
          setDataUploadVisible(false);
        }}
        visible={dataUploadVisible}
      />
      <Modal
        onCancel={() => {
          setSiteIndexFormVisible(false);
        }}
        okButtonProps={undefined}
        footer={null}
        width={'40vw'}
        title="Website Details"
        open={siteIndexFormVisible}
      >
        <div style={{ height: '60vh' }}>
          <SiteIndexForm
            onFinish={() => setSiteIndexFormVisible(false)}
          ></SiteIndexForm>
        </div>
      </Modal>
      {workspaceContext.documents.length > 0 ? (
        <>
          <Row gutter={[10, 10]} className="nlm-documentList">
            <Col span={document ? 12 : 24}>
              <Card
                bodyStyle={{
                  padding: 0,
                }}
                actions={
                  docListType === 'ALL'
                    ? [
                        <Pagination
                          key="documents-pagination"
                          style={{ marginTop: '10px' }}
                          size="small"
                          current={currentPage}
                          total={workspaceContext.totalDocCount}
                          pageSize={workspaceContext.docListDocPerPage}
                          onChange={handleDocListPageChange}
                          onShowSizeChange={(current, size) => {
                            workspaceContext.setDocListDocPerPage(size);
                          }}
                        />,
                      ]
                    : []
                }
                size="small"
                title={
                  <Row gutter={[10, 10]}>
                    {workspaceContext.currentUserRole !== roles.VIEWER && (
                      <Col>
                        {showUploadDocs ? (
                          <Button
                            shape="circle"
                            title="Close Upload Documents"
                            icon={<CloseOutlined />}
                            onClick={() => {
                              setShowUploadDocs(false);
                            }}
                          ></Button>
                        ) : (
                          <Button
                            shape="circle"
                            type="primary"
                            title="Upload Documents"
                            icon={<UploadOutlined />}
                            onClick={() => {
                              setShowUploadDocs(true);
                            }}
                          ></Button>
                        )}
                      </Col>
                    )}
                    {!breakpoints.xs && (
                      <Col>
                        <DocumentSelector
                          workspaceId={workspaceId}
                          documents={workspaceContext.documents}
                        />
                      </Col>
                    )}
                    <Col>
                      <Segmented
                        options={[
                          { label: 'All', value: 'ALL' },
                          { label: 'Recent', value: 'RECENT' },
                        ]}
                        value={docListType}
                        onChange={docListType => {
                          setDocument(null);
                          setDocListType(docListType);
                        }}
                      />
                    </Col>
                  </Row>
                }
                extra={
                  <Row gutter={[20, 20]} align="middle">
                    <Col>
                      <Tooltip title="Refresh">
                        <Button
                          type="link"
                          icon={<ReloadOutlined />}
                          onClick={() =>
                            refetchWorkspaceIngestionStats(workspaceId)
                          }
                          disabled={isFetchingWorkspaceIngestionStats}
                        ></Button>
                      </Tooltip>
                    </Col>
                    {Object.keys(workspaceIngestionStats).map(key => {
                      return (
                        <Col key={key}>
                          <Spin spinning={isFetchingWorkspaceIngestionStats}>
                            <Statistic
                              valueStyle={{ fontSize: 15 }}
                              value={workspaceIngestionStats[key]}
                              prefix={statusIconMap[key]}
                            />
                          </Spin>
                        </Col>
                      );
                    })}
                  </Row>
                }
              >
                {workspaceContext.currentUserRole !== roles.VIEWER &&
                  showUploadDocs && (
                    <Card
                      style={{ margin: 10 }}
                      size="small"
                      title={
                        <Typography.Title level={5}>Upload</Typography.Title>
                      }
                      extra={uploadOptions}
                      bodyStyle={{ height: 250 }}
                    >
                      <FileUpload
                        showInline={true}
                        workspaceDocumentsIngestionStatus={
                          workspaceDocumentsIngestionStatus
                        }
                      ></FileUpload>
                    </Card>
                  )}
                <List
                  style={{
                    height: `calc(100vh - ${
                      showUploadDocs
                        ? isChattyPdf()
                          ? 602
                          : 580
                        : isChattyPdf()
                        ? 290
                        : 240
                    }px)`,

                    overflow: 'auto',
                  }}
                  rowKey="id"
                  size="large"
                  loading={loadingPage || loadingDocs}
                  dataSource={
                    docListType === 'ALL'
                      ? documents
                      : workspaceContext.recentDocuments
                  }
                  renderItem={({
                    id,
                    name,
                    status,
                    fileSize,
                    createdOn,
                    meta: { title },
                    inferred_title,
                  }) => (
                    <List.Item
                      {...(id === document?.id
                        ? { className: 'document-list-item--selected' }
                        : { className: 'document-list-item' })}
                      onClick={() => {}}
                      actions={[
                        <Button
                          {...(isChattyPdf()
                            ? {
                                disabled: !isDocumentProcessed(
                                  workspaceDocumentsIngestionStatus,
                                  id
                                ),
                              }
                            : {})}
                          key="search-in-doc"
                          type="link"
                          title="Search in document"
                          icon={<SearchOutlined />}
                          {...(breakpoints?.xs
                            ? { style: { marginTop: 50 } }
                            : {})}
                          onClick={() =>
                            showDocument({
                              documentId: id,
                              docActiveTabKey: isChattyPdf() ? 'qna' : 'search',
                              documentIds: (docListType === 'ALL'
                                ? workspaceContext.documents
                                : workspaceContext.recentDocuments
                              )?.map(({ id }) => id),
                              onDelete: () => {
                                workspaceContext.setRefreshGrid(true);
                                refetchWorkspaceIngestionStats(workspaceId);
                              },
                            })
                          }
                        />,
                        ...(isChattyPdf()
                          ? []
                          : [
                              <Button
                                key="doc-fields-summary"
                                type="link"
                                title="View document summary"
                                icon={<EyeOutlined />}
                                onClick={() => setDocument({ id, name })}
                              />,
                            ]),
                      ]}
                    >
                      <List.Item.Meta
                        style={{ fontSize: 25 }}
                        title={
                          <Button
                            {...(isChattyPdf()
                              ? {
                                  disabled: !isDocumentProcessed(
                                    workspaceDocumentsIngestionStatus,
                                    id
                                  ),
                                }
                              : {})}
                            size="large"
                            type="link"
                            style={{
                              textAlign: 'left',
                              padding: 0,
                              height: 'auto',
                            }}
                            onClick={() =>
                              showDocument({
                                documentId: id,
                                docActiveTabKey: isChattyPdf()
                                  ? 'qna'
                                  : 'search',
                                documentIds: (docListType === 'ALL'
                                  ? workspaceContext.documents
                                  : workspaceContext.recentDocuments
                                )?.map(({ id }) => id),
                                onDelete: () => {
                                  workspaceContext.setRefreshGrid(true);
                                  refetchWorkspaceIngestionStats(workspaceId);
                                },
                              })
                            }
                          >
                            {name}
                          </Button>
                        }
                        avatar={statusIconMap[status]}
                        {...(progressMessages[status]
                          ? { description: progressMessages[status] }
                          : {
                              description: breakpoints?.xs
                                ? ''
                                : title || inferred_title,
                            })}
                      />
                      <Space
                        {...(breakpoints?.xs
                          ? { style: { marginTop: 50 } }
                          : {})}
                      >
                        <Typography.Text>
                          {createdOn
                            ? moment(createdOn).format(dateDisplayFormat)
                            : ''}
                        </Typography.Text>
                        <Divider type="vertical"></Divider>
                        <Typography.Text>
                          {fileSize
                            ? `${(fileSize / 1000 / 1000).toFixed(2)} MB`
                            : ''}
                        </Typography.Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            {document && (
              <Col span={12}>
                <DocumentFieldsSummary
                  documentId={document.id}
                  documentName={document.name}
                  closeSummary={() => setDocument(null)}
                />
              </Col>
            )}
          </Row>
        </>
      ) : (
        displayNoFilesUpload()
      )}
    </>
  );
}
