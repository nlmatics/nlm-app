import {
  FilterFilled,
  InfoCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  Input,
  Row,
  Segmented,
  Select,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import FieldFiltersContext from '../../../contexts/fieldFilters/FieldFiltersContext';
import { dataTypes, PERIOD_MULTIPLIERS } from '../../../utils/constants';
import { getDataType } from '../../../utils/helpers';
import DateAsNumberFilter from '../../filters/DateAsNumberFilter';
import NumberFilter from '../../filters/NumberFilter';
import PeriodFilter from '../../filters/PeriodFilter';
import useFieldBundles from '../../workspace/fields/useFieldBundles';
import useFieldManager from '../../workspace/fields/useFieldManager';
import useViews from '../../../hooks/useViews';
import ThemeContext from '../../../contexts/theme/ThemContext';
import './index.less';
import { fetchFilterOptions } from '../../workspace/fetcher';
const { Panel } = Collapse;

const isGroupedField = criteria =>
  criteria && criteria[0]?.groupFlag === 'enable';

export default function FieldFilters({ workspaceId, height }) {
  const {
    defaultFieldBundleId,
    data: fieldBundles,
    isLoading: isFetchingFieldBundles,
  } = useFieldBundles(workspaceId);
  const { useFields } = useFieldManager();
  const { data: fields, isLoading: areFieldsBeingFetched } =
    useFields(defaultFieldBundleId);
  const {
    data: views,
    getViews,
    isLoading: isFetchingViews,
  } = useViews(workspaceId);
  const [allFields, setAllFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);
  const [showOnlyAppliedFilters, setShowOnlyAppliedFilters] = useState(false);
  const {
    fieldFilters,
    setFieldFilters,
    openFieldFilters,
    setOpenFieldFilters,
    showAppliedFilters,
    setShowAppliedFilters,
  } = useContext(FieldFiltersContext);
  const { BRAND_COLOR } = useContext(ThemeContext);
  const [filteredDistinctValuesByFieldId, setFilteredDistinctValuesByFieldId] =
    useState({});
  const [isFetchingFilterFieldId, setIsFetchingFilterFieldId] = useState(false);

  const getFieldsByViewOrder = ({ fields, views }) => {
    const fieldIdsByViewOrder = views?.flatMap(({ options: { columnState } }) =>
      columnState?.slice(1)?.flatMap(({ colId }) => {
        return colId;
      })
    );
    const uniqueFieldIdsByViewOrder = [...new Set(fieldIdsByViewOrder)];
    const fieldsByViewOrder = uniqueFieldIdsByViewOrder.flatMap(fieldId => {
      const field = fields.find(({ id }) => id === fieldId);
      return field ? [field] : [];
    });
    return fieldsByViewOrder;
  };

  const getFieldsByOrderInFieldBundle = ({ fields, fieldBundle }) => {
    return fieldBundle.fieldIds?.flatMap(fieldId => {
      const field = fields.find(({ id }) => id === fieldId);
      return field ? [field] : [];
    });
  };

  const getFieldsWithoutPreamble = fields => {
    return fields.filter(({ name }) => {
      return name !== 'Preamble';
    });
  };

  useEffect(() => {
    showAppliedFilters && setShowOnlyAppliedFilters(showAppliedFilters);
  }, [showAppliedFilters]);

  useEffect(() => {
    if (fields) {
      if (getViews()?.length) {
        const fieldsByViewOrder = getFieldsByViewOrder({
          fields,
          views: getViews(),
        });
        const fieldsWithoutPreamble =
          getFieldsWithoutPreamble(fieldsByViewOrder);
        setFilteredFields(fieldsWithoutPreamble);
        setAllFields(fieldsWithoutPreamble);
      } else {
        if (fieldBundles?.length) {
          const fieldsByOrderInFieldBundle = getFieldsByOrderInFieldBundle({
            fields,
            fieldBundle: fieldBundles[0],
          });
          const fieldsWithoutPreamble = getFieldsWithoutPreamble(
            fieldsByOrderInFieldBundle
          );
          setAllFields(fieldsWithoutPreamble);
          setFilteredFields(fieldsWithoutPreamble);
        }
      }
    }
  }, [fields, views, getViews, fieldBundles]);

  const getFilterValues = async fieldId => {
    if (Object.keys(fieldFilters || {})?.length) {
      const getFilterOptions = async fieldId => {
        // eslint-disable-next-line no-unused-vars
        const { [fieldId]: currentField, ...filterModel } = fieldFilters;
        setIsFetchingFilterFieldId(fieldId);
        const response = await fetchFilterOptions({
          fieldId,
          gridState: {
            workspaceId,
            fieldIds: [fieldId],
            fieldBundleId: defaultFieldBundleId,
            gridQuery: {
              startRow: 0,
              endRow: 5000,
              filterModel,
            },
          },
        });
        setIsFetchingFilterFieldId(null);
        return response?.data;
      };
      return await getFilterOptions(fieldId);
    }
  };

  const getFilterComponentByDataType = ({
    dataType,
    field,
    value = {},
    name,
  }) => {
    const getOptions = () => {
      let options;
      if (isFetchingFilterFieldId) {
        options = [];
      } else {
        // Handle fields which only check for presence of keywords
        // We would like to use these fields as filters with values
        // Yes and No. Where Yes means the keywords exist (value == '') and
        // NO means keywords don't exist (value == null).
        if (
          field?.distinctValues &&
          field.distinctValues?.length === 2 &&
          field.distinctValues.includes('') &&
          field.distinctValues.includes(null)
        ) {
          options = [
            { label: 'Yes', value: '' },
            { label: 'No', value: null },
          ];
        } else {
          options = (
            filteredDistinctValuesByFieldId[field.id] || field.distinctValues
          ).flatMap(value => (value ? [{ label: value, value }] : []));
        }
      }
      return options;
    };
    let filterComponent;
    switch (dataType) {
      case dataTypes.BOOLEAN:
      case dataTypes.TEXT:
        filterComponent = (
          <Select
            placeholder={`Select ${name}`}
            style={{ width: '100%' }}
            mode="multiple"
            loading={isFetchingFilterFieldId === field.id}
            onChange={values => {
              if (values?.length) {
                setFieldFilters({
                  ...fieldFilters,
                  [field.id]: {
                    filterType: 'set',
                    values,
                  },
                });
              } else {
                // eslint-disable-next-line no-unused-vars
                const { [field.id]: currentField, ...exceptCurrentField } =
                  fieldFilters;
                setFieldFilters(exceptCurrentField);
              }
            }}
            onDropdownVisibleChange={async isOpen => {
              if (isOpen) {
                if (Object.keys(fieldFilters || {})?.length) {
                  const filterValues = await getFilterValues(field.id);
                  setFilteredDistinctValuesByFieldId({
                    ...filteredDistinctValuesByFieldId,
                    [field.id]: filterValues,
                  });
                } else {
                  setFilteredDistinctValuesByFieldId({
                    ...filteredDistinctValuesByFieldId,
                    [field.id]: null,
                  });
                }
              }
            }}
            value={value?.values}
            options={getOptions()}
          ></Select>
        );
        break;
      case dataTypes.DATE:
        filterComponent = (
          <DateAsNumberFilter
            onFilterChange={({
              operator,
              startDateEpochInUTC,
              endDateEpochInUTC,
              floatingFilterString,
            }) => {
              if (operator) {
                setFieldFilters({
                  ...fieldFilters,
                  [field.id]: {
                    filter: startDateEpochInUTC,
                    filterTo: endDateEpochInUTC,
                    filterType: 'number',
                    floatingFilterString,
                    type: operator,
                  },
                });
              } else {
                // Reset field scenario
                // eslint-disable-next-line no-unused-vars
                const { [field.id]: currentField, ...exceptCurrentField } =
                  fieldFilters;
                setFieldFilters(exceptCurrentField);
              }
            }}
            filterFormData={{
              operator: value?.type,
              startDate: value?.filter && moment(value.filter * 1000),
              endDate: value?.filterTo && moment(value.filterTo * 1000),
              floatingFilterString: value?.floatingFilterString,
            }}
          />
        );
        break;
      case dataTypes.PERIOD:
        filterComponent = (
          <PeriodFilter
            onFilterChange={({
              operator,
              periodInMilliSeconds,
              endPeriodInMilliSeconds,
              periodUnit,
              floatingFilterString,
            }) => {
              if (operator) {
                setFieldFilters({
                  ...fieldFilters,
                  [field.id]: {
                    filter: periodInMilliSeconds,
                    filterTo: endPeriodInMilliSeconds,
                    filterType: 'number',
                    periodUnit: periodUnit,
                    floatingFilterString,
                    type: operator,
                  },
                });
              } else {
                // Reset field scenario
                // eslint-disable-next-line no-unused-vars
                const { [field.id]: currentField, ...exceptCurrentField } =
                  fieldFilters;
                setFieldFilters(exceptCurrentField);
              }
            }}
            filterFormData={{
              operator: value?.type,
              period: value?.filter / PERIOD_MULTIPLIERS[value?.periodUnit],
              endPeriod:
                value?.filterTo / PERIOD_MULTIPLIERS[value?.periodUnit],
              periodUnit: value?.periodUnit,
              floatingFilterString: value?.floatingFilterString,
            }}
          />
        );
        break;
      case dataTypes.NUMBER:
      case dataTypes.MONEY:
        filterComponent = (
          <NumberFilter
            onFilterChange={({
              operator,
              fromValue,
              toValue,
              floatingFilterString,
            }) => {
              if (operator) {
                setFieldFilters({
                  ...fieldFilters,
                  [field.id]: {
                    filter: fromValue,
                    filterTo: toValue,
                    filterType: 'number',
                    floatingFilterString,
                    type: operator,
                  },
                });
              } else {
                // Reset field scenario
                // eslint-disable-next-line no-unused-vars
                const { [field.id]: currentField, ...exceptCurrentField } =
                  fieldFilters;
                setFieldFilters(exceptCurrentField);
              }
            }}
            filterFormData={{
              operator: value?.type,
              fromValue: value?.filter,
              toValue: value?.filterTo,
              floatingFilterString: value?.floatingFilterString,
            }}
          />
        );
        break;
    }
    return filterComponent;
  };

  return (
    <>
      <Row gutter={[10, 5]} align="middle" className="nlm-field-filters">
        <Col span={24}>
          <Card
            title={
              <Typography.Title level={5}>
                <FilterFilled style={{ marginRight: 10 }} />
                <Badge
                  count={Object.keys(fieldFilters || {})?.length}
                  color={BRAND_COLOR}
                  offset={[15, 0]}
                >
                  Filter by Data Points
                </Badge>
              </Typography.Title>
            }
            size="small"
            bodyStyle={{ padding: 10 }}
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => setFieldFilters(null)}
              >
                Clear All
              </Button>
            }
          >
            <Row gutter={[10, 10]}>
              <Col span={24}>
                <Segmented
                  value={showOnlyAppliedFilters}
                  options={[
                    { label: 'All Filters', value: false },
                    { label: 'Applied Filters', value: true },
                  ]}
                  onChange={value => {
                    setShowOnlyAppliedFilters(value);
                    setShowAppliedFilters(value);
                  }}
                />
              </Col>
              <Col span={24}>
                <Input
                  style={{ width: '100%' }}
                  allowClear
                  placeholder="Find by name"
                  addonBefore={<SearchOutlined />}
                  onChange={({ target: { value: query } }) => {
                    setFilteredFields(
                      allFields.filter(({ name }) =>
                        name.toLowerCase().includes(query.toLowerCase())
                      )
                    );
                  }}
                />
              </Col>
              <Col
                span={24}
                style={{
                  height: height || 'calc(100vh - 280px)',
                  overflow: 'auto',
                }}
              >
                <Spin
                  spinning={
                    areFieldsBeingFetched ||
                    isFetchingViews ||
                    isFetchingFieldBundles
                  }
                  style={{ minHeight: 200 }}
                >
                  {showOnlyAppliedFilters &&
                    Object.keys(fieldFilters || {})?.length == 0 && (
                      <Typography.Text style={{ textAlign: 'center' }}>
                        No Data Point filters selected.
                      </Typography.Text>
                    )}
                  <Collapse
                    expandIconPosition="end"
                    onChange={openFieldFilters => {
                      setOpenFieldFilters(openFieldFilters);
                    }}
                    activeKey={openFieldFilters}
                  >
                    {filteredFields.flatMap(field => {
                      const {
                        name,
                        id,
                        searchCriteria: {
                          criterias: [criteria],
                        },
                      } = field;
                      const dataType = getDataType(field, field.options);
                      const isGrouped = isGroupedField(
                        field?.searchCriteria?.criterias
                      );
                      if (isGrouped) {
                        return [];
                      }
                      const isFilterApplied =
                        fieldFilters &&
                        (fieldFilters[id]?.values?.length ||
                          fieldFilters[id]?.type);
                      return (showOnlyAppliedFilters
                        ? isFilterApplied
                        : true) &&
                        (dataType === dataTypes.BOOLEAN ||
                          dataType === dataTypes.TEXT ||
                          dataType === dataTypes.DATE ||
                          dataType === dataTypes.PERIOD ||
                          dataType === dataTypes.NUMBER ||
                          dataType === dataTypes.MONEY)
                        ? [
                            <Panel
                              header={
                                <>
                                  {name}
                                  {criteria?.question && (
                                    <Tooltip title={criteria?.question}>
                                      <InfoCircleOutlined
                                        style={{ marginLeft: 5 }}
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              }
                              className={
                                isFilterApplied ? 'filter-applied' : ''
                              }
                              key={id}
                            >
                              {getFilterComponentByDataType({
                                dataType,
                                field,
                                value: fieldFilters && fieldFilters[id],
                                name,
                              })}
                            </Panel>,
                          ]
                        : [];
                    })}
                  </Collapse>
                </Spin>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
}
