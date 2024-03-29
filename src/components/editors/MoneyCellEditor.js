import { CloseOutlined } from '@ant-design/icons';
import { Button, Col, InputNumber, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { formatNumericText } from '../../utils/valueFormatters';

export default function MoneyCellEditor({ cellValue, reset, onEdit }) {
  const { raw_value: currencyValue, unit: currencyUnit } = cellValue;
  const [cellCurrencyValue, setCellCurrencyValue] = useState(currencyValue);
  const [cellCurrencyUnit, setCellCurrencyUnit] = useState(currencyUnit);

  const convert2EditorValue = ({
    raw_value: currencyValue,
    unit: currencyUnit,
  }) => {
    setCellCurrencyValue(currencyValue);
    setCellCurrencyUnit(currencyUnit);
  };

  //converts value in editor to value for cell
  const convert2CellValue = () => {
    return {
      currencyUnit: cellCurrencyUnit,
      currencyValue: parseFloat(cellCurrencyValue),
    };
  };

  useEffect(() => {
    convert2EditorValue(cellValue);
  }, [cellValue, reset]);

  useEffect(() => {
    if (onEdit) {
      let newCellValue = convert2CellValue();
      onEdit(newCellValue);
    }
  }, [cellCurrencyValue, cellCurrencyUnit]);

  return (
    <Row gutter={[10, 10]} align="middle">
      <Col flex="auto">
        <InputNumber
          value={cellCurrencyValue}
          defaultValue={cellCurrencyValue}
          formatter={value =>
            value && value !== '-' ? formatNumericText(value, true) : value
          }
          controls={false}
          // bordered={false}
          onChange={setCellCurrencyValue}
          step={1}
          stringMode
          style={{ width: '100%', height: '100%', margin: 0, padding: '0px' }}
          addonBefore={
            <Select
              defaultValue={cellCurrencyUnit}
              value={cellCurrencyUnit}
              onChange={setCellCurrencyUnit}
              style={{ width: 80 }}
              options={[
                'USD',
                'CAD',
                'JPY',
                'GBP',
                'AUD',
                'EUR',
                'CHF',
                'DKK',
                'SEK',
                'NOK',
                'CZK',
                'PLN',
                'CNY',
                'IDR',
              ].map(currency => ({ label: currency, value: currency }))}
            ></Select>
          }
        ></InputNumber>
      </Col>
      <Col span={3}>
        <Button
          size="small"
          icon={<CloseOutlined />}
          onClick={() => {
            setCellCurrencyValue('');
            setCellCurrencyUnit('');
            onEdit('-');
          }}
        />
      </Col>
    </Row>
  );
}
