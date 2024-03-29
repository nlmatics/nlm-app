import { CloseOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { getFieldDefinition } from '../../../../../utils/apiCalls';
import WorkflowFieldEditor from '../../../../WorkflowFieldEditor';

export default function EditWorkflowField({ url }) {
  const history = useHistory();
  const { workflowFieldId, extractionsMenuKey } = useParams();
  const [workflowField, setWorkflowField] = useState(null);

  useEffect(() => {
    if (workflowFieldId && extractionsMenuKey === 'workflowFields') {
      getFieldDefinition(workflowFieldId, setWorkflowField);
    }
  }, [workflowFieldId, extractionsMenuKey]);
  return (
    workflowField && (
      <Card
        title="Update workflow field"
        extra={
          <Link to={`${url}/all`}>
            <Button
              style={{ marginLeft: 20 }}
              icon={<CloseOutlined />}
            ></Button>
          </Link>
        }
      >
        <WorkflowFieldEditor
          workspaceId={workflowField.workspaceId}
          fieldEditData={workflowField}
          parentBundleId={workflowField.parentBundleId}
          onEditComplete={({ fieldId }) => {
            history.replace({
              pathname: `${url}/all`,
              state: { refreshDataGrid: fieldId },
            });
          }}
        ></WorkflowFieldEditor>
      </Card>
    )
  );
}
