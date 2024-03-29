import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CodeOutlined,
  ExclamationCircleOutlined,
  FileMarkdownOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  LinkOutlined,
  MoreOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Checkbox,
  Col,
  Dropdown,
  Grid,
  Layout,
  message,
  PageHeader,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BaseDocument from '../../BaseDocument.js';
import DocumentOperations from '../../document/DocumentOperations/DocumentOperations.js';
import { useDocumentIngestionStatus } from '../../document/useDocumentIngestionStatus.js';
import { WorkspaceContext } from '../../WorkspaceContext.js';
import API from '../../../utils/API.js';
import { displayFormats, statusTypes } from '../../../utils/constants';
import usePageHelper from '../../../pages/hooks/usePageHelper.js';
import './index.less';
import DocInfoViewer from './DocInfoViewer';
import { cloneSearchCritera } from '../../../utils/helpers.js';
import useUserInfo from '../../../hooks/useUserInfo.js';
import AppContext from '../../../contexts/app/AppContext.js';
import chattypdfDarkTheme from '../../../assets/images/chattypdf-logo-horizontal-black-bg.svg';
import chattypdfLightTheme from '../../../assets/images/chattypdf-logo-horizontal-white-bg.svg';
import ThemeContext from '../../../contexts/theme/ThemContext.js';

const { Content } = Layout;

export default function Document({
  documentId: currentDocumentId,
  docActiveTabKey,
  onBack,
  fieldName,
  showAlternateAnswers = false,
  fieldBundleId,
  documentIds,
  onDelete,
  viewId,
}) {
  const { useBreakpoint } = Grid;
  const breakpoints = useBreakpoint();
  const { workspaceId } = useParams();
  const { isSearchPage } = usePageHelper();
  const documentHeight = 'calc(100vh - 80px)';
  const useStyles = makeStyles({
    docInfoView: {
      minHeight: documentHeight,
      height: documentHeight,
      overflowY: 'hidden',
      overflowX: 'hidden',
    },
  });
  const classes = useStyles();
  const workspaceContext = useContext(WorkspaceContext);
  const [displayFormat, setDisplayFormat] = useState(displayFormats.PDF);
  const [documentId, setDocumentId] = useState(currentDocumentId);
  const [isPdf, setIsPdf] = useState(true);
  const [isDocInfoVisible, setIsDocInfoVisible] = useState(!!docActiveTabKey);
  const [fileData, setFileData] = useState(null);
  const [detailVisible, setDetailVisible] = useState(showAlternateAnswers);
  const [record, setRecord] = useState(null);
  const [editedField, setEditedField] = useState([]);
  const { theme, THEMES } = useContext(ThemeContext);

  const [currentDocument, setCurrentDocument] = useState(null);
  const [isDocumentVisible, setIsDocumentVisible] = useState(false);
  const {
    isDocumentIngestionFailedJustNow,
    isDocumentIngestionSuccessfullyCompletedJustNow,
    updateDocumentIngestionStatus,
    isIngestionFailed,
    isIngestionInProgress,
    isReadyForIngestion,
  } = useDocumentIngestionStatus(documentId);
  const { data: userInfo } = useUserInfo();
  const { isChattyPdf } = useContext(AppContext);

  useEffect(() => {
    async function fetchDocumentById(documentId) {
      let config = {
        headers: {
          'Cache-Control': 'no-cache',
        },
      };
      const { data } = await API.get(`/document/${documentId}`, config);
      setCurrentDocument(data);

      // Still have few references of workspaceContext.currentDocument
      // that need to be dealt with.
      workspaceContext.setCurrentDocument(data);
    }
    documentId && fetchDocumentById(documentId);
  }, [documentId]);

  useEffect(() => {
    if (currentDocument && breakpoints) {
      setDisplayFormat(
        breakpoints?.xs
          ? displayFormats.HTML
          : currentDocument.mimeType === 'application/pdf'
          ? displayFormats.PDF
          : displayFormats.HTML
      );
      setIsPdf(currentDocument.mimeType === 'application/pdf');
    }
  }, [breakpoints, currentDocument]);

  // if the current document finished ingesting, displays message and loads document
  useEffect(() => {
    if (isDocumentIngestionSuccessfullyCompletedJustNow()) {
      message.success(`${currentDocument?.name} ingested successfully.`);
    } else if (isDocumentIngestionFailedJustNow()) {
      message.error(`${currentDocument?.name} failed to ingest.`);
    }
  }, [
    currentDocument?.name,
    isDocumentIngestionFailedJustNow,
    isDocumentIngestionSuccessfullyCompletedJustNow,
  ]);

  useEffect(() => {
    async function fetchDocumentByFormat(displayFormat) {
      workspaceContext.setLoadingBasedocument(true);
      let data = {
        params: {
          workspaceId,
          renderFormat: displayFormat.toLowerCase() === 'xml' ? 'xml' : 'json',
        },
        headers: {
          'Cache-Control': 'no-cache',
        },
      };

      try {
        const res = await API.get(`/document/download/${documentId}`, data);
        setFileData(res.data);
      } catch (error) {
        console.info(error);
        setFileData(null);
      } finally {
        workspaceContext.setLoadingBasedocument(false);
      }
    }
    documentId &&
      displayFormat !== displayFormats.PDF &&
      fetchDocumentByFormat(displayFormat);
  }, [displayFormat, documentId, workspaceId]);

  const changeToPdfView = () => {
    setDisplayFormat(displayFormats.PDF);
  };

  const changeToHTMLView = () => {
    workspaceContext.setIframe(null);
    setDisplayFormat(displayFormats.HTML);
  };

  const changeToJSONView = () => {
    workspaceContext.setIframe(null);
    setDisplayFormat(displayFormats.JSON);
  };

  const changeToXMLView = () => {
    workspaceContext.setIframe(null);
    setDisplayFormat(displayFormats.XML);
  };

  const fileTypeSwitch = (
    <>
      <Dropdown
        menu={{
          items: [
            ...(isPdf
              ? [
                  {
                    key: displayFormats.PDF,
                    label: 'PDF',
                    icon: <FilePdfOutlined />,
                  },
                ]
              : []),
            {
              key: displayFormats.HTML,
              label: 'HTML',
              icon: <FileTextOutlined />,
            },
            {
              key: displayFormats.JSON,
              label: 'JSON',
              icon: <CodeOutlined />,
            },
            {
              key: displayFormats.XML,
              label: 'XML',
              icon: <FileMarkdownOutlined />,
            },
          ],
          onClick: ({ key }) => {
            switch (key) {
              case displayFormats.PDF:
                changeToPdfView();
                break;
              case displayFormats.HTML:
                changeToHTMLView();
                break;
              case displayFormats.JSON:
                changeToJSONView();
                break;
              case displayFormats.XML:
                changeToXMLView();
                break;
            }
          },
          selectedKeys: [displayFormat],
        }}
      >
        <Button>
          <Space>
            {displayFormat}
            <MoreOutlined />
          </Space>
        </Button>
      </Dropdown>
    </>
  );

  // creates the ingestion status tag based the on the doc ingestion status
  const createTags = () => {
    if (isReadyForIngestion()) {
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="default">
          queued for processing
        </Tag>
      );
    } else if (isIngestionInProgress()) {
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          processing
        </Tag>
      );
    } else if (isIngestionFailed()) {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          failed
        </Tag>
      );
    } else {
      // Ingestion is completed
      return null;
    }
  };

  const renderRowData = data => {
    let editedFieldFromWorkspaceGrid = null;
    if (Array.isArray(data)) {
      let newRowData = data.map(arrElement => {
        let answerArray = arrElement['topic_facts'];
        let answerItem = answerArray[0];
        let cellValue = '';
        if (answerItem) {
          if (answerItem.answer_details) {
            cellValue = answerItem.answer_details.raw_value;
          } else {
            cellValue = answerItem.formatted_answer;
          }
        }
        let rowData = {
          status:
            answerItem &&
            (answerItem.is_override
              ? statusTypes.OVERRIDEN
              : answerItem.scaled_score < statusTypes.CONFIDENCE_LEVEL
              ? statusTypes.LOW_CONFIDENCE
              : statusTypes.NORMAL),
          field: arrElement.topic,
          fieldName: arrElement.topic,
          fieldId: arrElement.topicId,
          dataType: arrElement.dataType,
          options: arrElement.options,
          isEnteredField: arrElement.isEnteredField,
          count: answerArray.length,
          value: cellValue,
          isGrouped:
            arrElement.criterias &&
            arrElement.criterias.length > 0 &&
            arrElement.criterias[0].groupFlag === 'enable',
          answerItem: answerItem,
          topic_facts: answerArray,
          answer:
            answerArray.length &&
            arrElement.criterias &&
            arrElement.criterias.length > 0
              ? arrElement.criterias[0].templates[0]
              : '',
          question:
            arrElement.criterias && arrElement.criterias.length > 0
              ? arrElement.criterias[0].question
              : '',
          searchCriteria: {
            postProcessors: arrElement.post_processors,
          },
        };
        if (arrElement.topicId === workspaceContext.workspaceEditedFieldId) {
          editedFieldFromWorkspaceGrid = rowData;
        }
        return rowData;
      });
      if (editedFieldFromWorkspaceGrid) {
        setEditedField(editedFieldFromWorkspaceGrid);
      }
      return newRowData;
    }
  };

  const docPermLink = isSearchPage
    ? `${window.location.origin}/search/${workspaceId}/${documentId}/search`
    : `${window.location.origin}/workspace/${workspaceId}/document/${documentId}/search`;

  const setDocumentSearchResults = documentId => {
    const fileFacts = workspaceContext.searchResults?.fileFacts?.filter(
      fact => fact.fileIdx === documentId
    );
    workspaceContext.setDocSearchResults({
      empty: fileFacts?.length === 0,
      results: fileFacts,
    });
    workspaceContext.setDocSearchCriteria(
      cloneSearchCritera(workspaceContext.workspaceSearchCriteria)
    );
  };

  return (
    <PageHeader
      {...(isChattyPdf()
        ? {
            title: (
              <Row
                style={{
                  width: `calc(100vw - ${breakpoints?.xs ? 0 : 150}px)`,
                }}
              >
                <Col span={6}>
                  <img
                    width={86}
                    src={
                      theme === THEMES.LIGHT
                        ? chattypdfLightTheme
                        : chattypdfDarkTheme
                    }
                    alt="Chatty PDF Logo"
                  />
                </Col>

                <Col span={18}>
                  <Typography.Text>{currentDocument?.name}</Typography.Text>
                </Col>
              </Row>
            ),
          }
        : {
            title: currentDocument?.name,
            subTitle: currentDocument?.meta?.title,
          })}
      onBack={onBack}
      backIcon={<CloseOutlined />}
      className="nlm-page-document"
      style={{ padding: 0 }}
      tags={createTags()}
      extra={
        <>
          {documentIds?.length && (
            <>
              <Tooltip title="Previous document">
                <Button
                  disabled={documentIds.indexOf(documentId) === 0}
                  icon={<ArrowLeftOutlined />}
                  onClick={() => {
                    /*
                      Change in currentDocument and documentData results in multiple renders of pdf.
                      Hence resetting it.
                 */
                    setCurrentDocument(null);
                    const docId =
                      documentIds[documentIds.indexOf(documentId) - 1];
                    setDocumentId(docId);
                    setDocumentSearchResults(docId);
                  }}
                ></Button>
              </Tooltip>
              <Tooltip title="Next document">
                <Button
                  style={{ marginRight: 10 }}
                  disabled={
                    documentIds.indexOf(documentId) === documentIds.length - 1
                  }
                  icon={<ArrowRightOutlined />}
                  onClick={() => {
                    /*
                      Change in currentDocument and documentData results in multiple renders of pdf.
                      Hence resetting it.
                  */
                    setCurrentDocument(null);

                    const docId =
                      documentIds[documentIds.indexOf(documentId) + 1];
                    setDocumentId(docId);
                    setDocumentSearchResults(docId);
                  }}
                ></Button>
              </Tooltip>
            </>
          )}
          {!isChattyPdf() && (
            <Typography.Text
              copyable={{
                text: docPermLink,
              }}
            >
              <LinkOutlined title="Permanent link to document" />
            </Typography.Text>
          )}
          {fileTypeSwitch}
          {!isSearchPage && (
            <DocumentOperations
              currentDocument={currentDocument}
              currentUserRole={workspaceContext.currentUserRole}
              currentWorkspaceEditable={
                workspaceContext.currentWorkspaceEditable
              }
              documentId={documentId}
              isDocumentIngestionInProgress={
                isReadyForIngestion() || isIngestionInProgress()
              }
              updateDocumentIngestionStatus={() => {
                updateDocumentIngestionStatus();
              }}
              workspaceContext={workspaceContext}
              workspaceId={workspaceId}
              userInfo={userInfo}
              onDelete={onDelete}
            />
          )}
          {breakpoints.xs && (
            <Checkbox
              defaultChecked={false}
              checked={isDocumentVisible}
              onChange={event => setIsDocumentVisible(event.target.checked)}
            >
              Show <FileOutlined />
            </Checkbox>
          )}
        </>
      }
    >
      <Content>
        <Row gutter={[10, 10]} wrap={breakpoints?.xs}>
          {!isDocumentVisible && (
            <Col
              className={classes.docInfoView}
              {...(isDocInfoVisible
                ? { xs: { span: 24 }, lg: { span: 7 } }
                : { flex: '42px' })}
            >
              <DocInfoViewer
                docActiveTabKey={docActiveTabKey}
                documentId={documentId}
                documentName={currentDocument?.name}
                workspaceId={workspaceId}
                setDetailVisible={setDetailVisible}
                record={record}
                renderRowData={renderRowData}
                editedField={editedField}
                setEditedField={setEditedField}
                fieldName={fieldName}
                setRecord={setRecord}
                fieldBundleId={fieldBundleId}
                detailVisible={detailVisible}
                isDocInfoVisible={isDocInfoVisible}
                setIsDocInfoVisible={setIsDocInfoVisible}
                viewId={viewId}
              />
            </Col>
          )}
          <Col
            {...(isDocInfoVisible
              ? { xs: { span: 24 }, lg: { span: 17 } }
              : { flex: 'auto' })}
          >
            <BaseDocument
              currentDocument={currentDocument}
              displayFormat={displayFormat}
              fileData={fileData}
              documentId={documentId}
              workspaceId={workspaceId}
              documentHeight={documentHeight}
            />
          </Col>
        </Row>
      </Content>
    </PageHeader>
  );
}
