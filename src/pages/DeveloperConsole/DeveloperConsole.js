import {
  Alert,
  Button,
  Descriptions,
  Layout,
  PageHeader,
  Space,
  Spin,
  Typography,
} from 'antd';
import { useState } from 'react';
import { createAPIKey } from '../../utils/apiCalls.js';

const { Paragraph } = Typography;

export default function DeveloperConsole() {
  const [apiKeyData, setAPIKeyData] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const handleCreateAPIKey = async () => {
    setLoading(true);
    let result = await createAPIKey();
    setAPIKeyData(result);
    setLoading(false);
  };

  return (
    <PageHeader title="Developer Console">
      <Layout.Content>
        <Space direction="vertical">
          <Spin spinning={loading}>
            <Button
              onClick={handleCreateAPIKey}
              disabled={apiKeyData && apiKeyData.developer_key}
            >
              Create API Key
            </Button>
          </Spin>
          {apiKeyData && apiKeyData.developer_key && (
            <>
              <Alert
                type="warning"
                message="For security reasons, the API key will only be shown once. Please copy and keep the key in a safe place."
              ></Alert>
              <Descriptions
                title="API Key Information"
                layout="vertical"
                column={1}
                bordered
              >
                <Descriptions.Item label="Application Id">
                  <Paragraph copyable>{apiKeyData.app_id}</Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="API Key">
                  <Paragraph copyable>{apiKeyData.developer_key}</Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </Space>
      </Layout.Content>
    </PageHeader>
  );
}
