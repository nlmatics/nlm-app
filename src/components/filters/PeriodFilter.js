import { useEffect, useState } from 'react';
import { Button, Col, InputNumber, Row, Select } from 'antd';
import { PERIOD_MULTIPLIERS } from '../../utils/constants';
const { Option } = Select;

export const periodFilterOptions = [
  { label: 'Equals', value: 'equals', operatorString: '=' },
  { label: 'Not Equal', value: 'notEqual', operatorString: '!=' },
  { label: 'Less than', value: 'lessThan', operatorString: '<' },
  {
    label: 'Less than or equal',
    value: 'lessThanOrEqual',
    operatorString: '<=',
  },
  { label: 'Greater than', value: 'greaterThan', operatorString: '>' },
  {
    label: 'Greater than or equal',
    value: 'greaterThanOrEqual',
    operatorString: '>=',
  },
  { label: 'In range', value: 'inRange', operatorString: 'between' },
];

export default function PeriodFilter({
  inputRef,
  onFilterChange,
  filterFormData,
}) {
  const [operator, setOperator] = useState(filterFormData?.operator);
  const [period, setPeriod] = useState(filterFormData?.period);
  const [endPeriod, setEndPeriod] = useState(filterFormData?.endPeriod);
  const [periodUnit, setPeriodUnit] = useState(filterFormData?.periodUnit);

  useEffect(() => {
    const { operator, period, endPeriod, periodUnit } = filterFormData;

    setOperator(operator);
    setPeriod(period);
    setEndPeriod(endPeriod);
    setPeriodUnit(periodUnit);
  }, [filterFormData]);

  const apply = () => {
    if (operator && period && periodUnit) {
      const { operatorString } = periodFilterOptions.find(
        ({ value }) => value === operator
      );
      if (operator !== 'inRange') {
        onFilterChange({
          operator,
          periodInMilliSeconds: PERIOD_MULTIPLIERS[periodUnit] * period,
          periodUnit,
          floatingFilterString: `${operatorString} ${period} ${periodUnit}(s)`,
        });
      } else if (endPeriod) {
        onFilterChange({
          operator,
          periodInMilliSeconds: PERIOD_MULTIPLIERS[periodUnit] * period,
          endPeriodInMilliSeconds: PERIOD_MULTIPLIERS[periodUnit] * endPeriod,
          periodUnit,
          floatingFilterString: `${operatorString} (${period} ${periodUnit}(s) and ${endPeriod} ${periodUnit}(s))`,
        });
      }
    }
  };

  const reset = () => {
    setOperator(null);
    setPeriod(null);
    setPeriodUnit(null);
    setEndPeriod(null);
    onFilterChange({
      operator: null,
      periodInMilliSeconds: null,
      endPeriodInMilliSeconds: null,
      periodUnit: null,
      floatingFilterString: null,
    });
  };

  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <Select
          ref={inputRef}
          size="small"
          placeholder="Operator"
          style={{ width: '100%' }}
          defaultValue={operator}
          value={operator}
          onChange={setOperator}
          popupClassName={'ag-custom-component-popup'}
        >
          {periodFilterOptions.map(({ label, value }) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          ))}
        </Select>
      </Col>

      <Col span={24}>
        <Row gutter={[10, 10]}>
          <Col span={12}>
            <InputNumber
              placeholder="Time"
              value={period}
              defaultValue={period}
              onChange={setPeriod}
              size="small"
              style={{ width: '100%' }}
            ></InputNumber>
          </Col>
          <Col span={12}>
            {operator === 'inRange' && (
              <InputNumber
                placeholder="End Time"
                value={endPeriod}
                defaultValue={endPeriod}
                onChange={setEndPeriod}
                size="small"
                style={{ width: '100%' }}
              ></InputNumber>
            )}
          </Col>
        </Row>
      </Col>

      <Col span={24}>
        <Select
          size="small"
          onChange={setPeriodUnit}
          style={{ width: '100%' }}
          placeholder="Unit of time"
          popupClassName={'ag-custom-component-popup'}
          value={periodUnit}
          defaultValue={periodUnit}
        >
          <Option key="millisecond" value="millisecond">
            milliseconds
          </Option>
          <Option key="second" value="second">
            seconds
          </Option>
          <Option key="minute" value="minute">
            minutes
          </Option>
          <Option key="hour" value="hour">
            hours
          </Option>
          <Option key="day" value="day">
            days
          </Option>
          <Option key="week" value="week">
            weeks
          </Option>
          <Option key="month" value="month">
            months
          </Option>
          <Option key="year" value="year">
            years
          </Option>
        </Select>
      </Col>

      <Col span={24}>
        <Row gutter={[10, 10]}>
          <Col span={12}>
            <Button
              style={{ width: '100%' }}
              disabled={!operator || !period || !periodUnit}
              onClick={() => apply()}
              type="primary"
            >
              Apply
            </Button>
          </Col>
          <Col span={12}>
            <Button
              style={{ width: '100%' }}
              disabled={!filterFormData.floatingFilterString}
              onClick={() => reset()}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
