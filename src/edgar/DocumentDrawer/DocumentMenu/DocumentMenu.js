import { Card, Col, Collapse, Row, Spin } from 'antd';
import DocumentDataPoints from './DocumentDataPoints';
import './index.less';
import CustomQuestion from './CustomQuestion';
import {
  BulbOutlined,
  DatabaseOutlined,
  MinusOutlined,
  PlusOutlined,
  RobotOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import DefinitionViewer from '../../../components/workspace/Document/DocInfoViewer/DefinitionViewer';
import useDocumentKeyInfo from '../../hooks/useDocumentKeyInfo';
import DocSearchView from '../../../components/workspace/Document/DocInfoViewer/DocSearchView';
const { Panel } = Collapse;

const getMenuHeader = (icon, title) => (
  <Row wrap={false}>
    <Col flex="25px">{icon}</Col>
    <Col flex="auto">{title}</Col>
  </Row>
);

export default function DocumentMenu({
  workspaceId,
  documentId,
  documentTitle,
}) {
  const { getDocumentData, isLoading: isFetchingDocKeyInfo } =
    useDocumentKeyInfo(documentId);
  return (
    <Card
      bodyStyle={{
        padding: '0',
      }}
      className="edgar-q-n-a "
    >
      <Collapse
        className="document-menu"
        accordion
        defaultActiveKey={['data-points']}
        onChange={() => {}}
        expandIcon={({ isActive }) => {
          return isActive ? <MinusOutlined /> : <PlusOutlined />;
        }}
        expandIconPosition="end"
      >
        {[
          {
            key: 'definitions',
            label: getMenuHeader(<BulbOutlined />, 'Definitions'),
            children: (
              <Spin spinning={isFetchingDocKeyInfo} tip="Getting Definitions">
                <DefinitionViewer
                  quickFilterText={''}
                  documentId={documentId}
                  documentKeyInfo={getDocumentData()}
                  height="calc(100vh - 280px)"
                ></DefinitionViewer>
              </Spin>
            ),
          },
          {
            key: 'qna',
            label: getMenuHeader(<RobotOutlined />, 'Ask a question'),
            children: (
              <CustomQuestion
                documentId={documentId}
                workspaceId={workspaceId}
                documentTitle={documentTitle}
              />
            ),
          },
          {
            key: 'search',
            label: getMenuHeader(<SearchOutlined />, 'Search'),
            children: (
              <DocSearchView
                documentId={documentId}
                documentName={documentTitle}
                workspaceId={workspaceId}
              ></DocSearchView>
            ),
          },
          {
            key: 'data-points',
            label: getMenuHeader(<DatabaseOutlined />, 'Data Points'),
            children: (
              <DocumentDataPoints
                workspaceId={workspaceId}
                documentId={documentId}
              />
            ),
          },
        ].map(({ key, label, children }) => (
          <Panel header={label} key={key}>
            {children}
          </Panel>
        ))}
      </Collapse>
    </Card>
  );
}
