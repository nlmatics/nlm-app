import { Row, Col, Alert, Empty } from 'antd';
import ComparisionColumn from './ComparisonColumn.js';

export default function ComparisionViewer({ comparisonData, fieldBundleId }) {
  return (
    <>
      {comparisonData.length > 0 ? (
        <Row
          style={{
            width: '100%',
            height: '100%',
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
          align="top"
          gutter={16}
        >
          {comparisonData.map(function (item, index) {
            return (
              <Col key={index} span={24 / comparisonData.length}>
                <ComparisionColumn
                  documentId={item.docId}
                  fieldData={item.fieldData}
                  docName={item.docName}
                  fieldBundleId={fieldBundleId}
                ></ComparisionColumn>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty
          description={
            <Alert
              message="No documents selected"
              description="Use Ctrl+Click on the data view to select documents to compare"
              type="error"
            />
          }
        />
      )}
    </>
  );
}
