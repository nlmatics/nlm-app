import { useContext } from 'react';
import {
  renderBreadCrumbHeaders,
  renderPageNumber,
  renderResult,
} from '../utils/helpers';
import { WorkspaceContext } from './WorkspaceContext';

function AnswerContextRenderer({ searchResult }) {
  const workspaceContext = useContext(WorkspaceContext);
  const renderAnswerBlock = (
    currentSearchResult,
    hiliteEntityTypesList = []
  ) => {
    if (currentSearchResult.group_type !== 'same_location') {
      return (
        <div style={{ height: 180, overflow: 'auto' }}>
          {!currentSearchResult.matches && (
            <span
              style={{ marginBottom: 2 }}
              className="search-result-item--pg-headers"
            >
              <span style={{ marginRight: 3 }}>
                {renderPageNumber(currentSearchResult)}
              </span>
              <span>{renderBreadCrumbHeaders(currentSearchResult)}</span>
            </span>
          )}
          <div style={{ whiteSpace: 'normal' }}>
            {renderResult(
              workspaceContext,
              currentSearchResult,
              hiliteEntityTypesList
            )}
          </div>
        </div>
      );
    }
  };
  return <>{renderAnswerBlock(searchResult)}</>;
}
export default function WorkspaceGridAnswerContextCellRenderer({
  data,
  fieldId,
  fieldName,
}) {
  return (
    <div style={{ width: '100%' }}>
      <AnswerContextRenderer
        searchResult={{ ...data[fieldId], fieldId, fieldName }}
      ></AnswerContextRenderer>
    </div>
  );
}
