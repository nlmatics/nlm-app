import { useState, forwardRef, useImperativeHandle } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import { displayDateFormat } from '../utils/constants';

export default forwardRef(function AgDateCellEditor(props, ref) {
  const [selectedDate, setSelectedDate] = useState(null);
  function handleDateChange(m) {
    if (m) {
      m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    }
    setSelectedDate(m);
  }

  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        let dateString = null;
        if (selectedDate) {
          dateString = selectedDate.format(displayDateFormat);
        }
        return dateString;
      },
      isCancelAfterEnd: () => {
        return !selectedDate;
      },
      afterGuiAttached: () => {
        if (!props.value) {
          return;
        }
        console.log('date props are:', props);
        setSelectedDate(moment(new Date(props.value)));
      },
    };
  });

  return (
    <DatePicker
      style={{ width: '100%', margin: 0, padding: '6px 10px' }}
      id="date-picker-dialog"
      format={displayDateFormat}
      value={selectedDate}
      defaultValue={selectedDate}
      onChange={handleDateChange}
    />
  );
});
