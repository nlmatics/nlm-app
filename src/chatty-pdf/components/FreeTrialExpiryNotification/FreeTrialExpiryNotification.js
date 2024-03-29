import { Button, Typography } from 'antd';
const isPluginInstance = () => window !== window.parent;
export default function FreeTrialExpiryNotification() {
  return (
    <>
      <Typography.Text>
        Your free trial has ended. To access the premium version -
      </Typography.Text>
      <Button
        type="link"
        href="/subscribe"
        {...(isPluginInstance() ? { target: '_blank' } : {})}
      >
        Subscribe
      </Button>
    </>
  );
}
