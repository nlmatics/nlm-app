import { useState, useEffect } from 'react';
import { Space, Select, InputNumber, Button } from 'antd';
import { PERIOD_MULTIPLIERS } from '../../utils/constants';
import { CloseOutlined } from '@ant-design/icons';
const { Option } = Select;

export default function PeriodCellEditor({ cellValue, reset, onEdit }) {
  const [periodValue, setPeriodValue] = useState(cellValue.time_value);
  const [periodUnit, setPeriodUnit] = useState(cellValue.time_unit);

  //converts value in cell to value for editor
  const convert2EditorValue = cellValue => {
    setPeriodUnit(cellValue.time_unit);
    setPeriodValue(cellValue.time_value);
  };
  //converts value in editor to value for cell
  const convert2CellValue = () => {
    if (periodValue && periodUnit) {
      let raw_value = PERIOD_MULTIPLIERS[periodUnit] * periodValue;
      return {
        time_unit: periodUnit,
        time_value: periodValue,
        formatted_value:
          periodValue + ' ' + periodUnit + (periodValue > 1 ? 's' : ''),
        raw_value: raw_value,
      };
    } else {
      return {
        time_unit: null,
        time_value: '',
        formatted_value: '-',
        raw_value: null,
      };
    }
  };

  useEffect(() => {
    convert2EditorValue(cellValue);
  }, [cellValue, reset]);

  useEffect(() => {
    if (onEdit) {
      let newCellValue = convert2CellValue();
      onEdit(newCellValue);
    }
  }, [periodValue, periodUnit]);

  return (
    <Space>
      <InputNumber
        placeholder="Time"
        value={periodValue}
        defaultValue={periodValue}
        onChange={setPeriodValue}
        size="small"
      ></InputNumber>
      <Select
        size="small"
        style={{ width: 120 }}
        onChange={setPeriodUnit}
        placeholder="Unit of time"
        dropdownClassName={'ag-custom-component-popup'}
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
      <Button
        size="small"
        icon={<CloseOutlined />}
        onClick={() => {
          setPeriodUnit(null);
          setPeriodValue('');
          onEdit('-');
        }}
      />
    </Space>
  );
}
