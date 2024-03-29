import { useState, forwardRef, useImperativeHandle } from 'react';
import { Radio } from 'antd';

export default forwardRef(function AgBooleanCellEditor(props, ref) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  function handleValueChange(e) {
    console.log('new value is', e.target.value);
    setSelectedAnswer(e.target.value);
  }

  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        return selectedAnswer;
      },
      isCancelAfterEnd: () => {
        return false;
      },
      afterGuiAttached: () => {
        if (!props.value) {
          return;
        }
        setSelectedAnswer(props.value);
      },
    };
  });

  return (
    <Radio.Group
      size="small"
      style={{ width: '100%', margin: 0, padding: '6px 10px' }}
      buttonStyle="solid"
      value={selectedAnswer}
      onChange={handleValueChange}
    >
      <Radio.Button value="Yes">Yes</Radio.Button>
      <Radio.Button value="No">No</Radio.Button>
      <Radio.Button value="-">-</Radio.Button>
    </Radio.Group>
  );
});
