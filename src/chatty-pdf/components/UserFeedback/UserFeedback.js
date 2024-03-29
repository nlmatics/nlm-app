import { CloseOutlined, SendOutlined, SmileOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Popover, Rate } from 'antd';
import { useState } from 'react';
import useUserInfo from '../../../hooks/useUserInfo';
import API from '../../../utils/API';

export default function UserFeedback({ triggerButton }) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [registeringFeedback, setRegisteringFeedback] = useState(false);
  const { data: userInfo } = useUserInfo();
  const hide = () => {
    setOpen(false);
  };
  const handleOpenChange = newOpen => {
    setOpen(newOpen);
  };
  return (
    <Popover
      destroyTooltipOnHide
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomLeft"
      content={
        <Card
          bodyStyle={{ width: 400, maxWidth: '90vw' }}
          size="small"
          title="Please share your feedback"
          extra={
            <Button size="small" icon={<CloseOutlined />} onClick={hide} />
          }
        >
          <Form
            id="user-feedback"
            name="user-feedback"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            onFinish={async data => {
              setRegisteringFeedback(true);
              try {
                await API.post('/userFeedback', {
                  ...data,
                  userId: userInfo?.id,
                });
                setRegisteringFeedback(false);
                setOpen(false);
                message.success(
                  `Thank you for taking the time to share your feedback, it's greatly appreciated!`
                );
              } catch (error) {
                message.error('Could not register feedback. Try again later.');
                setOpen(false);
              }
            }}
            autoComplete="off"
          >
            <Form.Item
              label="Rate"
              name="ratingStars"
              rules={[{ required: true, message: 'Please select a rating!' }]}
            >
              <Rate onChange={stars => setStars(stars)} />
            </Form.Item>

            <Form.Item
              label="Feedback"
              name="feedback"
              rules={[
                {
                  required: stars === 1,
                  message: 'Please provide your feedback!',
                },
              ]}
            >
              <Input.TextArea rows={4} maxLength={200} showCount />
            </Form.Item>
          </Form>
          <div style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              form="user-feedback"
              key="submit"
              icon={<SendOutlined />}
              htmlType="submit"
              loading={registeringFeedback}
            >
              Send
            </Button>
          </div>
        </Card>
      }
    >
      {triggerButton || <Button type="link" icon={<SmileOutlined />} />}
    </Popover>
  );
}
