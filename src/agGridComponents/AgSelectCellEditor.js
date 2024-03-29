import { useState, forwardRef, useImperativeHandle } from 'react';
import { Select } from 'antd';
const { Option } = Select;

export default forwardRef(function AgSelectCellEditor(props, ref) {
  const [selectedOptions, setSelectedOptions] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectionType, setSelectionType] = useState('single');

  function handleChange(values) {
    setSelectedOptions(values);
  }

  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        return selectedOptions;
      },
      isCancelAfterEnd: () => {
        return false;
      },
      afterGuiAttached: () => {
        let values = props.options.values;
        let options = [];
        for (let i = 0; i < values.length; i++) {
          options.push(<Option key={values[i]}>{values[i]}</Option>);
        }
        setOptions(options);
        if (!props.value) {
          return;
        }
        setSelectedOptions(props.value);
        setSelectionType(props.options.selectionType);
      },
    };
  });

  return (
    <Select
      mode={selectionType}
      style={{ width: '100%', margin: 0, padding: '6px 10px' }}
      placeholder="Please select"
      value={selectedOptions}
      defaultValue={options}
      onChange={handleChange}
    >
      {options}
    </Select>
  );
});
