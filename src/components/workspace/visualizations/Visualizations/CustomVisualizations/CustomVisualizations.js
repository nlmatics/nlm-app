import {
  CompressOutlined,
  DeleteOutlined,
  ExpandOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Input, Popconfirm, Result, Row } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useFieldBundles from '../../../fields/useFieldBundles';
import useFieldManager from '../../../fields/useFieldManager';
import useVisualizationsManager from '../../useVisualizationsManager';
import { chartTypes } from '../../utils';
import Visualization from '../Visualization/Visualization';
export default function CustomVisualizations({ workspaceId, fieldFilters }) {
  const [expandedId, setExpandedId] = useState(null);
  const [fieldBundleId, setFieldBundleId] = useState(null);
  const { useVisualizations, useDeleteVisualization } =
    useVisualizationsManager();
  const [filteredVisualizations, setFilteredVisualizations] = useState([]);
  const [visualizations, setVisualizations] = useState([]);
  const { data: advancedVisualizations = null } = useVisualizations({
    workspaceId,
  });
  const deleteVisualizationMutation = useDeleteVisualization(workspaceId);

  const { data: fieldBundles, isLoading: isFetchingFieldBundles } =
    useFieldBundles(workspaceId);
  const { useFields } = useFieldManager();
  const { data: allFields } = useFields(fieldBundleId);

  useEffect(() => {
    if (!isFetchingFieldBundles) {
      setFieldBundleId(fieldBundles && fieldBundles[0]?.id);
    }
  }, [fieldBundles, isFetchingFieldBundles, fieldBundleId]);

  const expandStyle = {
    width: 'calc(100vw - 80px)',
    position: 'fixed',
    zIndex: '1',
    left: 65,
    top: 115,
    height: 'calc(100vh - 130px)',
  };

  useEffect(() => {
    if (advancedVisualizations) {
      const visualizations = [
        ...advancedVisualizations?.filter(
          ({ options: { isVisualization } }) => isVisualization
        ),
      ];
      setVisualizations(visualizations);
      setFilteredVisualizations(visualizations);
    }
  }, [advancedVisualizations]);

  if (!visualizations.length) {
    return (
      <Result
        title="No custom charts created."
        extra={
          <Link to={`/workspace/${workspaceId}/extractions/data`}>
            <Button
              size="large"
              type="primary"
              icon={<PlusOutlined></PlusOutlined>}
            >
              Create New Custom Chart
            </Button>
          </Link>
        }
      />
    );
  }
  let spanCount = 0;
  const getSpan = (chartType, index) => {
    spanCount += chartType === chartTypes.BOOLEAN ? 4 : 6;
    let span = chartType === chartTypes.BOOLEAN ? 4 : 6;
    const nextSpan =
      filteredVisualizations[index + 1]?.options?.chartType ===
      chartTypes.BOOLEAN
        ? 4
        : 6;

    if (spanCount + nextSpan > 24) {
      span += 24 - spanCount;
      spanCount = 0;
    }
    return span;
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
              <Col span={6}>
                <Input
                  style={{ marginRight: 20, width: '100%' }}
                  allowClear
                  placeholder="Search by name"
                  addonBefore={<SearchOutlined />}
                  onChange={({ target: { value: query } }) => {
                    setFilteredVisualizations(
                      visualizations.filter(({ name }) =>
                        name.toLowerCase().includes(query.toLowerCase())
                      )
                    );
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {!!filteredVisualizations.length && (
        <Row
          gutter={[10, 10]}
          style={{
            position: 'relative',
            overflow: 'hidden auto',
            height: 'calc(100vh - 195px)',
          }}
        >
          {filteredVisualizations?.map(
            (
              {
                name,
                options: {
                  rowGroupCols,
                  fieldSetId,
                  chartType,
                  valueCols,
                  filterModel,
                },
                id,
                type,
              },
              index
            ) => {
              const expandedStyle = id === expandedId ? expandStyle : {};
              return (
                <Col key={id} span={getSpan(chartType, index)}>
                  <Card
                    style={{ ...expandedStyle }}
                    title={name}
                    size={'small'}
                    bodyStyle={{
                      padding: 8,
                      height: id === expandedId ? 'calc(100vh - 200px)' : 260,
                    }}
                    extra={
                      <>
                        <Button
                          size="small"
                          style={{ border: 'none' }}
                          icon={
                            id === expandedId ? (
                              <CompressOutlined />
                            ) : (
                              <ExpandOutlined />
                            )
                          }
                          onClick={() => {
                            setExpandedId(expandedId ? null : id);
                          }}
                        />
                        {type !== 'simple' && (
                          <Popconfirm
                            title={`Are you sure?`}
                            onConfirm={async () => {
                              await deleteVisualizationMutation.mutateAsync(id);
                            }}
                            okText="Yes"
                            cancelText="No"
                            placement="bottom"
                          >
                            <Button
                              size="small"
                              style={{ border: 'none' }}
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        )}
                      </>
                    }
                  >
                    <Visualization
                      height={200}
                      rowGroupCols={rowGroupCols}
                      fieldBundleId={fieldSetId}
                      workspaceId={workspaceId}
                      isExpanded={id === expandedId}
                      chartType={chartType}
                      allFields={allFields}
                      valueCols={valueCols}
                      filterModel={{ ...filterModel, ...(fieldFilters || {}) }}
                    />
                  </Card>
                </Col>
              );
            }
          )}
        </Row>
      )}
    </>
  );
}
