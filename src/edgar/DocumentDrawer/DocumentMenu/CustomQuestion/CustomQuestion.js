import {
  ArrowRightOutlined,
  DownloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Grid,
  Layout,
  message,
  Row,
  Space,
  Spin,
  Typography,
} from 'antd';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useContext, useEffect, useRef, useState } from 'react';
import nlmaticsOnlyIcon from '../../../../assets/images/nlmatics-icon.svg';
import { WorkspaceContext } from '../../../../components/WorkspaceContext';
import DocSearchBox from '../../../../components/workspace/Document/DocInfoViewer/DocSearchBox';
import DownloadQnA from '../../../../chatty-pdf/components/DownloadQnA';

export default function CustomQuestion({
  documentId,
  documentTitle,
  workspaceId,
}) {
  const [searchLoading, setSearchLoading] = useState(false);
  const [advancedSearchVisible, setAdvancedSearchVisible] = useState(false);
  const questionAnswerElementRef = useRef(null);
  const answerElementRef = useRef(null);
  const [answer, setAnswer] = useState('');
  const [showNoAnswerMessage, setShowNoAnswerMessage] = useState(false);
  const workspaceContext = useContext(WorkspaceContext);
  const [downloadingQnA, setDownloadingQnA] = useState(false);
  const [topTenReferences, setTopTenReferences] = useState([]);
  const { useBreakpoint } = Grid;
  const breakpoints = useBreakpoint();
  const downloadQuestionAnswer = questionAnswerElementRef => {
    setDownloadingQnA(true);
    setTimeout(async () => {
      const questionAnswerElement = questionAnswerElementRef.current;
      const canvas = await html2canvas(questionAnswerElement, {
        ignoreElements: element => element.id === 'pdfIframe',
      });
      const data = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      if (typeof link.download === 'string') {
        link.href = data;

        link.download = 'nlmatics-Answer.png';
        link.title = 'nlmatics Answer';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(data);
      }
      setDownloadingQnA(false);
    });
  };

  const getShareData = () => {
    return {
      title: 'nlmatics QnA',
      text: 'Just got mind-blown by the answer generated by @nlmatics ! You need to check this out! #nlmatics #appreciationpost',
      url: 'https://sec.nlmatics.com/',
    };
  };
  const shareUrl = async () => {
    try {
      if (navigator.share) {
        await navigator.share(getShareData());
      }
    } catch (err) {
      console.error(err);
      message.info('Sorry. Could not share.');
    }
  };
  const shareQuestionAnswer = async questionAnswerElementRef => {
    const details = getShareData();
    if (breakpoints.xs) {
      await shareUrl();
    } else {
      setDownloadingQnA(true);
      setTimeout(async () => {
        const questionAnswerElement = questionAnswerElementRef.current;
        const canvas = await html2canvas(questionAnswerElement, {
          ignoreElements: element => element.id === 'pdfIframe',
        });
        canvas.toBlob(async qnaFile => {
          const files = [
            new File([qnaFile], 'nlmatics-Answer.png', {
              type: qnaFile?.type,
            }),
          ];
          setDownloadingQnA(false);
          if (navigator.canShare({ files })) {
            try {
              await navigator.share({ files, ...details });
            } catch (err) {
              console.error(err);
              await shareUrl();
            }
          } else {
            await shareUrl();
          }
        });
      });
    }
  };

  useEffect(() => {
    if (
      workspaceContext.docSearchResults.results?.[0]?.fileIdx === documentId
    ) {
      if (
        workspaceContext.docSearchResults.results &&
        workspaceContext.docSearchResults.results.length > 0
      ) {
        if (
          workspaceContext.docSearchResults.results[0].topicFacts[0]
            ?.block_type === 'summary'
        ) {
          setShowNoAnswerMessage(false);
          setAnswer(
            workspaceContext.docSearchResults.results[0].topicFacts[0]?.answer
          );
          setTopTenReferences(
            workspaceContext.docSearchResults.results[0].topicFacts.slice(1, 11)
          );
        }
      }
    } else {
      if (workspaceContext?.docSearchCriteria?.criterias[0]?.question) {
        setShowNoAnswerMessage(true);
      } else {
        setShowNoAnswerMessage(false);
      }
      setAnswer('');
    }
  }, [workspaceContext.docSearchResults]);

  return (
    <Spin spinning={downloadingQnA} style={{ opacity: '0.3' }}>
      <Layout style={{ padding: 10 }}>
        <DocSearchBox
          docId={documentId}
          workspaceId={workspaceId}
          setSearchLoading={setSearchLoading}
          setAdvancedSearchVisible={setAdvancedSearchVisible}
          advancedSearchVisible={advancedSearchVisible}
          isQnA
        />
        {showNoAnswerMessage && (
          <Alert
            message="Could not find an answer."
            type="info"
            showIcon
            style={{ marginTop: 10 }}
          />
        )}
        {(searchLoading || answer) && (
          <Card
            loading={searchLoading}
            style={{
              marginBottom: 10,
              marginTop: 5,
              display: advancedSearchVisible ? 'none' : 'block',
            }}
            bodyStyle={{
              padding: 12,
              maxHeight: `calc(100vh - ${breakpoints.xs ? 357 : 287}px)`,
              overflow: 'auto',
            }}
            title={
              <img
                width={25}
                height={25}
                src={nlmaticsOnlyIcon}
                alt="nlmatics Logo"
              />
            }
            size="small"
            extra={
              <Space>
                {document.execCommand && (
                  <Typography.Text
                    copyable={{
                      onCopy: () => {
                        const selection = window.getSelection();
                        selection.removeAllRanges();

                        const range = document.createRange();
                        range.selectNodeContents(answerElementRef.current);
                        selection.addRange(range);
                        document.execCommand('copy');
                        selection.removeAllRanges();
                      },
                    }}
                  >
                    &nbsp;
                  </Typography.Text>
                )}

                <Button
                  icon={<DownloadOutlined />}
                  disabled={searchLoading}
                  type="link"
                  onClick={() =>
                    downloadQuestionAnswer(questionAnswerElementRef)
                  }
                />
                {navigator.share && (
                  <Button
                    key="share-qna"
                    icon={<ShareAltOutlined />}
                    disabled={searchLoading}
                    type="link"
                    onClick={() =>
                      shareQuestionAnswer(questionAnswerElementRef)
                    }
                  ></Button>
                )}
              </Space>
            }
          >
            {
              <Typography.Paragraph
                style={{
                  marginBottom: 0,
                }}
                ref={answerElementRef}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {answer}
                </ReactMarkdown>
              </Typography.Paragraph>
            }
          </Card>
        )}
        {answer && (
          <Row
            gutter={[10, 10]}
            style={{
              display: advancedSearchVisible ? 'none' : 'block',
            }}
          >
            <Col span={24}>References:</Col>
            <Col span={24}>
              {topTenReferences.map(topicFact => (
                <Row
                  key={topicFact.uniq_id}
                  style={{ marginTop: 10 }}
                  wrap={false}
                >
                  <Col flex="25px">
                    <ArrowRightOutlined size="small"></ArrowRightOutlined>
                  </Col>
                  <Col flex="auto">
                    <Typography.Link
                      onClick={() =>
                        workspaceContext.setSearchPDF([
                          topicFact['page_idx'],
                          {
                            selectedBlock: topicFact,
                            phraseSearch: true,
                            caseSensitive: false,
                            entireWord: false,
                            highlightAll: false,
                            findPrevious: undefined,
                          },
                        ])
                      }
                    >
                      {topicFact.hierarchy_headers.join(' > ')}
                    </Typography.Link>
                  </Col>
                </Row>
              ))}
            </Col>
          </Row>
        )}
        {answer && (
          <div style={{ display: downloadingQnA ? 'block' : 'none' }}>
            <DownloadQnA
              ref={questionAnswerElementRef}
              documentName={documentTitle}
              answer={answer}
              question={
                workspaceContext?.docSearchCriteria?.criterias &&
                workspaceContext?.docSearchCriteria?.criterias[0]?.question
              }
            />
          </div>
        )}
      </Layout>
    </Spin>
  );
}
