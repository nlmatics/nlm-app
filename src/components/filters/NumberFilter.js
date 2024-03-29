import { useEffect, useState } from 'react';
import { Button, Col, InputNumber, Row, Select } from 'antd';
const { Option } = Select;

export const numberFilterOptions = [
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

export default function NumberFilter({
  inputRef,
  onFilterChange,
  filterFormData,
}) {
  const [operator, setOperator] = useState(filterFormData?.operator);
  const [fromValue, setFromValue] = useState(filterFormData?.fromValue);
  const [toValue, setToValue] = useState(filterFormData?.toValue);

  useEffect(() => {
    const { operator, fromValue, toValue } = filterFormData;

    setOperator(operator);
    setFromValue(fromValue);
    setToValue(toValue);
  }, [filterFormData]);

  const apply = () => {
    if (operator && fromValue) {
      const { operatorString } = numberFilterOptions.find(
        ({ value }) => value === operator
      );
      if (operator !== 'inRange') {
        onFilterChange({
          operator,
          fromValue,
          floatingFilterString: `${operatorString} ${fromValue}`,
        });
      } else if (toValue) {
        onFilterChange({
          operator,
          fromValue,
          toValue,
          floatingFilterString: `${operatorString} (${fromValue} and ${toValue})`,
        });
      }
    }
  };

  const reset = () => {
    setOperator(null);
    setFromValue(null);
    setToValue(null);
    onFilterChange({
      operator: null,
      fromValue: null,
      toValue: null,
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
          {numberFilterOptions.map(({ label, value }) => (
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
              placeholder="Filter"
              value={fromValue}
              defaultValue={fromValue}
              onChange={setFromValue}
              size="small"
              style={{ width: '100%' }}
            ></InputNumber>
          </Col>
          <Col span={12}>
            {operator === 'inRange' && (
              <InputNumber
                placeholder="Filter"
                value={toValue}
                defaultValue={toValue}
                onChange={setToValue}
                size="small"
                style={{ width: '100%' }}
              ></InputNumber>
            )}
          </Col>
        </Row>
      </Col>

      <Col span={24}>
        <Row gutter={[10, 10]}>
          <Col span={12}>
            <Button
              style={{ width: '100%' }}
              disabled={!operator || !fromValue}
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
