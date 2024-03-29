import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Progress,
  Result,
  Row,
  Skeleton,
  Tooltip,
  Typography,
} from 'antd';
import { useContext, useEffect, useState } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import ThemeContext from '../../../../../contexts/theme/ThemContext';
import useUserPermission from '../../../../../hooks/useUserPermission';
import WorkspaceGridDeleteFieldModal from '../../../../WorkspaceGridDeleteFieldModal';
import FieldBundleSelector from '../../../FieldBundleSelector';
import useFieldBundles from '../../useFieldBundles';
import useFieldManager from '../../useFieldManager';

import './index.less';

export default function AllWorkflowFields({ workspaceId, url }) {
  const { url: newDataFieldUrl } = useRouteMatch(
    '/workspace/:workspaceId/:activeMenuKey'
  );
  const [fieldBundleId, setFieldBundleId] = useState(null);
  const history = useHistory();
  const [filteredWorkflowFieldsMetaData, setFilteredWorkflowFieldsMetaData] =
    useState([]);

  const [workflowFieldsMetaData, setWorkflowFieldsMetaData] = useState([]);
  const [dataFieldsPresent, setDataFieldsPresent] = useState(true);
  const [fieldToBeDeleted, setFieldToBeDeleted] = useState('');
  const [showDeleteFieldModal, setShowDeleteFieldModal] = useState(false);
  const { isAllowedToCreateField } = useUserPermission();
  const { BRAND_COLOR } = useContext(ThemeContext);

  const { data: fieldBundles, isLoading: isFetchingFieldBundles } =
    useFieldBundles(workspaceId);
  const { useFields, useDeleteField } = useFieldManager();
  const { data: fields, isLoading: isFetchingFieldsMetaData } =
    useFields(fieldBundleId);
  const deleteFieldMutation = useDeleteField(fieldBundleId);
  useEffect(() => {
    if (!isFetchingFieldBundles && !fieldBundleId) {
      setFieldBundleId(fieldBundles && fieldBundles[0]?.id);
    }
  }, [fieldBundles, isFetchingFieldBundles, fieldBundleId]);

  useEffect(() => {
    if (!isFetchingFieldsMetaData && !isFetchingFieldBundles && fieldBundleId) {
      const workflowFields = fields.filter(
        ({ isEnteredField, isDependentField }) =>
          isEnteredField && !isDependentField
      );
      const orderedWorkflowFields =
        fieldBundles &&
        fieldBundles
          .find(({ id }) => id === fieldBundleId)
          ?.fieldIds.flatMap(fieldId => {
            const workflowField = workflowFields.find(
              ({ id }) => id === fieldId
            );
            return workflowField ? [workflowField] : [];
          });

      setFilteredWorkflowFieldsMetaData(orderedWorkflowFields);
      setWorkflowFieldsMetaData(orderedWorkflowFields);
      setDataFieldsPresent(
        fields.filter(({ isEnteredField }) => !isEnteredField)?.length > 0
      );
    }
  }, [
    fields,
    isFetchingFieldsMetaData,
    fieldBundles,
    isFetchingFieldBundles,
    fieldBundleId,
  ]);

  const getActions = workflowField => {
    return isAllowedToCreateField()
      ? [
          <EditOutlined
            onClick={() => {
              history.push({
                pathname: `${url}/${workflowField.id}`,
              });
            }}
            key="refine"
          />,
          <DeleteOutlined
            title="Delete field"
            key="delete"
            onClick={() => {
              setFieldToBeDeleted({
                id: workflowField.id,
                name: workflowField.name,
              });
              setShowDeleteFieldModal(true);
            }}
          />,
        ]
      : [];
  };

  const onDeleteCallback = async () => {
    message.info(`${fieldToBeDeleted.name} deleted successfully.`);
  };

  const getProgress = item => {
    let percentComplete = Math.round(
      ((item.status.done + 1) * 100) / (item.status.total + 1)
    );
    return (
      <Tooltip
        title={
          item.status.done && item.status.total
            ? `${item.status.done}/${item.status.total} extracted`
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
                  Workflow Fields
                </Typography.Title>
              </Col>
              <Col span={4}>
                <Input
                  style={{ marginRight: 20, width: '100%' }}
                  allowClear
                  placeholder="Search by name"
                  addonBefore={<SearchOutlined />}
                  onChange={({ target: { value: query } }) => {
                    setFilteredWorkflowFieldsMetaData(
                      workflowFieldsMetaData.filter(({ name }) =>
                        name.toLowerCase().includes(query.toLowerCase())
                      )
                    );
                  }}
                />
              </Col>
              <Col span={4}>
                <FieldBundleSelector
                  fieldBundleId={fieldBundleId}
                  fieldBundles={fieldBundles}
                  onSelect={fieldBundleId => setFieldBundleId(fieldBundleId)}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col
          span={24}
          style={{
            height: 'calc(100vh - 192px)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {dataFieldsPresent || isFetchingFieldsMetaData ? (
            <Row gutter={[10, 10]}>
              {isAllowedToCreateField() && (
                <Col span={4}>
                  <Card
                    size="small"
                    className="nlm-fields__new-field"
                    bordered={false}
                  >
                    <Link
                      to={{
                        pathname: `${url}/new`,
                        state: {
                          fieldBundleId,
                        },
                      }}
                    >
                      <Button
                        size="large"
                        shape="circle"
                        type="primary"
                        title="Create new field"
                        icon={<PlusOutlined></PlusOutlined>}
                      ></Button>
                    </Link>
                  </Card>
                </Col>
              )}

              {(filteredWorkflowFieldsMetaData?.length ||
              !isFetchingFieldsMetaData
                ? filteredWorkflowFieldsMetaData
                : [{}, {}, {}, {}, {}]
              ).map(item => (
                <Col span={4} key={item.id}>
                  <Skeleton
                    loading={isFetchingFieldsMetaData}
                    active
                    paragraph={{ rows: 5 }}
                  >
                    <Card
                      size="small"
                      className="nlm-fields__field"
                      title={
                        <Typography.Title level={5} ellipsis>
                          {item.name}
                        </Typography.Title>
                      }
                      actions={getActions(item)}
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
          ) : (
            <Row gutter={[10, 10]} justify="center">
              <Col span={24}>
                {isAllowedToCreateField() && (
                  <Result
                    title="At least 1 Data Field required before you create a Workflow Field."
                    extra={
                      <Link to={`${newDataFieldUrl}/dataFields/new`}>
                        <Button
                          size="large"
                          type="primary"
                          icon={<PlusOutlined></PlusOutlined>}
                        >
                          Create New Data Field
                        </Button>
                      </Link>
                    }
                  />
                )}
              </Col>
            </Row>
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
    </>
  );
}
