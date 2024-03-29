import { useState, useEffect } from 'react';
import { Input } from 'antd';
const { TextArea } = Input;

export default function LongTextCellEditor({ cellValue, reset, onEdit }) {
  //converts value in cell to value for editor
  const convert2EditorValue = cellValue => {
    let editorValue = cellValue;
    if (cellValue) {
      if (cellValue.split) {
        editorValue = cellValue.split('/n').join('\n- ');
      }
    }
    return editorValue;
  };

  //stores current value of editor
  const [editorValue, setEditorValue] = useState(
    convert2EditorValue(cellValue)
  );

  //converts value in editor to value for cell
  const convert2CellValue = editorValue => {
    let newValue = '';
    if (editorValue && editorValue.replaceAll) {
      newValue = editorValue.replaceAll('\n- ', '/n');
    } else {
      newValue = editorValue;
    }
    newValue = newValue ? newValue : '-'; //blank values are getting rejected
    return newValue;
  };

  useEffect(() => {
    setEditorValue(convert2EditorValue(cellValue));
  }, [reset]);

  function handleChange(e) {
    setEditorValue(e.target.value);
    let newCellValue = convert2CellValue(e.target.value);
    if (onEdit) {
      console.log('saving this audit...', newCellValue);
      onEdit(newCellValue);
    }
  }

  return (
    <div style={{ height: '100%' }}>
      <TextArea
        style={{ height: '100%' }}
        value={editorValue}
        rows={5}
        onChange={handleChange}
      ></TextArea>
    </div>
  );
}
