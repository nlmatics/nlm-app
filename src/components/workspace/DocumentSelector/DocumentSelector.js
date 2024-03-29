import { Select } from 'antd';
import { useContext, useEffect, useState } from 'react';
import DocumentContext from '../../../contexts/document/DocumentContext';
import { fetchFilteredDocuments } from '../../../utils/apiCalls';
import debounce from '../../../utils/debounce';
import { WorkspaceContext } from '../../WorkspaceContext';

const { Option } = Select;

export default function DocumentSelector({ workspaceId, documents }) {
  const workspaceContext = useContext(WorkspaceContext);
  const [currentDocuments, setCurrentDocuments] = useState(documents);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const { showDocument } = useContext(DocumentContext);
  useEffect(() => {
    setCurrentDocuments(documents);
  }, [
    documents.length,
    workspaceContext.workspaceSearchVisible,
    workspaceContext.currentDocument.name,
  ]);

  const onSearch = debounce(async value => {
    if (value.length > 3) {
      const documents = await fetchFilteredDocuments(workspaceId, value);
      setCurrentDocuments(documents);
    }
    if (value.length === 0) {
      setCurrentDocuments(documents);
    }
  }, 250);

  return (
    <Select
      showSearch
      placeholder="Search By Document Name"
      style={{ height: 25, textOverflow: 'ellipsis' }}
      size="middle"
      onSelect={docId => {
        // On selecting document app navigates to document page.
        // So no need to set currentDocumentId instead set it to null so that
        // when user navigates back to workspace the search drop down
        // is reset.
        setCurrentDocumentId(null);
        showDocument({
          documentId: docId,
          docActiveTabKey: 'search',
        });
      }}
      allowClear={true}
      onClear={() => {
        setCurrentDocuments(documents);
      }}
      value={currentDocumentId}
      dropdownMatchSelectWidth={400}
      optionFilterProp="children"
      onSearch={onSearch}
    >
      {currentDocuments.length &&
        currentDocuments.map(el => (
          <Option value={el.id} key={el.id} name={el.name}>
            {el.name}
          </Option>
        ))}
    </Select>
  );
}
