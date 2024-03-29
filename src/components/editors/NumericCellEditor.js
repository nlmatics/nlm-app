import { CloseOutlined } from '@ant-design/icons';
import { Button, Col, InputNumber, Row } from 'antd';
import { useEffect, useState } from 'react';
import { formatNumericText } from '../../utils/valueFormatters';

export default function NumericCellEditor({ cellValue, reset, onEdit }) {
  //converts value in cell to value for editor
  const convert2EditorValue = cellValue => {
    return cellValue === '-' ? '' : cellValue;
  };

  const [editorValue, setEditorValue] = useState(
    convert2EditorValue(cellValue)
  );

  //converts value in editor to value for cell
  const convert2CellValue = editorValue => {
    let cellValue = parseFloat(editorValue);
    return cellValue;
  };

  function handleNumberChange(v) {
    console.log('number changed to..', v, convert2CellValue(v));
    setEditorValue(v);
    if (onEdit) {
      onEdit(convert2CellValue(v));
    }
  }

  useEffect(() => {
    setEditorValue(convert2EditorValue(cellValue));
  }, [cellValue, reset]);

  return (
    <Row gutter={[10, 10]} align="middle">
      <Col flex="auto">
        <InputNumber
          disabled={editorValue === '-'}
          value={editorValue}
          formatter={value =>
            value && value !== '-' ? formatNumericText(value, true) : value
          }
          controls={false}
          // bordered={false}
          onChange={handleNumberChange}
          step={1}
          stringMode
          style={{ width: '100%', height: '100%', margin: 0, padding: '0px' }}
        ></InputNumber>
      </Col>
      <Col span={3}>
        <Button
          size="small"
          icon={<CloseOutlined />}
          onClick={() => {
            setEditorValue('');
            onEdit('-');
          }}
        />
      </Col>
    </Row>
  );
}
