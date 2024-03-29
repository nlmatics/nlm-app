import { useState, useEffect } from 'react';
import { Select } from 'antd';
const { Option } = Select;

export default function SelectCellEditor({
  cellValue,
  options,
  reset,
  onEdit,
}) {
  //converts value in cell to value for editor
  const convert2EditorValue = value => {
    return value;
  };

  const [editorValue, setEditorValue] = useState(
    cellValue !== '-' ? convert2EditorValue(cellValue) : undefined
  );
  const { selectionType } = options;

  const getSelectOptions = values => {
    let result = [];
    for (let i = 0; i < values.length; i++) {
      result.push(<Option key={values[i]}>{values[i]}</Option>);
    }
    return result;
  };

  const selectOptions = getSelectOptions(options.values);

  //converts value in editor to value for cell
  const convert2CellValue = editorValue => {
    return editorValue;
  };

  function handleChange(values) {
    setEditorValue(values);
    if (onEdit) {
      onEdit(convert2CellValue(values));
    }
  }

  useEffect(() => {
    if (cellValue !== '-') {
      setEditorValue(convert2EditorValue(cellValue));
    }
  }, [cellValue, reset]);

  return (
    <Select
      mode={selectionType}
      style={{ width: '100%', margin: 0, padding: '6px 10px' }}
      placeholder="Please select"
      defaultValue={editorValue}
      onChange={handleChange}
    >
      {selectOptions}
    </Select>
  );
}
