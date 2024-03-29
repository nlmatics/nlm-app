import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import SearchResult from './SearchResult.js';
import { fetchFieldBundleExtractionDataForDoc } from './workspace/fetcher.js';

export default function ComparisionColumn({
  documentId,
  fieldData,
  docName,
  fieldBundleId,
}) {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const fieldBundleExtractionDataforDoc =
        await fetchFieldBundleExtractionDataForDoc({
          fieldBundleId,
          documentId,
        });
      setLoading(false);

      for (let extractionData of fieldBundleExtractionDataforDoc) {
        if (extractionData.topicId === fieldData.fieldId) {
          fieldData.topic_facts = extractionData.topic_facts;
          setSearchResults(fieldData.topic_facts);
        }
      }
    }
    if (!(fieldData.topic_facts && fieldData.topic_facts.length > 0)) {
      fetchData();
    } else {
      setSearchResults(fieldData.topic_facts);
    }
    // searchResultNode.current.scrollTop = 0;
  }, [fieldData]);

  return (
    <Spin spinning={loading}>
      <div>{docName}</div>
      <SearchResult
        searchResults={searchResults}
        resultHandler={() => {}}
        docId={documentId}
        showCriteria={false}
        selectedSearchCriteria={fieldData}
        showCreateFieldButton={false}
        from="extractions"
      ></SearchResult>
    </Spin>
  );
}
