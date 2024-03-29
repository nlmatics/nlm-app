import { useState, forwardRef, useImperativeHandle } from 'react';
import { InputNumber } from 'antd';

export default forwardRef(function AgNumericCellEditor(props, ref) {
  const [editedValue, setEditedValue] = useState(null);
  function handleNumberChange(v) {
    setEditedValue(v);
  }

  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        return editedValue;
      },
      isCancelAfterEnd: () => {
        return false;
      },
      afterGuiAttached: () => {
        setEditedValue(props.value);
      },
    };
  });

  return (
    <InputNumber
      value={editedValue}
      controls={false}
      bordered={false}
      onChange={handleNumberChange}
      stringMode
      style={{ width: '100%', height: '100%', margin: 0, padding: '0px' }}
    ></InputNumber>
  );
});
