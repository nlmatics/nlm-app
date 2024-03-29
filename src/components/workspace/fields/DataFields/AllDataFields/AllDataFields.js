import {
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Progress,
  Row,
  Skeleton,
  Tooltip,
  Typography,
} from 'antd';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import ThemeContext from '../../../../../contexts/theme/ThemContext';
import useUserPermission from '../../../../../hooks/useUserPermission';
import { roles } from '../../../../../utils/constants';
import {
  clearWorkspaceSearchCriteria,
  clearWorkspaceSearchResults,
} from '../../../../../utils/helpers';
import { WorkspaceContext } from '../../../../WorkspaceContext';
import WorkspaceGridDeleteFieldModal from '../../../../WorkspaceGridDeleteFieldModal';
import WorkspaceGridRenameFieldModal from '../../../../WorkspaceGridRenameFieldModal';
import { downloadAllFields } from '../../../fetcher';
import FieldBundleSelector from '../../../FieldBundleSelector';
import useFieldBundles from '../../useFieldBundles';
import useFieldManager from '../../useFieldManager';
import useFieldsExtractionStatus from '../../useFieldsExtractionStatus';

import DataFieldViewer from './DataFieldViewer';
import FieldDefinitionsUploader from './FieldDefinitionsUploader';
import './index.less';

export default function AllDataFields({ workspaceId, url }) {
  const workspaceContext = useContext(WorkspaceContext);
  const location = useLocation();
  const newFieldId = location?.state?.id;
  const history = useHistory();
  const dataFieldCardElement = useRef(null);
  const [fieldBundleId, setFieldBundleId] = useState(null);
  const [dataField, setDataField] = useState();
  const [isUploadVisible, setIsUploadVisible] = useState(false);
  const [filteredDataFieldsMetaData, setFilteredDataFieldsMetaData] = useState(
    []
  );
  const [dataFieldsMetaData, setDataFieldsMetaData] = useState([]);
  const [fieldToBeDeleted, setFieldToBeDeleted] = useState('');
  const [fieldToBeRenamed, setFieldToBeRenamed] = useState('');
  const [showDeleteFieldModal, setShowDeleteFieldModal] = useState(false);
  const [showRenameFieldModal, setShowRenameFieldModal] = useState(false);

  const { fieldsExtractionStatus } = useFieldsExtractionStatus(fieldBundleId);
  const {
    data: fieldBundles,
    isLoading: isFetchingFieldBundles,
    useRefetchFieldBundles,
  } = useFieldBundles(workspaceId);
  const { useFields, useDeleteField, useRenameField, useRefetchFields } =
    useFieldManager();
  const { data: fields, isLoading: isFetchingField } = useFields(fieldBundleId);
  const deleteFieldMutation = useDeleteField(fieldBundleId);
  const renameFieldMutation = useRenameField(fieldBundleId);
  const refetchFields = useRefetchFields();
  const refetchFieldBundles = useRefetchFieldBundles();
  const { isAllowedToCreateField } = useUserPermission();
  const { BRAND_COLOR } = useContext(ThemeContext);

  useEffect(() => {
    if (!isFetchingFieldBundles && !fieldBundleId) {
      setFieldBundleId(fieldBundles && fieldBundles[0]?.id);
    }
  }, [fieldBundles, isFetchingFieldBundles, fieldBundleId]);

  useEffect(() => {
    if (!isFetchingField && !isFetchingFieldBundles && fieldBundleId) {
      const dataFields = fields.filter(({ isEnteredField }) => !isEnteredField);
      const orderedDataFieldsMetaData =
        fieldBundles &&
        fieldBundles
          .find(({ id }) => id === fieldBundleId)
          ?.fieldIds.flatMap(fieldId => {
            const dataField = dataFields.find(({ id }) => id === fieldId);
            return dataField ? [dataField] : [];
          });

      setFilteredDataFieldsMetaData(orderedDataFieldsMetaData);
      setDataFieldsMetaData(orderedDataFieldsMetaData);
    }
  }, [
    fields,
    isFetchingField,
    fieldBundles,
    isFetchingFieldBundles,
    fieldBundleId,
  ]);

  const scrollToSelectedDataField = () => {
    const waitForElementAndScroll = () => {
      if (dataFieldCardElement.current) {
        dataFieldCardElement.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      } else {
        requestAnimationFrame(waitForElementAndScroll);
      }
    };
    waitForElementAndScroll();
  };

  useEffect(() => {
    if (newFieldId) {
      setDataField(
        filteredDataFieldsMetaData.find(({ id }) => id === newFieldId)
      );
      scrollToSelectedDataField();
    }
  }, [newFieldId, filteredDataFieldsMetaData]);

  useEffect(() => {
    newFieldId && refetchFieldBundles(workspaceId);
  }, [newFieldId, workspaceId]);

  const getActions = dataFieldItem => {
    const actions = [
      <EyeOutlined
        title="View data"
        key={'view'}
        onClick={() => {
          dataFieldCardElement.current = null;
          setDataField(dataFieldItem);
          scrollToSelectedDataField();
        }}
      />,
    ];

    isAllowedToCreateField() &&
      actions.push(
        ...[
          <EditOutlined
            title="Refine field"
            onClick={async () => {
              workspaceContext.resetSearchResults();
              workspaceContext.resetWorkspaceSearchCriteria();
              history.push({
                pathname: `${url}/refine/${dataFieldItem.id}`,
                state: {
                  from: `${url}/all`,
                  fieldBundleId,
                },
              });
            }}
            key="refine"
          />,

          <DeleteOutlined
            title="Delete field"
            key="delete"
            onClick={() => {
              setFieldToBeDeleted({
                id: dataFieldItem.id,
                name: dataFieldItem.name,
              });
              setShowDeleteFieldModal(true);
            }}
          />,
        ]
      );
    return actions;
  };

  const onDeleteCallback = useCallback(() => {
    message.info(`${fieldToBeDeleted.name} deleted successfully.`);
    // If selected dataField is deleted then hide right side details view
    if (fieldToBeDeleted.id === dataField?.id) {
      setDataField(null);
    }
  }, [fieldToBeDeleted, dataField?.id]);

  const onRenameCallback = useCallback(({ newFieldName, oldFieldName }) => {
    message.info(`${oldFieldName} renamed to ${newFieldName} successfully.`);
  }, []);

  const getProgress = item => {
    // Get status from the `fieldsExtractionStatus` if available
    // since it is fetched at regular intervals
    // if not available fallback to item.status
    const status =
      fieldsExtractionStatus.find(({ field_id }) => field_id === item.id)
        ?.status || item.status;
    let percentComplete = Math.round(
      ((status.done + 1) * 100) / (status.total + 1)
    );
    return (
      <Tooltip
        title={
          status.done && status.total
            ? `${status.done}/${status.total} extracted`
            : ''
        }
      >
        {percentComplete >= 100 ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircleOutlined
              style={{
                color: 'green',
                fontSize: 20,
              }}
            />
          </div>
        ) : (
          <Progress
            status="active"
            percent={percentComplete}
            type="line"
            strokeWidth={3}
            strokeColor={BRAND_COLOR}
          />
        )}
      </Tooltip>
    );
  };

  const getFieldBundleNameById = ({ fieldBundles, fieldBundleId }) => {
    return fieldBundles.find(({ id }) => id === fieldBundleId)?.bundleName;
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <Card
            bordered={false}
            bodyStyle={{ padding: 0, marginBottom: '10px' }}
          >
            <Row
              gutter={[10, 10]}
              align="middle"
              style={{
                width: '100%',
                padding: '10px',
              }}
            >
              <Col span={4}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Data Fields
                </Typography.Title>
              </Col>
              <Col span={4}>
                <Input
                  style={{ marginRight: 20, width: '100%' }}
                  allowClear
                  placeholder="Search by name"
                  addonBefore={<SearchOutlined />}
                  onChange={({ target: { value: query } }) => {
                    setFilteredDataFieldsMetaData(
                      dataFieldsMetaData.filter(({ name }) =>
                        name.toLowerCase().includes(query.toLowerCase())
                      )
                    );
                  }}
                />
              </Col>
              <Col span={5}>
                <Row gutter={[5, 5]}>
                  <Col flex="auto">
                    <FieldBundleSelector
                      fieldBundleId={fieldBundleId}
                      fieldBundles={fieldBundles}
                      onSelect={fieldBundleId => {
                        setFieldBundleId(fieldBundleId);
                        setDataField(null);
                      }}
                    />
                  </Col>
                  <Col>
                    <Tooltip title="Download all field definitions">
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() =>
                          downloadAllFields({
                            fieldBundleId,
                            fieldBundleName: getFieldBundleNameById({
                              fieldBundles,
                              fieldBundleId,
                            }),
                          })
                        }
                      ></Button>
                    </Tooltip>
                  </Col>
                  {workspaceContext.currentUserRole !== roles.VIEWER && (
                    <Col>
                      <Tooltip title="Upload field definitions">
                        <Button
                          icon={
                            isUploadVisible ? (
                              <CloseOutlined />
                            ) : (
                              <UploadOutlined />
                            )
                          }
                          onClick={() => setIsUploadVisible(!isUploadVisible)}
                        ></Button>
                      </Tooltip>
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col
          span={dataField ? 12 : 24}
          style={{
            height: 'calc(100vh - 192px)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Row gutter={[10, 10]}>
            {isAllowedToCreateField() && (
              <Col span={dataField ? 8 : 4}>
                {isUploadVisible ? (
                  <Card
                    size="small"
                    className="nlm-fields__upload-field"
                    bordered={false}
                  >
                    <FieldDefinitionsUploader
                      fieldBundleId={fieldBundleId}
                      onUploadSuccess={async () => {
                        refetchFields(fieldBundleId);
                        setIsUploadVisible(false);
                      }}
                      onUploadError={error => {
                        message.error({
                          content: `${error}`,
                          duration: 3,
                        });
                        console.error(error);
                        setIsUploadVisible(false);
                      }}
                    />
                  </Card>
                ) : (
                  <Card
                    size="small"
                    className="nlm-fields__new-field"
                    bordered={false}
                  >
                    <Button
                      size="large"
                      shape="circle"
                      type="primary"
                      title="Create new field"
                      icon={<PlusOutlined></PlusOutlined>}
                      onClick={() => {
                        clearWorkspaceSearchCriteria(workspaceContext);
                        clearWorkspaceSearchResults(workspaceContext);
                        workspaceContext.setFieldEditData(null);
                        history.push({
                          pathname: `${url}/new`,
                          state: {
                            from: `${url}/all`,
                          },
                        });
                      }}
                    ></Button>
                  </Card>
                )}
              </Col>
            )}
            {(filteredDataFieldsMetaData?.length || !isFetchingField
              ? filteredDataFieldsMetaData
              : [{}, {}, {}, {}, {}]
            ).map(item => (
              <Col span={dataField ? 8 : 4} key={item.id}>
                <Skeleton
                  loading={isFetchingField}
                  active
                  paragraph={{ rows: 5 }}
                >
                  <Card
                    style={{
                      ...(dataField && dataField.id === item.id
                        ? { borderColor: BRAND_COLOR }
                        : {}),
                    }}
                    size="small"
                    className="nlm-fields__field"
                    extra={
                      isAllowedToCreateField() && (
                        <Button
                          size="small"
                          style={{ border: 'none', opacity: '0.45' }}
                          onClick={() => {
                            setShowRenameFieldModal(true);
                            setFieldToBeRenamed({
                              id: item.id,
                              name: item.name,
                            });
                          }}
                          icon={<EditOutlined />}
                        />
                      )
                    }
                    title={
                      <Typography.Title level={5} ellipsis>
                        {item.name}
                      </Typography.Title>
                    }
                    actions={getActions(item)}
                    {...(dataField && dataField.id === item.id
                      ? { ref: dataFieldCardElement }
                      : {})}
                  >
                    {item?.status && getProgress(item)}
                    <Typography.Paragraph ellipsis={{ rows: 2 }}>
                      {item?.searchCriteria?.criterias[0]?.question}
                    </Typography.Paragraph>
                  </Card>
                </Skeleton>
              </Col>
            ))}
          </Row>
        </Col>
        <Col span={dataField ? 12 : 0} style={{ padding: '0 10px' }}>
          {dataField && (
            <DataFieldViewer
              workspaceId={workspaceId}
              dataField={dataField}
              setDataField={setDataField}
              fieldBundleId={fieldBundleId}
              fields={fields}
            />
          )}
        </Col>
      </Row>
      {showDeleteFieldModal && (
        <WorkspaceGridDeleteFieldModal
          fieldToBeDeleted={fieldToBeDeleted}
          hideModal={() => {
            setShowDeleteFieldModal(false);
          }}
          deleteField={deleteFieldMutation.mutateAsync}
          onDeleteCallback={onDeleteCallback}
        />
      )}
      {showRenameFieldModal && (
        <WorkspaceGridRenameFieldModal
          fieldToBeRenamed={fieldToBeRenamed}
          hideModal={() => setShowRenameFieldModal(false)}
          renameField={renameFieldMutation.mutateAsync}
          onRenameCallback={onRenameCallback}
        />
      )}
    </>
  );
}
