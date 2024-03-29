import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Input } from 'antd';
const { TextArea } = Input;

export default forwardRef(function AgLongTextCellEditor(props, ref) {
  const getCellValue = value => {
    let cellValue = value;
    if (value) {
      if (value.split) {
        cellValue = value.split('/n').join('\n- ');
      }
    }
    return cellValue;
  };

  const [editedValue, setEditedValue] = useState(getCellValue(props.value));

  useEffect(() => {
    console.log('props value has changed to', props.value);
    setEditedValue(getCellValue(props.value));
  }, [props.value]);

  function handleChange(e) {
    setEditedValue(e.target.value);
  }

  const getCellUpdateValue = () => {
    let newValue = '';
    if (editedValue && editedValue.replaceAll) {
      newValue = editedValue.replaceAll('\n- ', '/n');
    } else {
      newValue = editedValue;
    }
    newValue = newValue ? newValue : '-'; //blank values are getting rejected
    return newValue;
  };

  useImperativeHandle(ref, () => ({
    getValue: getCellUpdateValue,
    isCancelAfterEnd: () => {
      return false;
    },
    afterGuiAttached: () => {
      // getCellValue(props.value);
    },
  }));

  return (
    <div style={{ height: '100%' }}>
      <TextArea
        style={{ height: '100%' }}
        value={editedValue}
        onChange={handleChange}
      ></TextArea>
    </div>
  );
});
