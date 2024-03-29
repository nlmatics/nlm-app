import { PlusOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';
import { useHistory } from 'react-router-dom';

export default function NoFieldsMessage({
  createNewFieldUrl,
  redirectPostCreationUrl,
  isAllowedToCreateField,
}) {
  const history = useHistory();
  return (
    <Result
      title="No fields in the workspace."
      {...(isAllowedToCreateField
        ? {
            extra: (
              <Button
                size="large"
                type="primary"
                icon={<PlusOutlined></PlusOutlined>}
                onClick={() => {
                  history.push({
                    pathname: createNewFieldUrl,
                    state: {
                      from: redirectPostCreationUrl,
                    },
                  });
                }}
              >
                Create New Field
              </Button>
            ),
          }
        : {})}
    />
  );
}
