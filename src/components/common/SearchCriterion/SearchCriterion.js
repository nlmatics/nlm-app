import { EditOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Tag } from 'antd';
import { useContext } from 'react';
import { getEntityLabelConfig } from '../../../utils/helpers';
import { WorkspaceContext } from '../../WorkspaceContext';

const labelStyle = {
  textAlign: 'right',
};
export default function SearchCriterion({
  criterion,
  index,
  setAdvancedSearchVisible,
}) {
  const {
    question,
    templates,
    headers,
    entityTypes,
    pageStart,
    pageEnd,
    groupFlag,
    tableFlag,
  } = criterion;
  const workspaceContext = useContext(WorkspaceContext);
  const entityLabelConfig = getEntityLabelConfig(workspaceContext);
  return (
    <Card
      bordered={false}
      size="small"
      bodyStyle={{ padding: 10 }}
      title={`Search Criterion ${index + 1}`}
      extra={
        <Button
          icon={<EditOutlined />}
          type="link"
          onClick={() => setAdvancedSearchVisible(true)}
        />
      }
    >
      <Row gutter={[10, 10]}>
        {question && (
          <>
            <Col span={6} style={labelStyle}>
              Query:
            </Col>
            <Col span={18}>{question}</Col>
          </>
        )}
        {!!templates?.length && (
          <>
            <Col span={6} style={labelStyle}>
              Must Have:
            </Col>
            <Col span={18}>
              {templates.map(template => (
                <Tag key={template}>{template}</Tag>
              ))}
            </Col>
          </>
        )}
        {!!headers?.length && (
          <>
            <Col span={6} style={labelStyle}>
              Headings:
            </Col>
            <Col span={18}>
              {headers.map(header => (
                <Tag key={header}>{header}</Tag>
              ))}
            </Col>
          </>
        )}

        {!!entityTypes?.length && (
          <>
            <Col span={6} style={labelStyle}>
              Look for:
            </Col>
            <Col span={18}>
              {entityTypes.map(entityType => (
                <Tag key={entityType}>
                  {entityLabelConfig[entityType]?.label}
                </Tag>
              ))}
            </Col>
          </>
        )}
        {((pageStart && pageStart !== -1) ||
          (pageEnd && pageEnd !== -1) ||
          tableFlag === 'enable' ||
          groupFlag === 'enable') && (
          <>
            <Col span={6} style={labelStyle}>
              Scope:
            </Col>
            <Col span={18}>
              {pageStart && pageStart !== -1 && pageEnd && pageEnd !== -1
                ? `Page: ${pageStart} - ${pageEnd}, `
                : ''}
              {tableFlag === 'enable' ? `Search Tables: Yes, ` : ''}

              {groupFlag === 'enable' ? `Group Answers: Yes` : ''}
            </Col>
          </>
        )}
      </Row>
    </Card>
  );
}
