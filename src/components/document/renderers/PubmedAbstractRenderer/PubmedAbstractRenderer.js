import { CloseOutlined, HighlightOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Row,
  Space,
  Typography,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import Annotations from '../../../PdfViewer/Annotations';
import {
  getDefaultHilightPhrasesCssRule,
  getHilightAllPhrasesCssRule,
  getHilightClassName,
  getHilightCssRules,
} from '../../../PdfViewer/helpers';
import {
  getAffiliationBlocks,
  getArticleBodyBlocks,
  getAuthorBlocks,
  getDatePublishedBlocks,
  getDoiBlock,
  getJournalTitleBlock,
  getPmcBlock,
  getPmidBlock,
  introduceBlockAndSentenceIds,
} from './helpers';
import './index.css';

const { Title, Paragraph } = Typography;
const getSentenceWithHilighting = ({ uniquePhrases, sentence }) => {
  uniquePhrases.forEach(({ phrase, hilightClasses: [hilightClass] }) => {
    try {
      const regex = new RegExp(`(${phrase})([\\s.,])`, 'g');
      sentence = sentence.replace(
        regex,
        `<span class='${hilightClass}'>$1</span> `
      );
    } catch (error) {
      console.error(error);
    }
  });

  return <span dangerouslySetInnerHTML={{ __html: sentence }}></span>;
};

const renderSentence = ({
  blockIdx,
  pageIdx,
  sentIdx,
  sentence,
  uniquePhrases,
  copyable,
  skipHilighting,
}) => {
  return (
    <span block_idx={blockIdx} page_idx={pageIdx}>
      <span sent_idx={sentIdx}>
        {skipHilighting ? (
          copyable ? (
            <Typography.Text copyable style={{ color: 'inherit' }}>
              {sentence}
            </Typography.Text>
          ) : (
            sentence
          )
        ) : (
          getSentenceWithHilighting({
            uniquePhrases,
            sentence,
          })
        )}
      </span>
    </span>
  );
};
export default function PubmedAbstractRenderer({
  srcJSON,
  documentData,
  entityLabelConfig,
}) {
  let annotationsVisible = localStorage.getItem('pubmed-annotations-visible');
  if (annotationsVisible === null) {
    annotationsVisible = true;
  } else {
    annotationsVisible = annotationsVisible === 'true';
  }
  const [showAnnotations, setShowAnnotations] = useState(annotationsVisible);
  const [activeKey, setActiveKey] = useState(0);
  const parentRef = useRef();
  const renderHtml = () => {
    const {
      title,
      document: { blocks: srcBlocks = [] },
    } = srcJSON;

    const blocks = introduceBlockAndSentenceIds(srcBlocks);
    const entities =
      (documentData?.docEnt?.['0'] &&
        documentData?.docEnt[blocks[0]?.page_idx]) ||
      [];
    const phrases = entities.map(entity => {
      let phrase = entity[0];
      let phraseType = entity[1][0];
      return {
        phrase,
        hilightClasses: [getHilightClassName(phraseType)],
      };
    });

    const uniquePhrases = [
      ...new Map(phrases.map(phrase => [phrase.phrase, phrase])).values(),
    ];
    uniquePhrases.sort((a, b) => (a.phrase.length > b.phrase.length ? -1 : 1));
    console.debug('Phrases to be hilighted:', uniquePhrases);
    const authorBlocks = getAuthorBlocks(blocks);
    const affiliationBlocks = getAffiliationBlocks(blocks);
    const pmidBlock = getPmidBlock(blocks);
    const pmcBlock = getPmcBlock(blocks);
    const doiBlock = getDoiBlock(blocks);
    const articleBodyBlocks = getArticleBodyBlocks(blocks);
    const { monthBlock, yearBlock } = getDatePublishedBlocks(blocks);
    const journalTitleBlock = getJournalTitleBlock(blocks);

    return (
      <>
        <br />
        <Title level={3}>
          {getSentenceWithHilighting({ uniquePhrases, sentence: title })}
        </Title>
        <Row gutter={[12, 12]}>
          {authorBlocks.map(
            (
              {
                lastNameBlock,
                firstNameBlock,
                affiliationBlocks: authorAffiliationBlocks,
              },
              index
            ) => {
              const {
                blockIdx: lastNameBlockIdx,
                page_idx: lastNamePageIdx,
                sentences: [{ text: lastName, sentIdx: lastNameSentIdx }],
              } = lastNameBlock;
              const {
                blockIdx: firstNameBlockIdx,
                page_idx: firstNamePageIdx,
                sentences: [{ text: firstName, sentIdx: firstNameSentIdx }],
              } = firstNameBlock;
              const affiliationIds = authorAffiliationBlocks.flatMap(
                ({ sentences: [{ text: authorText }] }) => {
                  const affiliationId = affiliationBlocks.find(
                    ({ sentences: [{ text }] }) => text === authorText
                  )?.affiliationId;
                  return affiliationId ? [affiliationId] : [];
                }
              );
              return (
                <Col key={index}>
                  <Badge
                    onClick={() =>
                      setActiveKey(activeKey ? '' : 'affiliations')
                    }
                    style={{ cursor: 'pointer', color: 'black' }}
                    count={affiliationIds.join(', ')}
                    offset={[8, -2]}
                    status="default"
                    size="small"
                  >
                    {renderSentence({
                      blockIdx: firstNameBlockIdx,
                      pageIdx: firstNamePageIdx,
                      sentIdx: firstNameSentIdx,
                      uniquePhrases,
                      sentence: firstName,
                    })}{' '}
                    {renderSentence({
                      blockIdx: lastNameBlockIdx,
                      pageIdx: lastNamePageIdx,
                      sentIdx: lastNameSentIdx,
                      uniquePhrases,
                      sentence: lastName,
                    })}
                  </Badge>
                  {index < authorBlocks.length - 1 && (
                    <Divider type="vertical" />
                  )}
                </Col>
              );
            }
          )}
        </Row>
        <Row style={{ marginTop: 5 }}>
          <Collapse
            ghost
            activeKey={activeKey}
            onChange={() => setActiveKey(activeKey ? '' : 'affiliations')}
          >
            <Collapse.Panel header="Affiliations" key="affiliations">
              <div>
                {affiliationBlocks.map(
                  ({
                    blockIdx,
                    page_idx,
                    sentences: [{ text, sentIdx }],
                    affiliationId,
                  }) => {
                    return (
                      <div key={blockIdx}>
                        {affiliationId}{' '}
                        {renderSentence({
                          blockIdx,
                          pageIdx: page_idx,
                          sentIdx,
                          sentence: text,
                          uniquePhrases,
                        })}
                      </div>
                    );
                  }
                )}
              </div>
            </Collapse.Panel>
          </Collapse>
        </Row>
        <Space direction="horizontal">
          {pmidBlock && (
            <span>
              <label>PMID: </label>
              <Button
                style={{ padding: 0 }}
                className="nlm-pubmed-links"
                type="link"
                href={`https://pubmed.ncbi.nlm.nih.gov/${pmidBlock.sentences[0].text}/`}
                target="_blank"
              >
                {renderSentence({
                  blockIdx: pmidBlock.blockIdx,
                  pageIdx: pmidBlock.page_idx,
                  sentIdx: pmidBlock.sentences[0].sentIdx,
                  uniquePhrases,
                  sentence: pmidBlock.sentences[0].text,
                  copyable: true,
                  skipHilighting: true,
                })}
              </Button>
            </span>
          )}

          {pmcBlock && (
            <span>
              <label>PMCID: </label>
              <Button
                style={{ padding: 0 }}
                className="nlm-pubmed-links"
                type="link"
                href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcBlock.sentences[0].text}/`}
                target="_blank"
              >
                {renderSentence({
                  blockIdx: pmcBlock.blockIdx,
                  pageIdx: pmcBlock.page_idx,
                  sentIdx: pmcBlock.sentences[0].sentIdx,
                  uniquePhrases,
                  sentence: pmcBlock.sentences[0].text,
                  copyable: true,
                  skipHilighting: true,
                })}
              </Button>
            </span>
          )}

          {doiBlock && (
            <span>
              <label>DOI: </label>
              <Button
                style={{ padding: 0 }}
                className="nlm-pubmed-links"
                size="large"
                type="link"
                href={`https://doi.org/${doiBlock.sentences[0].text}`}
                target="_blank"
              >
                {renderSentence({
                  blockIdx: doiBlock.blockIdx,
                  pageIdx: doiBlock.page_idx,
                  sentIdx: doiBlock.sentences[0].sentIdx,
                  uniquePhrases,
                  sentence: doiBlock.sentences[0].text,
                })}
              </Button>
            </span>
          )}
        </Space>
        <br />
        <div>
          {renderSentence({
            blockIdx: monthBlock.blockIdx,
            pageIdx: monthBlock.page_idx,
            sentIdx: monthBlock.sentences[0].sentIdx,
            sentence: monthBlock.sentences[0].text,
            uniquePhrases,
          })}
          {' / '}
          {renderSentence({
            blockIdx: yearBlock.blockIdx,
            pageIdx: yearBlock.page_idx,
            sentIdx: yearBlock.sentences[0].sentIdx,
            sentence: yearBlock.sentences[0].text,
            uniquePhrases,
          })}
          <Divider type="vertical" />
          {renderSentence({
            blockIdx: journalTitleBlock.blockIdx,
            pageIdx: journalTitleBlock.page_idx,
            sentIdx: journalTitleBlock.sentences[0].sentIdx,
            sentence: journalTitleBlock.sentences[0].text,
            uniquePhrases,
          })}
        </div>

        <Title level={4}>
          {articleBodyBlocks[0]?.sentences &&
            articleBodyBlocks[0]?.sentences[0]?.text}
        </Title>
        {articleBodyBlocks[0]?.blocks.map(
          ({ headingBlock, descriptionBlock }) => {
            const subHeadingText = headingBlock.sentences[0].text.split(' ');
            /*
              subHeadingText = "Abstract Text METHODS" | "Abstract Text METHODS METHODS" 
            */
            const heading = subHeadingText
              .slice(
                2,
                subHeadingText.length - 1 === 2 ? 3 : subHeadingText.length - 1
              )
              .join(' ');
            const { blockIdx, page_idx, sentences } = descriptionBlock;
            return (
              <>
                <Title level={5}>
                  {renderSentence({
                    blockIdx: headingBlock.blockIdx,
                    pageIdx: headingBlock.page_idx,
                    sentIdx: headingBlock.sentences[0].sentIdx,
                    uniquePhrases,
                    sentence: heading,
                  })}
                </Title>
                <Paragraph style={{ textAlign: 'justify' }}>
                  {sentences.map(({ text, sentIdx }) => {
                    return (
                      <>
                        {renderSentence({
                          blockIdx,
                          sentIdx,
                          pageIdx: page_idx,
                          uniquePhrases,
                          sentence: text,
                        })}{' '}
                      </>
                    );
                  })}
                </Paragraph>
              </>
            );
          }
        )}
      </>
    );
  };

  const addCssRules = cssRules => {
    console.debug('Adding hilight classes to document.head');
    var style = document.createElement('style');
    style.id = 'htmlHilightStyles';
    style.innerHTML = [
      ...cssRules,
      '.pdfViewer .nlm-pdf-hilight-search-term { background-color: #b757ff; padding-bottom: 2px;}',
    ].join(' ');
    document.getElementsByTagName('head')[0].appendChild(style);
  };

  const hilightAllPhrases = allHilightClasses => {
    parentRef.current.className += ' ' + allHilightClasses;
  };

  const unHilightAllPhrases = () => {
    parentRef.current.className = 'nlm-html-renderer';
  };

  const toggleHilightColor = ({ color, checked }) => {
    const hilightClass = `nlm-pdf-hilight-color${color.replace('#', '-')}`;
    checked
      ? parentRef.current.classList.add(hilightClass)
      : parentRef.current.classList.remove(hilightClass);
  };

  useEffect(() => {
    if (parentRef?.current && entityLabelConfig) {
      addCssRules(getHilightCssRules(entityLabelConfig, 45));
      hilightAllPhrases(getDefaultHilightPhrasesCssRule(entityLabelConfig));
      return () => {
        document.querySelector('#htmlHilightStyles')?.remove();
      };
    }
  }, [parentRef.current, entityLabelConfig]);

  return (
    <Row gutter={[10, 10]} className="nlm-pubmedAbstractRenderer">
      <Col flex="auto" style={{ width: 'min-content' }}>
        {entityLabelConfig && (
          <div
            style={{
              position: 'absolute',
              bottom: 3,
              right: 15,
              zIndex: 1,
            }}
          >
            <Button
              type={showAnnotations ? 'default' : 'primary'}
              size="small"
              style={{
                position: 'absolute',
                right: 1,
                zIndex: 2,
                ...(showAnnotations ? { top: 1 } : { bottom: 1 }),
              }}
              icon={showAnnotations ? <CloseOutlined /> : <HighlightOutlined />}
              onClick={() => {
                localStorage.setItem(
                  'pubmed-annotations-visible',
                  !showAnnotations
                );
                setShowAnnotations(showAnnotations => !showAnnotations);
              }}
            ></Button>
            <div style={{ display: showAnnotations ? 'block' : 'none' }}>
              <Annotations
                entityLabelConfig={entityLabelConfig}
                toggleHilightColor={({ color, checked }) =>
                  toggleHilightColor({ color, checked })
                }
                hilightAllPhrases={() => {
                  hilightAllPhrases(
                    getHilightAllPhrasesCssRule(entityLabelConfig)
                  );
                }}
                unHilightAllPhrases={() => unHilightAllPhrases()}
              />
            </div>
          </div>
        )}
        <Card bodyStyle={{ height: 'calc(100vh - 82px)', overflow: 'auto' }}>
          <div id="htmlViewer" className="nlm-html-renderer" ref={parentRef}>
            {srcJSON && renderHtml()}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
