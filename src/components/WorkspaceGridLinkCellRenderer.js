import { Button, Typography } from 'antd';
import { forwardRef, useContext, useImperativeHandle, useState } from 'react';
import DocumentContext from '../contexts/document/DocumentContext';

const { Text } = Typography;

export default forwardRef(function LinkCellRenderer(props, ref) {
  const [data, setData] = useState(props.data);
  const { showDocument } = useContext(DocumentContext);

  useImperativeHandle(ref, () => {
    return {
      refresh: params => {
        if (params.data !== data) {
          setData(params.data);
        }
        return true;
      },
    };
  });

  const getGroupDescription = params => {
    return (
      <>
        <li>
          <Text strong ellipsis={true}>
            {params.node.key ? params.node.key : '-'}
          </Text>
        </li>
        <li>
          <Text type="secondary" ellipsis={true}>
            {params.node.rowGroupColumn.colDef.fieldName}
          </Text>
        </li>
      </>
    );
  };
  return (
    <div style={{ width: '100%' }}>
      {data.file_name ? (
        <Button
          size="large"
          type="link"
          style={{
            width: '100%',
            textAlign: 'left',
            padding: 0,
            height: 'auto',
          }}
          onClick={() =>
            showDocument({
              documentId: data.file_idx,
              docActiveTabKey: 'fields',
              onDelete: props.colDef.cellRendererParams.onDocumentDelete,
              viewId: props.colDef.cellRendererParams?.getViewId(),
            })
          }
        >
          {data.file_name}
        </Button>
      ) : (
        <div style={{ marginTop: '10px' }}>{getGroupDescription(props)}</div>
      )}
    </div>
  );
});
