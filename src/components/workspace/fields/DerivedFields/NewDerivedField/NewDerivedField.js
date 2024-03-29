import { CloseOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { Link, useHistory, useLocation } from 'react-router-dom';
import DerivedFieldEditor from '../DerivedFieldEditor';

export default function NewDerivedField({ workspaceId, url }) {
  const history = useHistory();
  const location = useLocation();
  const fieldBundleId = location?.state?.fieldBundleId;
  return (
    <Card
      title="Create Derived Field"
      extra={
        <Link to={`${url}/all`}>
          <Button style={{ marginLeft: 20 }} icon={<CloseOutlined />}></Button>
        </Link>
      }
    >
      <DerivedFieldEditor
        workspaceId={workspaceId}
        parentBundleId={fieldBundleId}
        onEditComplete={({ fieldId }) => {
          history.replace({
            pathname: `${url}/all`,
            state: { refreshDataGrid: fieldId },
          });
        }}
      ></DerivedFieldEditor>
    </Card>
  );
}
