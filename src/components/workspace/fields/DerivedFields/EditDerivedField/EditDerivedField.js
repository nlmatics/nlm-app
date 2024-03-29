import { CloseOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { getFieldDefinition } from '../../../../../utils/apiCalls';
import DerivedFieldEditor from '../DerivedFieldEditor';

export default function EditDerivedField({ url }) {
  const history = useHistory();
  const { derivedFieldId, extractionsMenuKey } = useParams();
  const [derivedField, setDerivedField] = useState(null);

  useEffect(() => {
    if (derivedFieldId && extractionsMenuKey === 'derivedFields') {
      getFieldDefinition(derivedFieldId, setDerivedField);
    }
  }, [derivedFieldId, extractionsMenuKey]);
  return (
    derivedField && (
      <Card
        title="Update Derived Field"
        extra={
          <Link to={`${url}/all`}>
            <Button
              style={{ marginLeft: 20 }}
              icon={<CloseOutlined />}
            ></Button>
          </Link>
        }
      >
        <DerivedFieldEditor
          workspaceId={derivedField.workspaceId}
          fieldEditData={derivedField}
          parentBundleId={derivedField.parentBundleId}
          onEditComplete={({ fieldId }) => {
            history.replace({
              pathname: `${url}/all`,
              state: { refreshDataGrid: fieldId },
            });
          }}
        ></DerivedFieldEditor>
      </Card>
    )
  );
}
