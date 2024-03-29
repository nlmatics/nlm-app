import { Button, Card, Col, Divider, Row, Typography } from 'antd';
import { useContext } from 'react';
import EntityTypesContext from '../../../contexts/entityTypes/EntityTypesContext';
import { groupTypes } from '../../../utils/constants';
import {
  cloneSearchCritera,
  getEntityLabelConfig,
} from '../../../utils/helpers';
import { WorkspaceContext } from '../../WorkspaceContext';
import './index.less';

const getPubmedLink = pubmedId =>
  `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`;

const getPmcLink = pmcId =>
  `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/`;

const getFormattedDate = dateString => {
  const dateOptions = {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };

  const dateFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
  return dateString ? dateFormatter.format(new Date(dateString)) : '';
};

export default function SearchResultCard({
  docId,
  fileName,
  fileMeta,
  actionMenu,
  searchResult,
  showInFile,
  hideAnswer,
  answerEdited,
  displayFormattedAnswer,
  renderAnswerBlock,
  renderSecondLevel,
  renderPageNumber,
  renderBreadCrumbHeaders,
  itemIndex,
}) {
  const workspaceContext = useContext(WorkspaceContext);
  const { selectedEntityTypes = [] } = useContext(EntityTypesContext) || {};

  const selectedEntityTypeColors = selectedEntityTypes.map(
    ({ color }) => color
  );
  const setDocumentSearchResults = () => {
    const fileFacts = workspaceContext.searchResults.fileFacts.filter(
      fact => fact.fileIdx === docId
    );
    workspaceContext.setDocSearchResults({
      empty: fileFacts.length === 0,
      results: fileFacts,
    });
    workspaceContext.setDocSearchCriteria(
      cloneSearchCritera(workspaceContext.workspaceSearchCriteria)
    );
  };

  const entityLabelConfig = getEntityLabelConfig(workspaceContext);
  const entityTypes = Object.keys(entityLabelConfig).filter(key =>
    selectedEntityTypeColors.includes(entityLabelConfig[key].color)
  );
  return (
    <Card bordered={false} size="small" className="nlm-searchResultCard">
      <div>
        {itemIndex === 0 && (
          <>
            <Row
              align="bottom"
              style={{ paddingTop: 1, paddingBottom: 2, lineHeight: '22.1px' }}
            >
              <Col flex="auto">
                <Typography.Text
                  className="nlm-searchResultCard__fileName"
                  underline
                  style={{
                    textAlign: 'left',
                    padding: 0,
                    height: 20,
                    cursor: 'pointer',
                  }}
                  type="secondary"
                  onClick={e => {
                    setDocumentSearchResults();
                    showInFile(e);
                  }}
                >
                  {fileName}
                </Typography.Text>
              </Col>
              <Col flex="32px">{actionMenu}</Col>
            </Row>
            {fileMeta?.title && (
              <Row>
                <Col>
                  <Typography.Title
                    level={5}
                    type="secondary"
                    style={{ marginBottom: 0 }}
                  >
                    {fileMeta?.title}
                  </Typography.Title>
                </Col>
              </Row>
            )}
            {fileMeta?.authors && (
              <Row style={{ alignItems: 'center' }}>
                <Col>
                  <Typography.Paragraph
                    style={{ width: 750, marginBottom: 0 }}
                    ellipsis={{
                      rows: 1,
                      expandable: true,
                      symbol: 'Show More',
                    }}
                    type="secondary"
                  >
                    {fileMeta?.authors.split(';').map((author, index) => (
                      <span key={author}>
                        {author}
                        {index < fileMeta?.authors.split(';').length - 1 && (
                          <Divider type="vertical"></Divider>
                        )}
                      </span>
                    ))}
                  </Typography.Paragraph>
                </Col>
              </Row>
            )}
            <Row>
              {fileMeta && fileMeta['pubmed:pmid'] && (
                <Col>
                  <label>PMID: </label>
                  <Button
                    style={{ padding: 0 }}
                    className="nlm-searchResultCard__pubmedLinks"
                    type="link"
                    href={getPubmedLink(fileMeta['pubmed:pmid'])}
                    target="_blank"
                  >
                    {fileMeta['pubmed:pmid']}
                  </Button>
                </Col>
              )}
              {fileMeta && fileMeta['pubmed:pmcid'] && (
                <>
                  <Col>
                    <Divider type="vertical"></Divider>
                  </Col>
                  <Col>
                    <label>PMCID: </label>
                    <Button
                      style={{ padding: 0 }}
                      className="nlm-searchResultCard__pubmedLinks"
                      type="link"
                      href={getPmcLink(fileMeta['pubmed:pmcid'])}
                      target="_blank"
                    >
                      {fileMeta['pubmed:pmcid']}
                    </Button>
                  </Col>
                </>
              )}
            </Row>
            <Row>
              {fileMeta?.pubDate && (
                <Col>
                  <Typography.Text italic>
                    {getFormattedDate(fileMeta?.pubDate)}
                  </Typography.Text>
                </Col>
              )}
              {fileMeta?.journalTitle && (
                <>
                  <Col>
                    <Divider type="vertical"></Divider>
                  </Col>
                  <Col>
                    <Typography.Text italic>
                      {fileMeta?.journalTitle}
                    </Typography.Text>
                  </Col>
                </>
              )}
            </Row>
          </>
        )}
        <div className="search-result-item--ans-edit-ctls" />
        {shouldDisplayAnswer() && (
          <Row style={{ marginBottom: 3, paddingTop: 5, lineHeight: '18px' }}>
            <Col flex="auto">
              <Typography.Title level={4} style={{ marginBottom: 0 }}>
                <Typography.Link
                  className="nlm-searchResultCard__answer"
                  onClick={e => {
                    setDocumentSearchResults();
                    showInFile(e);
                  }}
                >
                  {(!hideAnswer || answerEdited) && displayFormattedAnswer}
                </Typography.Link>
              </Typography.Title>
            </Col>
          </Row>
        )}
        <>{renderAnswerBlock(searchResult, entityTypes)}</>
      </div>
      <Row className="search-result-item--sec-level">
        {renderSecondLevel(searchResult)}
      </Row>
      <Row>
        <Col>
          {!!searchResult.matches && (
            <span className="search-result-item--pg-headers">
              {renderPageNumber(searchResult)}
              {renderBreadCrumbHeaders(searchResult)}
            </span>
          )}
        </Col>
      </Row>
    </Card>
  );

  function shouldDisplayAnswer() {
    return (
      !(
        searchResult.group_type === groupTypes.SAME_LOCATION ||
        searchResult.group_type === groupTypes.LIST_ITEM ||
        searchResult.group_type === groupTypes.HEADER_SUMMARY
      ) &&
      ((searchResult.table &&
        searchResult.table.rows.length < 3 &&
        searchResult.table.cols.length < 3) ||
        !searchResult.table) &&
      (searchResult.formatted_answer || searchResult.formatted_answer === '')
    );
  }
}
