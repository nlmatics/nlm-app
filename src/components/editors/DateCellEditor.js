import { CloseOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Row } from 'antd';
import { useEffect, useState } from 'react';
import {
  dateDisplayFormat,
  getEpochInUTCFromMomentDate,
  getMomentDateFromEpoch,
} from '../../utils/dateUtils';

export default function DateCellEditor({ cellValue, reset, onEdit }) {
  const [date, setDate] = useState(getMomentDateFromEpoch(cellValue));

  function handleDateChange(momentDate) {
    setDate(momentDate);
    if (onEdit) {
      onEdit(getEpochInUTCFromMomentDate(momentDate));
    }
  }

  useEffect(() => {
    setDate(getMomentDateFromEpoch(cellValue));
  }, [cellValue, reset]);

  return (
    <Row gutter={[10, 10]} align="middle">
      <Col flex="auto">
        <DatePicker
          style={{ width: '100%', margin: 0, padding: '6px 10px' }}
          id="date-picker-dialog"
          format={dateDisplayFormat}
          value={date}
          defaultValue={date}
          allowClear={false}
          onChange={handleDateChange}
        />
      </Col>
      <Col span={3}>
        <Button
          size="small"
          icon={<CloseOutlined />}
          onClick={() => {
            setDate(null);
            onEdit('-');
          }}
        />
      </Col>
    </Row>
  );
}
