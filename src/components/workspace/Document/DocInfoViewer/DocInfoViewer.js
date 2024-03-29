import {
  DatabaseOutlined,
  LeftOutlined,
  ProfileOutlined,
  PushpinOutlined,
  RightOutlined,
  RobotOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Menu, Row } from 'antd';
import { useContext, useEffect, useState } from 'react';
import AppContext from '../../../../contexts/app/AppContext.js';
import { isPubmedFile } from '../../../../utils/helpers.js';
import useFieldBundles from '../../fields/useFieldBundles.js';
import BookMarkViewer from './BookmarkViewer.js';
import DefinitionViewer from './DefinitionViewer.js';
import DetailSider from './DetailSider.js';
import DocSearchView from './DocSearchView.js';
import './index.less';
import NlpResults from './NlpResults.js';
import useDocumentKeyInfo from '../../../../edgar/hooks/useDocumentKeyInfo.js';

export default function DocInfoViewer({
  docActiveTabKey: activeTabKey,
  documentId,
  documentName,
  workspaceId,
  setDetailVisible,
  record,
  renderRowData,
  editedField,
  setEditedField,
  fieldName,
  setRecord,
  fieldBundleId,
  detailVisible,
  isDocInfoVisible,
  setIsDocInfoVisible,
  viewId,
}) {
  const [docActiveTabKey, setDocActiveTabKey] = useState(activeTabKey);
  const { defaultFieldBundleId } = useFieldBundles(workspaceId);
  const { isChattyPdf } = useContext(AppContext);
  const { getDocumentData } = useDocumentKeyInfo(documentId);
  const title = getDocumentData()?.docSectionSummary[0]?.title;

  useEffect(() => {
    if (isPubmedFile(title)) {
      setDocActiveTabKey('search');
    }
  }, [title]);

  return (
    <Row wrap={false} className="nlm-docInfoViewer">
      <Col flex="42px">
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[docActiveTabKey]}
          inlineCollapsed={true}
          onClick={({ key }) => {
            setDocActiveTabKey(key);
            setIsDocInfoVisible(true);
          }}
          items={[
            ...(isChattyPdf()
              ? [
                  {
                    key: 'qna',
                    icon: <RobotOutlined />,
                    label: 'Q&A',
                  },
                ]
              : []),
            { key: 'search', icon: <SearchOutlined />, label: 'Search' },
            {
              key: 'definitions',
              icon: <ProfileOutlined />,
              label: 'Definitions',
            },
            ...(isChattyPdf()
              ? []
              : [
                  {
                    key: 'fields',
                    icon: <DatabaseOutlined />,
                    label: 'Fields',
                  },
                  { key: 'pins', icon: <PushpinOutlined />, label: 'Pins' },
                ]),
          ]}
        />
        <Button
          icon={isDocInfoVisible ? <LeftOutlined /> : <RightOutlined />}
          onClick={() => {
            setIsDocInfoVisible(isDocInfoVisible => !isDocInfoVisible);
            docActiveTabKey
              ? setDocActiveTabKey(null)
              : setDocActiveTabKey('search');
          }}
        />
      </Col>
      <Col
        flex="auto"
        style={{
          display: isDocInfoVisible ? 'block' : 'none',
        }}
      >
        <div style={{ display: docActiveTabKey === 'qna' ? 'block' : 'none' }}>
          <DocSearchView
            documentId={documentId}
            documentName={documentName}
            workspaceId={workspaceId}
            mode={docActiveTabKey}
          ></DocSearchView>
        </div>
        <div
          style={{ display: docActiveTabKey === 'search' ? 'block' : 'none' }}
        >
          <DocSearchView
            documentId={documentId}
            documentName={documentName}
            workspaceId={workspaceId}
            mode={docActiveTabKey}
          ></DocSearchView>
        </div>
        <div
          style={{
            display: docActiveTabKey === 'definitions' ? 'block' : 'none',
          }}
        >
          <Card bodyStyle={{ padding: 10 }}>
            <DefinitionViewer
              quickFilterText={''}
              documentId={documentId}
              documentKeyInfo={getDocumentData()}
              height="calc(100vh - 145px)"
            ></DefinitionViewer>
          </Card>
        </div>
        <div
          style={{ display: docActiveTabKey === 'fields' ? 'block' : 'none' }}
        >
          {detailVisible ? (
            <DetailSider
              renderRowData={renderRowData}
              editedField={editedField}
              setEditedField={setEditedField}
              setDetailVisible={setDetailVisible}
              setRecord={setRecord}
              sourceComponent="docDataView"
              docId={documentId}
              workspaceId={workspaceId}
              siderHeight={195}
              fieldBundleId={fieldBundleId || defaultFieldBundleId}
            />
          ) : (
            <NlpResults
              setDetailVisible={setDetailVisible}
              editedField={editedField}
              setEditedField={setEditedField}
              record={record}
              renderRowData={renderRowData}
              documentId={documentId}
              workspaceId={workspaceId}
              fieldName={fieldName}
              viewId={viewId}
            />
          )}
        </div>
        <div>
          {docActiveTabKey === 'pins' && (
            <BookMarkViewer documentId={documentId}></BookMarkViewer>
          )}
        </div>
      </Col>
    </Row>
  );
}
