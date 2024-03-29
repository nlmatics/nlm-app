import { useState, useEffect } from 'react';
import { Radio } from 'antd';
import { LineOutlined } from '@ant-design/icons';

export default function BooleanCellEditor({ cellValue, reset, onEdit }) {
  //converts value in cell to value for editor
  const convert2EditorValue = cellValue => {
    return cellValue;
  };
  const [editorValue, setEditorValue] = useState(
    convert2EditorValue(cellValue)
  );
  //converts value in editor to value for cell
  const convert2CellValue = editorValue => {
    return editorValue;
  };

  function handleValueChange(e) {
    setEditorValue(e.target.value);
    if (onEdit) {
      onEdit(convert2CellValue(e.target.value));
    }
  }

  useEffect(() => {
    setEditorValue(convert2EditorValue(cellValue));
  }, [cellValue, reset]);

  return (
    <Radio.Group
      size="small"
      style={{ width: '100%', margin: 0, padding: '6px 10px' }}
      buttonStyle="solid"
      value={editorValue}
      onChange={handleValueChange}
    >
      <Radio.Button value="Yes">Yes</Radio.Button>
      <Radio.Button value="No">No</Radio.Button>
      <Radio.Button value="-">
        <LineOutlined />
      </Radio.Button>
    </Radio.Group>
  );
}
