import { CloseOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { Link, useHistory, useLocation } from 'react-router-dom';
import WorkflowFieldEditor from '../../../../WorkflowFieldEditor';

export default function NewWorkflowField({ workspaceId, url }) {
  const history = useHistory();
  const location = useLocation();
  const fieldBundleId = location?.state?.fieldBundleId;
  return (
    <Card
      title="Create workflow field"
      extra={
        <Link to={`${url}/all`}>
          <Button style={{ marginLeft: 20 }} icon={<CloseOutlined />}></Button>
        </Link>
      }
    >
      <WorkflowFieldEditor
        workspaceId={workspaceId}
        parentBundleId={fieldBundleId}
        onEditComplete={({ fieldId }) => {
          history.replace({
            pathname: `${url}/all`,
            state: { refreshDataGrid: fieldId },
          });
        }}
      ></WorkflowFieldEditor>
    </Card>
  );
}
