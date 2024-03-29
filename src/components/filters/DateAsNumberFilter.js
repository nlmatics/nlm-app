import { Button, Checkbox, Col, DatePicker, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import {
  dateDisplayFormat,
  getEpochInUTCFromMomentDate,
  getFormattedDateStringFromMomentDate,
  getPresetRanges,
} from '../../utils/dateUtils';
const { Option } = Select;

export const filterOptions = [
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

export default function DateAsNumberFilter({
  inputRef,
  onFilterChange,
  filterFormData,
}) {
  const [operator, setOperator] = useState(filterFormData?.operator);
  const [startDate, setStartDate] = useState(filterFormData?.startDate);
  const [endDate, setEndDate] = useState(filterFormData?.endDate);
  const [isCustom, setIsCustom] = useState(false);
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    const { operator, startDate, endDate } = filterFormData;

    setOperator(operator);
    setStartDate(startDate);
    setEndDate(endDate);
  }, [filterFormData]);

  const apply = () => {
    if (operator && startDate) {
      const { operatorString } = filterOptions.find(
        ({ value }) => value === operator
      );
      if (operator !== 'inRange') {
        onFilterChange({
          operator,
          startDateEpochInUTC: getEpochInUTCFromMomentDate(startDate),
          floatingFilterString: `${operatorString} ${getFormattedDateStringFromMomentDate(
            startDate
          )}`,
        });
      } else if (endDate) {
        onFilterChange({
          operator,
          startDateEpochInUTC: getEpochInUTCFromMomentDate(startDate),
          endDateEpochInUTC: getEpochInUTCFromMomentDate(endDate),
          floatingFilterString: `${operatorString} (${getFormattedDateStringFromMomentDate(
            startDate
          )} and ${getFormattedDateStringFromMomentDate(endDate)})`,
        });
      }
    }
  };

  const reset = () => {
    setDateRange([]);
    setOperator(null);
    setStartDate(null);
    setEndDate(null);
    onFilterChange({
      operator: null,
      startDateEpochInUTC: null,
      endDateEpochInUTC: null,
      floatingFilterString: null,
    });
  };

  return (
    <Row gutter={[10, 10]}>
      {isCustom ? (
        <>
          <Col span={24}>
            <Select
              ref={inputRef}
              size="middle"
              placeholder="Operator"
              style={{ width: '100%' }}
              defaultValue={operator}
              value={operator}
              onChange={setOperator}
              popupClassName={'ag-custom-component-popup'}
            >
              {filterOptions.map(({ label, value }) => (
                <Option key={value} value={value}>
                  {label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={24}>
            <Row gutter={[10, 10]}>
              <Col span={12}>
                <DatePicker
                  popupClassName="ag-custom-component-popup"
                  value={startDate}
                  defaultValue={startDate}
                  onChange={date => {
                    console.log('date changed');
                    setStartDate(date);
                  }}
                  format={dateDisplayFormat}
                ></DatePicker>
              </Col>
              <Col span={12}>
                {operator === 'inRange' && (
                  <DatePicker
                    popupClassName="ag-custom-component-popup"
                    value={endDate}
                    defaultValue={endDate}
                    onChange={setEndDate}
                    format={dateDisplayFormat}
                  ></DatePicker>
                )}
              </Col>
            </Row>
          </Col>
        </>
      ) : (
        <Col span={24}>
          <DatePicker.RangePicker
            value={dateRange}
            popupClassName="ag-custom-component-popup"
            onChange={dates => {
              if (dates) {
                setDateRange(dates);
                setStartDate(dates[0]);
                setEndDate(dates[1]);
                setOperator('inRange');
              } else {
                reset();
              }
            }}
            ranges={getPresetRanges()}
            format={dateDisplayFormat}
          ></DatePicker.RangePicker>
        </Col>
      )}

      <Col span={24}>
        <Row gutter={[10, 10]} align="middle">
          <Col span={8}>
            <Button
              disabled={!operator || !startDate}
              onClick={() => apply()}
              style={{ width: '100%' }}
              type="primary"
            >
              Apply
            </Button>
          </Col>
          <Col span={8}>
            <Button
              disabled={!filterFormData.floatingFilterString}
              onClick={() => reset()}
              style={{ width: '100%' }}
            >
              Reset
            </Button>
          </Col>
          <Col span={8}>
            <Checkbox
              className="ag-custom-component-popup"
              defaultChecked={false}
              value={isCustom}
              onChange={event => {
                setIsCustom(event.target.checked);
              }}
            >
              Custom
            </Checkbox>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
