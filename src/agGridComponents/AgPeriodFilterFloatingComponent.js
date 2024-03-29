import { Input } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';

export default forwardRef(function AgPeriodFilterFloatingComponent(props, ref) {
  const [value, setValue] = useState('');
  useImperativeHandle(ref, () => {
    return {
      onParentModelChanged(parentModel) {
        if (parentModel) {
          setValue(parentModel.floatingFilterString);
        } else {
          setValue('');
        }
      },
    };
  });

  return (
    <Input
      title={value}
      value={value}
      disabled
      style={{ height: 24, marginTop: 12 }}
    />
  );
});
