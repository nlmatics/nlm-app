import {
  CompressOutlined,
  ExpandOutlined,
  FilterOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Input,
  Result,
  Row,
  Select,
  Tag,
} from 'antd';
import numeral from 'numeral';
import { useCallback, useContext, useEffect, useState } from 'react';
import ThemeContext from '../../../../../contexts/theme/ThemContext';
import useViews from '../../../../../hooks/useViews';
import { dataTypes } from '../../../../../utils/constants';
import { getDataType } from '../../../../../utils/helpers';
import useFieldBundles from '../../../fields/useFieldBundles';
import useFieldManager from '../../../fields/useFieldManager';
import { chartTypes, getChartType } from '../../utils';
import Visualization from '../Visualization/Visualization';

const getVisualizations = ({ fields = [], fieldBundleId }) => {
  const visualizationFields = fields.filter(field => {
    const dataType = getDataType(field, field.options);
    return (
      !field.isEnteredField &&
      (dataType === dataTypes.BOOLEAN ||
        dataType === dataTypes.NUMBER ||
        dataType === dataTypes.MONEY ||
        dataType === dataTypes.TEXT)
    );
  });
  return visualizationFields.map(field => {
    const dataType = getDataType(field, field.options);
    const { name, id } = field;
    const chartType = getChartType({ dataType });
    return {
      name,
      type: 'simple',
      options: {
        rowGroupCols: [
          {
            id,
            field: id,
            type: chartType === chartTypes.NUMERIC && dataTypes.NUMBER,
          },
        ],
        fieldSetId: fieldBundleId,
        chartType,
      },
      id,
    };
  });
};

export default function FieldVisualizations({ workspaceId }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filterModel, setFilterModel] = useState({});
  const [fieldBundleId, setFieldBundleId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const DEFAULT_DISPLAY_COUNT = 10;

  const [filteredVisualizations, setFilteredVisualizations] = useState([]);
  const [visualizations, setVisualizations] = useState([]);
  const [views, setViews] = useState([]);
  const [view, setView] = useState(null);
  const { BRAND_COLOR } = useContext(ThemeContext);
  const getViewsForFieldSet = () => {
    return views.filter(
      ({ options: { fieldSetId: id } }) => id === fieldBundleId
    );
  };
  const { data: fieldBundles, isLoading: isFetchingFieldBundles } =
    useFieldBundles(workspaceId);
  const { useFields } = useFieldManager();
  const { data: allFields, isLoading: isFetchingField } =
    useFields(fieldBundleId);
  const {
    data,
    isLoading: fetchingViews,
    getViews,
    getViewById,
  } = useViews(workspaceId);

  useEffect(() => {
    if (data && !fetchingViews) {
      setViews(getViews());
    }
  }, [data, fetchingViews, getViews]);

  const onViewChange = useCallback(
    viewId => {
      if (fieldBundleId) {
        let fields;
        let view;
        if (viewId) {
          view = getViewById({ viewId, views });
          const {
            options: { columnState },
          } = view;
          const fieldsInView = columnState
            .flatMap(({ hide, colId }) => (hide ? [] : [colId]))
            // Remove file_name column
            .slice(1);
          fields = allFields.filter(({ id }) => fieldsInView.includes(id));
        } else {
          fields = allFields;
          view = null;
        }
        const simpleVisualizations = getVisualizations({
          fields,
          fieldBundleId,
        });
        setView(view);
        setVisualizations(simpleVisualizations);
        setFilteredVisualizations(simpleVisualizations);
      }
    },
    [views, allFields, fieldBundleId]
  );

  useEffect(() => {
    if (!isFetchingFieldBundles) {
      setFieldBundleId(fieldBundles && fieldBundles[0]?.id);
    }
  }, [fieldBundles, isFetchingFieldBundles, fieldBundleId]);

  useEffect(() => {
    if (!isFetchingField && fieldBundleId && allFields?.length) {
      const simpleVisualizations = getVisualizations({
        fields: allFields,
        fieldBundleId,
      });
      setVisualizations(simpleVisualizations);
      setFilteredVisualizations(simpleVisualizations);
    }
  }, [allFields, isFetchingField, fieldBundleId]);

  const expandStyle = {
    width: 'calc(100vw - 80px)',
    position: 'fixed',
    zIndex: '1',
    left: 65,
    top: 115,
    height: 'calc(100vh - 130px)',
  };

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
              <Col span={4}>
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
              <Col span={4}>
                <Select
                  style={{ width: '100%' }}
                  showSearch
                  allowClear
                  value={view?.name}
                  onClear={() => {
                    setView(null);
                  }}
                  placeholder="Select a view"
                  optionFilterProp="children"
                  onChange={onViewChange}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {getViewsForFieldSet().map(({ id, name }) => (
                    <Select.Option key={id} value={id}>
                      {name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              {!!Object.keys(filterModel).length && (
                <Col span={16}>
                  <Row gutter={[10, 10]}>
                    <Col>
                      <FilterOutlined />
                    </Col>
                    {Object.keys(filterModel).map(key => {
                      const { filterType, values, filter, filterTo } =
                        filterModel[key];
                      const name = visualizations.find(
                        ({ id }) => id === key
                      )?.name;
                      let filterTag;
                      if (filterType === 'set') {
                        filterTag = (
                          <span style={{ display: 'inline-block' }}>
                            <Breadcrumb separator=":" key={key}>
                              <Breadcrumb.Item>{name}</Breadcrumb.Item>
                              <Breadcrumb.Item>{values[0]}</Breadcrumb.Item>
                            </Breadcrumb>
                          </span>
                        );
                      }
                      if (filterType === 'number') {
                        filterTag = (
                          <span style={{ display: 'inline-block' }}>
                            <Breadcrumb separator=":" key={key}>
                              <Breadcrumb.Item>{name}</Breadcrumb.Item>
                              <Breadcrumb.Item>{`${numeral(filter).format(
                                'Oa'
                              )} - ${numeral(filterTo - 1).format(
                                'Oa'
                              )}`}</Breadcrumb.Item>
                            </Breadcrumb>
                          </span>
                        );
                      }
                      return (
                        <Col key={key}>
                          <Tag
                            closable
                            onClose={() => {
                              setFilterModel(
                                // eslint-disable-next-line no-unused-vars
                                ({ [key]: ignore, ...rest }) => ({
                                  ...rest,
                                })
                              );
                            }}
                          >
                            {filterTag}
                          </Tag>
                        </Col>
                      );
                    })}
                    <Col>
                      <Button
                        type="link"
                        onClick={() => setFilterModel({})}
                        size="small"
                      >
                        Clear All
                      </Button>
                    </Col>
                  </Row>
                </Col>
              )}
            </Row>
          </Card>
        </Col>
      </Row>

      {filteredVisualizations.length ? (
        <>
          <Row
            gutter={[10, 10]}
            style={{
              position: 'relative',
              overflow: 'hidden auto',
              height: `calc(100vh - ${showAll ? 195 : 225}px)`,
            }}
          >
            {(showAll
              ? filteredVisualizations
              : filteredVisualizations.slice(0, DEFAULT_DISPLAY_COUNT)
            )?.map(
              (
                {
                  name,
                  options: { rowGroupCols, fieldSetId, chartType, valueCols },
                  id,
                },
                index
              ) => {
                const filterStyle = Object.keys(filterModel).includes(id)
                  ? { borderColor: BRAND_COLOR }
                  : {};
                const expandedStyle = id === expandedId ? expandStyle : {};
                return (
                  <Col key={id} span={getSpan(chartType, index)}>
                    <Card
                      style={{ ...filterStyle, ...expandedStyle }}
                      title={name}
                      size={'small'}
                      bodyStyle={{
                        padding: 8,
                        height: id === expandedId ? 'calc(100vh - 200px)' : 260,
                      }}
                      extra={
                        <>
                          {Object.keys(filterModel).includes(id) && (
                            <Button
                              size="small"
                              icon={<FilterOutlined />}
                              type="link"
                              onClick={() => {
                                // eslint-disable-next-line no-unused-vars
                                setFilterModel(({ [id]: ignore, ...rest }) => ({
                                  ...rest,
                                }));
                              }}
                            >
                              Clear
                            </Button>
                          )}
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
                        </>
                      }
                    >
                      <Visualization
                        height={200}
                        fieldIds={[id]}
                        rowGroupCols={rowGroupCols}
                        fieldBundleId={fieldSetId}
                        workspaceId={workspaceId}
                        isExpanded={id === expandedId}
                        chartType={chartType}
                        allFields={allFields}
                        valueCols={valueCols}
                        filterModel={filterModel}
                        setFilterConfig={({
                          fieldId,
                          value,
                          valueFrom,
                          valueTo,
                        }) => {
                          if (chartType === chartTypes.BOOLEAN) {
                            setFilterModel(filterModel => ({
                              ...filterModel,
                              [fieldId]: {
                                values: [value],
                                filterType: 'set',
                              },
                            }));
                          }

                          if (chartType === chartTypes.NUMERIC) {
                            setFilterModel(filterModel => ({
                              ...filterModel,
                              [fieldId]: {
                                filterType: 'number',
                                type: 'inRange',
                                filter: valueFrom,
                                // Make `filterTo` value inclusive
                                filterTo: valueTo + 1,
                              },
                            }));
                          }
                        }}
                      />
                    </Card>
                  </Col>
                );
              }
            )}
          </Row>
          {filteredVisualizations.length > DEFAULT_DISPLAY_COUNT && !showAll && (
            <Row justify="center">
              <Col>
                <Button type="primary" onClick={() => setShowAll(true)}>
                  Show All
                </Button>
              </Col>
            </Row>
          )}
        </>
      ) : (
        <Result title="No fields to analyze." />
      )}
    </>
  );
}
