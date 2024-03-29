import {
  Button,
  Card,
  Checkbox,
  Col,
  message,
  Row,
  Space,
  Typography,
} from 'antd';
import { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import { showError } from '../utils/apiCalls';

import {
  CloseOutlined,
  HighlightOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import useUserInfo from '../hooks/useUserInfo';
import API from '../utils/API.js';
import Annotations from './PdfViewer/Annotations';
import {
  getDefaultHilightPhrasesCssRule,
  getHilightAllPhrasesCssRule,
  getHilightClassName,
  getHilightCssRules,
} from './PdfViewer/helpers';
import FileOutline from './workspace/Document/DocInfoViewer/FileOutline';
import { WorkspaceContext } from './WorkspaceContext.js';

export default forwardRef(function HTMLDocRenderer(
  { srcJSON, documentId, documentData, entityLabelConfig },
  ref
) {
  let annotationsVisible = localStorage.getItem('html-annotations-visible');
  if (annotationsVisible === null) {
    annotationsVisible = true;
  } else {
    annotationsVisible = annotationsVisible === 'true';
  }
  const [showAnnotations, setShowAnnotations] = useState(annotationsVisible);
  const [showFileOutline, setShowFileOutline] = useState(true);
  const [enableApprovalButtons, setEnableApprovalButtons] = useState(false);
  const outlineVisible = localStorage.getItem('html-outline-visible');
  const { data: userInfo } = useUserInfo();
  useEffect(() => {
    setShowFileOutline(outlineVisible === null || outlineVisible === 'true');
  }, [outlineVisible]);

  const workspaceContext = useContext(WorkspaceContext);
  const parentRef = useRef();

  const createTestCase = async body => {
    let response_status = 200;
    let response = 200;
    try {
      let data = {
        correct: body.correct,
        blockHtml: body.blockHtml,
        correctText: body.blockText,
        correctType: body.tagName,
        blockText: body.blockText,
        blockType: body.tagName,
        documentId: documentId,
        pageIdx: parseInt(body.pageIdx),
        workspaceId: workspaceContext.currentDocument.workspaceId,
        userId: userInfo?.id,
      };
      response = await API.post(`/ingestorTestCase/page`, data, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
      response_status = response.status;
    } catch (err) {
      showError(err);
    }
    return response_status;
  };

  const removeTestCase = async body => {
    let response_status = 200;
    let response = 200;
    try {
      let data = {
        correct: body.correct,
        blockHtml: body.blockHtml,
        correctText: body.blockText,
        correctType: body.tagName,
        blockText: body.blockText,
        blockType: body.tagName,
        documentId: documentId,
        pageIdx: parseInt(body.pageIdx),
        workspaceId: workspaceContext.currentDocument.workspaceId,
      };
      response = await API.post(`/ingestorTestCase/modify/page`, data, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
      response_status = response.status;
    } catch (err) {
      showError(err);
    }
    return response_status;
  };

  function handlePageApproval(e, pageIdx) {
    let body = {};
    let status_codes = [];
    let status = 200;
    // approve button click
    let nodeArray = parentRef.current.querySelectorAll(
      `[page_idx="${pageIdx}"]`
    );
    if (nodeArray.length) {
      nodeArray.forEach(element => {
        let blockTag = element.tagName;
        if (blockTag === 'P') {
          body = {
            correct: true,
            pageIdx: pageIdx,
            blockHtml: element.outerHTML,
            blockText: element.innerText,
            tagName: 'para',
          };
          status = createTestCase(body);
        } else if (blockTag === 'TABLE') {
          body = {
            correct: true,
            pageIdx: pageIdx,
            blockHtml: element.outerHTML,
            blockText: element.innerText,
            tagName: 'table',
          };
          status = createTestCase(body);
        } else if (blockTag.charAt(0) === 'H') {
          body = {
            correct: true,
            pageIdx: pageIdx,
            blockHtml: element.outerHTML,
            blockText: element.innerText,
            tagName: 'header',
          };
          status = createTestCase(body);
        } else if (blockTag == 'LI') {
          body = {
            correct: true,
            pageIdx: pageIdx,
            blockHtml: element.outerHTML,
            blockText: element.innerText,
            tagName: 'list_item',
          };
          status = createTestCase(body);
        }
        status_codes.push(status);
      });
      console.info('status_codes', status_codes);
      message.info('Page Approved');
    }
  }

  const handlePageFlag = async (e, pageIdx) => {
    // /ingestorTestCase/flagPage

    let nodeArray = parentRef.current.querySelectorAll(
      `:scope > [page_idx="${pageIdx}"]`
    );
    let html_text = '';
    if (nodeArray.length) {
      nodeArray.forEach(element => {
        html_text += element.outerHTML;
      });
    }
    try {
      let data = {
        user_id: userInfo?.id,
        doc_id: documentId,
        page_idx: pageIdx,
        workspace_id: workspaceContext.currentDocument.workspaceId,
        html_text: html_text,
      };
      await API.post(`/ingestorTestCase/flagPage`, data, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
      message.info('Page Flagged');
    } catch (err) {
      showError(err);
    }
  };

  function handlePageUndoApproval(e, pageIdx) {
    let body = {};
    let status_codes = [];
    let status = 200;
    // approve button click
    let nodeArray = parentRef.current.querySelectorAll(
      `[page_idx="${pageIdx}"]`
    );
    if (nodeArray.length) {
      nodeArray.forEach(element => {
        let blockTag = element.tagName;
        if (blockTag === 'P') {
          body = {
            correct: true,
            pageIdx: pageIdx,
            blockHtml: element.outerHTML,
            blockText: element.innerText,
            tagName: 'para',
          };
          status = removeTestCase(body);
        } else if (blockTag === 'TABLE') {
          body = {
            correct: true,
            pageIdx: pageIdx,
            blockHtml: element.outerHTML,
            blockText: element.innerText,
            tagName: 'table',
          };
          status = removeTestCase(body);
        } else if (blockTag.charAt(0) === 'H') {
          body = {
            correct: true,
            pageIdx: pageIdx,
            blockHtml: element.outerHTML,
            blockText: element.innerText,
            tagName: 'header',
          };
          status = removeTestCase(body);
        } else if (blockTag == 'LI') {
          body = {
            correct: true,
            pageIdx: pageIdx,
            blockHtml: element.outerHTML,
            blockText: element.innerText,
            tagName: 'list_item',
          };
          status = removeTestCase(body);
        }
        status_codes.push(status);
      });
      console.info('status_codes', status_codes);
      message.info('Page Approval Removed');
    }
  }

  const handlePageUndoFlag = async (e, pageIdx) => {
    // /ingestorTestCase/flagPage
    try {
      let data = {
        user_id: userInfo?.id,
        doc_id: documentId,
        page_idx: pageIdx,
        workspace_id: workspaceContext.currentDocument.workspaceId,
      };
      await API.post(`/ingestorTestCase/modify/flagPage`, data, {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
      message.info('Page Flag Removed');
    } catch (err) {
      showError(err);
    }
  };

  const handleTableApproval = async (e, tableIdx) => {
    let tableElems = parentRef.current.querySelectorAll(
      `[table_idx="${tableIdx}"]`
    );
    if (tableElems.length > 0) {
      let tableHtml = tableElems[0].outerHTML;
      let response_status = 200;
      let response = 200;
      try {
        let data = {
          doc_id: documentId,
          user_id: userInfo?.id,
          workspace_id: workspaceContext.currentDocument.workspaceId,
          html_text: tableHtml,
          tag: 'test',
        };
        response = await API.post(`/ingestorTestCase/table`, data, {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        });
        response_status = response.status;
        message.info('Table Approved');
      } catch (err) {
        showError(err);
      }
      return response_status;
    } else {
      message.error("can't find table with id: ", tableIdx);
    }
  };

  const handleTableFlag = async (e, pageIdx, tableIdx) => {
    let tableElems = parentRef.current.querySelectorAll(
      `[table_idx="${tableIdx}"]`
    );
    if (tableElems.length > 0) {
      let tableHtml = tableElems[0].outerHTML;
      // /ingestorTestCase/flagPage
      try {
        let data = {
          user_id: userInfo?.id,
          doc_id: documentId,
          page_idx: pageIdx,
          workspace_id: workspaceContext.currentDocument.workspaceId,
          table_html: tableHtml,
        };
        await API.post(`/ingestorTestCase/flagTable`, data, {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        });
        message.info('Table Flagged');
      } catch (err) {
        showError(err);
      }
    } else {
      message.error("can't find table with id: ", tableIdx);
    }
  };

  const handleTableUndoApproval = async (e, tableIdx) => {
    let tableElems = parentRef.current.querySelectorAll(
      `[table_idx="${tableIdx}"]`
    );
    if (tableElems.length > 0) {
      let tableHtml = tableElems[0].outerHTML;
      let response_status = 200;
      let response = 200;
      try {
        let data = {
          doc_id: documentId,
          user_id: userInfo?.id,
          workspace_id: workspaceContext.currentDocument.workspaceId,
          html_text: tableHtml,
          tag: 'test',
        };
        response = await API.post(`/ingestorTestCase/modify/table`, data, {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        });
        response_status = response.status;
        message.info('Table Approval Removed');
      } catch (err) {
        showError(err);
      }
      return response_status;
    } else {
      message.error("can't find table with id: ", tableIdx);
    }
  };

  const handleTableUndoFlag = async (e, pageIdx, tableIdx) => {
    let tableElems = parentRef.current.querySelectorAll(
      `[table_idx="${tableIdx}"]`
    );
    // /ingestorTestCase/flagPage
    if (tableElems.length > 0) {
      try {
        let tableHtml = tableElems[0].outerHTML;
        let data = {
          user_id: userInfo?.id,
          doc_id: documentId,
          page_idx: pageIdx,
          workspace_id: workspaceContext.currentDocument.workspaceId,
          table_html: tableHtml,
        };
        await API.post(`/ingestorTestCase/modify/flagTable`, data, {
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        });
        message.info('Table Flag Removed');
      } catch (err) {
        showError(err);
      }
    }
  };
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  const renderSents = (block, counts, uniquePhrases) => {
    let sentSpans = [];
    for (let sent of block.sentences) {
      uniquePhrases.forEach(({ phrase, hilightClasses: [hilightClass] }) => {
        try {
          const regex = new RegExp(`(${escapeRegExp(phrase)})([\\s.,])`, 'gi');
          sent = sent.replace(
            regex,
            `<span class='${hilightClass}'>$1</span> `
          );
        } catch (error) {
          console.error(error);
        }
      });

      sentSpans.push(
        <span
          sent_idx={counts.sentIdx}
          dangerouslySetInnerHTML={{ __html: sent }}
          tabIndex={-1}
        ></span>
      );
      counts.sentIdx++;
    }
    return sentSpans;
  };

  const renderTable = (block, counts, uniquePhrases) => {
    let rowElems = [];
    for (let row of block.table_rows) {
      counts.sentIdx++;
      let cellElems = [];
      if (row.cells || row.type === 'full_row') {
        if (row.type === 'table_header') {
          for (let cell of row.cells) {
            cellElems.push(<th colSpan={cell.col_span}>{cell.cell_value}</th>);
          }
        } else if (row.type === 'full_row') {
          cellElems.push(
            <td className="nlm-full-row" colSpan={row.col_span}>
              {row.cell_value}
            </td>
          );
        } else {
          for (let cell of row.cells) {
            if (typeof cell.cell_value === 'string') {
              cellElems.push(
                <td colSpan={cell.col_span}>{cell.cell_value}</td>
              );
            } else {
              cellElems.push(
                <td>{renderBlock(cell.cell_value, counts, uniquePhrases)}</td>
              );
            }
          }
        }
      }
      rowElems.push(<tr>{cellElems}</tr>);
    }
    let actionElems = [];
    if (userInfo?.isAdmin && enableApprovalButtons) {
      const tableIdx = counts.tableIdx;
      actionElems.push(
        <Space style={{ marginTop: '15px', marginBottom: '15px' }}>
          <Button onClick={e => handleTableApproval(e, tableIdx)}>
            Approve Table
          </Button>
          <Button
            onClick={e => handleTableFlag(e, block.page_idx - 1, tableIdx)}
          >
            Flag Table
          </Button>
          <Button onClick={e => handleTableUndoApproval(e, tableIdx)}>
            Undo Approval
          </Button>
          <Button
            onClick={e => handleTableUndoFlag(e, block.page_idx - 1, tableIdx)}
          >
            Undo Flag
          </Button>
        </Space>
      );
    }
    const style = block.level ? { marginLeft: block.level * 20 } : {};
    const tableHTML = (
      <>
        <table
          style={style}
          block_idx={counts.blockIdx}
          table_idx={counts.tableIdx}
          page_idx={block.page_idx}
          top={block.top}
          name={block.name}
          left={block.left}
          tabIndex={-1}
        >
          <tbody>{rowElems}</tbody>
        </table>
        {actionElems}
      </>
    );
    counts.tableIdx++;
    return tableHTML;
  };

  const renderBlock = (block, counts, uniquePhrases) => {
    let elems = [];
    const style = block.level ? { marginLeft: block.level * 20 } : {};
    if (block.tag === 'para') {
      elems.push(
        <Typography.Paragraph
          style={{ ...style, textAlign: 'justify' }}
          block_idx={counts.blockIdx}
          page_idx={block.page_idx}
          tabIndex={-1}
        >
          {renderSents(block, counts, uniquePhrases)}
        </Typography.Paragraph>
      );
    } else if (block.tag === 'header') {
      elems.push(
        <Typography.Title
          style={style}
          block_idx={counts.blockIdx}
          page_idx={block.page_idx}
          level={4}
          tabIndex={-1}
        >
          {renderSents(block, counts, uniquePhrases)}
        </Typography.Title>
      );
    } else if (block.tag === 'list_item') {
      elems.push(
        <Typography.Paragraph
          style={{ ...style, textAlign: 'justify' }}
          block_idx={counts.blockIdx}
          page_idx={block.page_idx}
          tabIndex={-1}
        >
          {renderSents(block, counts, uniquePhrases)}
        </Typography.Paragraph>
      );
    } else if (block.tag === 'table' && block.table_rows) {
      elems.push(renderTable(block, counts, uniquePhrases));
    }
    counts.blockIdx++;
    return elems;
  };
  const renderHtml = () => {
    let prevPageIdx = -1;
    let uniquePhrases;
    const elemsList = [];
    let elems = [];

    let counts = { tableIdx: 0, sentIdx: 0, blockIdx: 0 };
    if (srcJSON.document && srcJSON.document.blocks) {
      for (let idx = 0; idx < srcJSON.document.blocks.length; idx++) {
        let block = srcJSON.document.blocks[idx];
        if (block.page_idx != prevPageIdx && block.page_idx > 0) {
          if (userInfo?.isAdmin && enableApprovalButtons) {
            elems.push(
              <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                <Space>
                  <Button
                    onClick={e => handlePageApproval(e, block.page_idx - 1)}
                  >
                    Approve {block.page_idx} Above
                  </Button>
                  <Button onClick={e => handlePageFlag(e, block.page_idx - 1)}>
                    Flag Page {block.page_idx} Above
                  </Button>
                  <Button
                    onClick={e => handlePageUndoApproval(e, block.page_idx - 1)}
                  >
                    Undo Approval
                  </Button>
                  <Button
                    onClick={e => handlePageUndoFlag(e, block.page_idx - 1)}
                  >
                    Undo Flag
                  </Button>
                </Space>
              </div>
            );
          }
          elemsList.push(elems);
          elems = [];
        }
        const entities =
          (documentData.docEnt && documentData.docEnt[block.page_idx]) || [];
        const phrases = entities.map(entity => {
          let phrase = entity[0];
          let phraseType = entity[1][0];
          return {
            phrase,
            hilightClasses: [getHilightClassName(phraseType)],
          };
        });

        uniquePhrases = [
          ...new Map(phrases.map(phrase => [phrase.phrase, phrase])).values(),
        ];
        uniquePhrases.sort((a, b) =>
          a.phrase.length > b.phrase.length ? -1 : 1
        );
        prevPageIdx = block.page_idx;
        elems.push(<>{renderBlock(block, counts, uniquePhrases)}</>);
      }
      // If only one page is present then add elems explicitly
      if (
        srcJSON.document.blocks[srcJSON.document.blocks.length - 1]
          ?.page_idx === 0
      ) {
        elemsList.push(elems);
      }
    }
    return (
      <Row gutter={[10, 10]}>
        {elemsList.map((elems, index) => (
          <Col key={index} span={24}>
            <Card
              actions={[
                <div
                  key={index + 1}
                  style={{ textAlign: 'center', cursor: 'auto' }}
                >
                  {index + 1}
                </div>,
              ]}
            >
              {elems}
            </Card>
          </Col>
        ))}
      </Row>
    );
    // return elems;
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
    <Row gutter={[10, 10]} wrap={false} className="nlm-htmlDocRenderer">
      <Col flex="auto">
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
                  'html-annotations-visible',
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
        {documentData && (
          <Row>
            <Col span={24}>
              <Card bodyStyle={{ padding: 5 }}>
                <Row
                  style={{
                    position: 'relative',
                  }}
                >
                  <Col span={18}>
                    <Button
                      type={showFileOutline ? 'primary' : 'default'}
                      size="small"
                      icon={<UnorderedListOutlined />}
                      onClick={() => {
                        localStorage.setItem(
                          'html-outline-visible',
                          !showFileOutline
                        );
                        setShowFileOutline(showFileOutline => !showFileOutline);
                      }}
                    ></Button>
                  </Col>
                  <Col span={6}>
                    {userInfo?.isAdmin && (
                      <Checkbox
                        onChange={event => {
                          setEnableApprovalButtons(event.target.checked);
                        }}
                      >
                        Enable Approval Workflow
                      </Checkbox>
                    )}
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )}
        <Row wrap={false}>
          <Col
            style={{ display: showFileOutline ? 'block' : 'none' }}
            flex="205px"
          >
            <FileOutline
              documentData={documentData}
              documentId={documentId}
            ></FileOutline>
          </Col>

          <Col flex="auto">
            <div
              style={{
                height: 'calc(100vh - 118px)',
                overflow: 'hidden auto',
                position: 'relative',
                padding: 10,
              }}
              ref={ref}
            >
              <div
                id="htmlViewer"
                className="nlm-html-renderer"
                ref={parentRef}
              >
                {renderHtml()}
              </div>
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );
});
