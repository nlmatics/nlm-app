import {
  BorderOuterOutlined,
  HighlightOutlined,
  MinusOutlined,
  TableOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Row,
  Space,
  Spin,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import ThemeContext from '../../contexts/theme/ThemContext.js';
import { getMLBBoxes, getSavedBBoxes, saveBBox } from '../../utils/apiCalls';
import { answerTypeDescriptions } from '../../utils/constants.js';
import PDFJSBackend from '../../utils/pdfjs.js';
import FileOutline from '../workspace/Document/DocInfoViewer/FileOutline.js';
import DocumentConfigContext from '../workspace/Document/DocumentConfigContext.js';
import { WorkspaceContext } from '../WorkspaceContext.js';
import Annotations from './Annotations';
import {
  getDefaultHilightPhrasesCssRule,
  getHideControlsCssRule,
  getHilightAllPhrasesCssRule,
  getHilightClassName,
  getHilightCssRules,
  getPositionResetCssRule,
} from './helpers.js';

import './index.less';
import ReferenceDefinition from './ReferenceDefinition';
import useDocumentKeyInfo from '../../edgar/hooks/useDocumentKeyInfo.js';
import useDocument from '../../edgar/hooks/useDocument.js';

export default function PdfViewer({
  currentDocument,
  workspaceId,
  documentId,
  entityLabelConfig,
  documentHeight,
  implicitOutline,
  isEdgar,
}) {
  const { getDocumentData } = useDocumentKeyInfo(documentId);
  let annotationsVisible = localStorage.getItem('annotations-visible');
  if (annotationsVisible === null) {
    annotationsVisible = true;
  } else {
    annotationsVisible = annotationsVisible === 'true';
  }

  const { theme, THEMES, BRAND_COLOR } = useContext(ThemeContext);
  const { showTablesOnly } = useContext(DocumentConfigContext);
  const [showAnnotations, setShowAnnotations] = useState(annotationsVisible);
  const [showFileOutline, setShowFileOutline] = useState(false);
  const viewerRef = useRef();
  const nlmExtensionsRef = useRef();
  const workspaceContext = useContext(WorkspaceContext);
  const boxLayerName = 'savedDrawingsLayer';
  const renderedPagesRef = useRef({});
  const prevHilightedKeywords = useRef([]);
  const [pdfApplication, setPdfApplication] = useState(null);
  const [showReferenceDefinition, setShowReferenceDefinition] = useState(false);
  const [showReferenceDefinitions, setShowReferenceDefinitions] = useState(
    localStorage.getItem('reference-definitions-visible') === 'true'
  );
  const [termPagePosition, setTermPagePosition] = useState({
    pageY: 0,
  });
  const [term, setTerm] = useState();
  const [referenceDefinition, setReferenceDefinition] = useState([]);

  const [revealedAnnotations, setRevealedAnnotations] = useState(
    localStorage.getItem('nlm-revealed-annotations') === 'true'
  );
  const [revealedReferenceDefinitions, setRevealedReferenceDefinitions] =
    useState(
      localStorage.getItem('nlm-revealed-reference-definitions') === 'true'
    );

  const savedBBoxStroke = {
    strokeColor: 'red',
    strokeWidth: 3,
    strokeDash: [4, 4],
  };
  const mlBBoxStroke = {
    strokeColor: 'purple',
    strokeWidth: 3,
    strokeDash: [3, 3],
  };
  const [savedBBoxesByPage, setSavedBBoxesByPage] = useState({});
  const [currentBlock, setCurrentBlock] = useState(null);
  const [isSelectedBlockTable, setIsSelectedBlockTable] = useState(false);
  // eslint-disable-next-line
  const [showSavedTables, setShowSavedTables] = useState({ checked: false });
  const [changedBBox, setChangedBBox] = useState(null);
  const [pageNumber, setPageNumber] = useState(-1);
  const [pdfInteractiveMode, setPdfInteractiveMode] = useState(false);
  const [isPdfInitialized, setIsPdfInitialized] = useState(false);

  const { data: pdfDocument, isLoading: isFetchingDocument } = useDocument({
    workspaceId,
    documentId,
  });
  const outlineVisible = localStorage.getItem('outline-visible');
  useEffect(() => {
    setShowFileOutline(
      implicitOutline && (outlineVisible === null || outlineVisible === 'true')
    );
  }, [outlineVisible, implicitOutline]);

  useEffect(() => {
    if (workspaceContext?.iframe?.contentWindow) {
      const sidebarToggle =
        workspaceContext.iframe.contentWindow.document.getElementById(
          'sidebarToggle'
        );
      ['openFile', 'print', 'editorModeButtons', 'editorModeSeparator'].forEach(
        id => {
          workspaceContext.iframe.contentWindow.document.getElementById(
            id
          ).style.display = 'none';
        }
      );

      if (implicitOutline) {
        const toggleSidebar = () => {
          setTimeout(() => {
            const showFileOutline = sidebarToggle.classList.contains('toggled');
            localStorage.setItem('outline-visible', showFileOutline);
            setShowFileOutline(showFileOutline);
          });
        };
        sidebarToggle?.addEventListener('click', toggleSidebar);
        return () => {
          sidebarToggle?.removeEventListener('click', toggleSidebar);
        };
      } else {
        sidebarToggle.style.display = 'none';
      }
    }
  }, [workspaceContext?.iframe, implicitOutline]);

  useEffect(() => {
    const pdfViewerLoaded = event => {
      const pdfApplication = event.detail.source.PDFViewerApplication;
      setPdfApplication(pdfApplication);
      const nlmExtensions = event.detail.source.nlmExtensions;
      nlmExtensionsRef.current = nlmExtensions;
      setIsPdfInitialized(true);
    };

    const webViewerLoadedEvent = 'webviewerloaded';
    let element;
    let pdfIframe;
    let viewerElement;
    let pdfIframeDocumentElement;

    const onCopyHandler = event => {
      // Remove unnecessary new lines when copying
      const selection = pdfIframeDocumentElement.getSelection();
      event.clipboardData.setData(
        'text/plain',
        selection.toString().replaceAll(/\r?\n|\r/g, ' ')
      );
      event.preventDefault();
    };

    function initializePdfDocument() {
      if (pdfDocument.type === 'application/pdf') {
        const source = URL.createObjectURL(pdfDocument);
        if (source && workspaceContext) {
          const outlineVisible = localStorage.getItem('outline-visible');
          const showFileOutline =
            implicitOutline &&
            (outlineVisible === null || outlineVisible === 'true');

          element = viewerRef.current;
          document.addEventListener(webViewerLoadedEvent, pdfViewerLoaded);
          pdfIframe = PDFJSBackend.init({
            source,
            element,
            pagemode: showFileOutline ? 'outline' : 'none',
            onload: function () {
              console.debug('PDF iframe is ready');
              pdfIframe.style.border = 0;
              workspaceContext.setIframe(pdfIframe);
              pdfIframeDocumentElement =
                pdfIframe.contentDocument || pdfIframe.contentWindow.document;
              viewerElement = pdfIframeDocumentElement.getElementById('viewer');

              if (theme === THEMES.DARK) {
                viewerElement.style.filter =
                  'invert(68%) contrast(228%) brightness(80%) hue-rotate(180deg)';
              }
              viewerElement?.addEventListener('copy', onCopyHandler);
            },
          });
        }
      }
    }
    pdfDocument && initializePdfDocument();
    return () => {
      document.removeEventListener(webViewerLoadedEvent, pdfViewerLoaded);
      viewerElement?.removeEventListener('copy', onCopyHandler);
      console.debug('Removing pdf iframe');
      pdfIframe && element?.removeChild(pdfIframe);
    };
  }, [pdfDocument]);

  useEffect(() => {
    const postInitializeDocument = () => {
      // HACK: Setting _contentDispositionFilename which is later used to set the doc name for downloaded file.
      if (currentDocument?.name) {
        pdfApplication._contentDispositionFilename =
          currentDocument?.name.replaceAll(' ', '_');
      }

      nlmExtensionsRef.current.addCssRules(
        [
          `
          .textLayer {
            opacity: 1 !important;
          }
          .textLayer ::selection {
            color: #fff;
            background: ${BRAND_COLOR};
          }
          .textLayer .highlight.selected {
            background-color: ${BRAND_COLOR}52;
          }
          .textLayer .highlight {
            background-color: ${BRAND_COLOR}52;
          }
        `,
          ...getHilightCssRules(entityLabelConfig),
          // v3.1.81 of pdfjs has an update in css rule from `.textLayer > span` to `.textLayer span`
          // hence handle the position of hilighted spans to avoid them being set as `absolute`
          // coz it messes up the position of text in the text layer and hence hilighting.
          ...getPositionResetCssRule(entityLabelConfig),
          ...getPositionResetCssRule(answerTypeDescriptions),
          // From BE API we receive few entries in documentData.docEnt where entity is `others`.
          ...getPositionResetCssRule({ others: {} }),
          getHideControlsCssRule(),
          `
          .nlm-reference-definitions span.nlm-reference-definition {
            text-decoration-line: underline;
            text-decoration-color: ${BRAND_COLOR};
            text-decoration-thickness: 1px;
            cursor: help;
          }
          span.nlm-reference-definition, span[class^="nlm-pdf-hilight-search-keyword-"] {
            position: static !important;
          }
        `,
        ],
        BRAND_COLOR
      );

      revealedAnnotations &&
        localStorage.getItem('hilight-annotations') === 'true' &&
        nlmExtensionsRef.current.hilightAllPhrases(
          getDefaultHilightPhrasesCssRule(entityLabelConfig)
        );
      revealedReferenceDefinitions &&
        showReferenceDefinitions &&
        nlmExtensionsRef.current.showReferenceDefinitions(
          'nlm-reference-definitions'
        );

      if (workspaceContext.searchPDF) {
        searchPDF(workspaceContext.searchPDF[0], workspaceContext.searchPDF[1]);
      }
    };

    isPdfInitialized &&
      getDocumentData()?.docEnt &&
      entityLabelConfig &&
      workspaceContext.iframe &&
      postInitializeDocument();
  }, [
    getDocumentData().docEnt,
    entityLabelConfig,
    isPdfInitialized,
    workspaceContext.iframe,
    currentDocument?.name,
  ]);

  useEffect(() => {
    if (
      workspaceContext?.iframe?.contentWindow &&
      getDocumentData()?.referenceDefinitions
    ) {
      const viewerElement =
        workspaceContext.iframe.contentWindow.document.getElementById('viewer');
      const showReferenceDefinitionHandler = event => {
        if (
          event.target.classList.contains('nlm-reference-definition') &&
          getDocumentData().referenceDefinitions[event.target.textContent]
        ) {
          setShowReferenceDefinition(true);
          setReferenceDefinition(
            getDocumentData().referenceDefinitions[event.target.textContent]
          );
          setTerm(event.target.textContent);
          const { pageY } = event;
          setTermPagePosition({ pageY });
        }
      };
      if (showReferenceDefinitions) {
        viewerElement?.addEventListener(
          'click',
          showReferenceDefinitionHandler
        );
      } else {
        viewerElement?.removeEventListener(
          'click',
          showReferenceDefinitionHandler
        );
      }

      return () => {
        viewerElement?.removeEventListener(
          'click',
          showReferenceDefinitionHandler
        );
      };
    }
  }, [
    showReferenceDefinitions,
    workspaceContext?.iframe?.contentWindow,
    getDocumentData()?.referenceDefinitions,
  ]);

  const hilightPhrases = (nlmExtensions, pageView, pageIdx) => {
    if (getDocumentData().docEnt) {
      const onTextLayerReady = () =>
        new Promise(resolve => {
          const waitForTextLayer = () => {
            if (pageView.textLayer?.renderingDone) {
              resolve();
            } else {
              window.requestAnimationFrame(waitForTextLayer);
            }
          };
          waitForTextLayer();
        });
      const onTextLayerReadyHandler = () => {
        console.debug(`Text layer is ready for page number ${pageIdx}`);
        const entities = getDocumentData().docEnt[pageIdx] || [];
        const referenceDefinitionsMap = getDocumentData().referenceDefinitions;
        const referenceDefinitionKeys = Object.keys(referenceDefinitionsMap);

        const phrases = entities.map(entity => {
          let phrase = entity[0];
          let phraseType = entity[1][0];
          return {
            phrase,
            // Add additional class 'nlm-pdf-hilight-search-keyword-p_h_r_a_s_e' when phrase is a single word
            // is set so that if this phrase being annotated
            // is also later searched as keyword then we don't have to find the span again. It is cached and can
            // be used from cache. See method 'addHilightClassForPhrase' it has a check: span.className.includes(searchTermHilightClass-p_h_r_a_s_e).
            // The placeholder class will allow this check to pass and hilight the keyword
            hilightClasses: [
              getHilightClassName(phraseType),
              phrase.trim().split(' ').length === 1
                ? // Convert phrase say cancer to c_a_n_c_e_r before suffixing to class name to avoid it being considered as a keyword while hilighting
                  `nlm-pdf-hilight-search-keyword-${phrase.split('').join('_')}`
                : '',
            ],
          };
        });

        const referenceDefinitions = referenceDefinitionKeys.map(key => {
          return {
            phrase: key,
            hilightClasses: ['nlm-reference-definition'],
          };
        });

        const uniquePhrases = [
          ...new Map(
            [...phrases, ...referenceDefinitions].map(phrase => [
              phrase.phrase,
              phrase,
            ])
          ).values(),
        ];

        uniquePhrases?.length &&
          nlmExtensions.hilightPhrases(uniquePhrases, pageView.textLayer);
      };
      onTextLayerReady().then(onTextLayerReadyHandler);
    }
  };

  useEffect(() => {
    if (workspaceContext.iframe && currentBlock) {
      workspaceContext.iframe.contentWindow.nlmExtensions.drawBox(
        currentBlock,
        renderedPagesRef.current[pageNumber],
        pdfInteractiveMode && isSelectedBlockTable,
        onBoxChange
      );
    }
  }, [pdfInteractiveMode]);

  useEffect(() => {
    if (workspaceContext.searchPDF) {
      searchPDF(workspaceContext.searchPDF[0], workspaceContext.searchPDF[1]);
    }
  }, [workspaceContext.searchPDF]);

  const onBoxChange = newBBox => {
    setChangedBBox(newBBox);
  };

  const resetBoxChanges = () => {
    setChangedBBox(null);
    workspaceContext.iframe.contentWindow.nlmExtensions.drawBox(
      currentBlock,
      renderedPagesRef.current[pageNumber],
      pdfInteractiveMode && isSelectedBlockTable,
      onBoxChange
    );
  };

  const saveBoxChanges = () => {
    let bboxInfo = {
      audited: true,
      bbox: changedBBox ? changedBBox : currentBlock.table_bbox,
      blockId: currentBlock.match_idx,
      blockType: 'table',
      pageId: currentBlock.table_page_idx,
    };
    saveBBox(documentId, bboxInfo);
    bboxInfo.stroke = savedBBoxStroke;
    let pageNumber = bboxInfo.pageId + 1;
    if (!(pageNumber in savedBBoxesByPage)) {
      savedBBoxesByPage[pageNumber] = [];
    }
    savedBBoxesByPage[pageNumber].push(bboxInfo);
    hiliteBBoxes(pageNumber, savedBBoxesByPage);
  };

  const hiliteSavedBboxes = async () => {
    let savedBboxesInfo = await getSavedBBoxes(documentId);
    let res = await getMLBBoxes(documentId);
    let mlBboxesInfo = res.ml_bbox;
    setSavedBBoxesByPage({});
    for (let bboxInfo of savedBboxesInfo) {
      bboxInfo.stroke = savedBBoxStroke;
      let pageNumber = bboxInfo.pageId + 1;
      if (!(pageNumber in savedBBoxesByPage)) {
        savedBBoxesByPage[pageNumber] = [];
      }
      savedBBoxesByPage[pageNumber].push(bboxInfo);
    }
    for (let bboxInfo of mlBboxesInfo) {
      let pageNumber = bboxInfo.page_idx;
      if (!(pageNumber in savedBBoxesByPage)) {
        savedBBoxesByPage[pageNumber] = [];
      }
      if (bboxInfo.labels.table) {
        for (let table of bboxInfo.labels.table) {
          savedBBoxesByPage[pageNumber].push({
            bbox: table,
            stroke: mlBBoxStroke,
          });
        }
      }
    }
    for (const [pageId] of Object.entries(renderedPagesRef.current)) {
      hiliteBBoxes(pageId, savedBBoxesByPage);
    }
  };

  const hiliteBBoxes = async (pageId, savedBBoxesByPage) => {
    let bboxInfos = savedBBoxesByPage[pageId];
    let pageView = renderedPagesRef.current[pageId];
    if (bboxInfos && pageView) {
      workspaceContext.iframe.contentWindow.nlmExtensions.drawOutline(
        pageView,
        boxLayerName,
        bboxInfos
      );
    }
  };

  const hiliteSavedTables = async checked => {
    showSavedTables.checked = checked;
    if (checked) {
      hiliteSavedBboxes();
    } else {
      // eslint-disable-next-line
      for (const [pageId, pageView] of Object.entries(
        renderedPagesRef.current
      )) {
        workspaceContext.iframe.contentWindow.nlmExtensions.clearOutline(
          pageView
        );
      }
    }
  };
  const searchPDF = (pageIdx, { selectedBlock }) => {
    if (selectedBlock.is_override) return;

    let hiliteText =
      selectedBlock.answer && selectedBlock.answer.trim() !== ''
        ? selectedBlock.answer
        : selectedBlock.phrase;
    if (selectedBlock.table) {
      if (
        selectedBlock.table.cols.length == 2 &&
        selectedBlock.table.cols[1] &&
        !selectedBlock.table.cols[1].trim() == ''
      ) {
        if (selectedBlock.table.rows.length > 1) {
          hiliteText = selectedBlock.table.cols[1];
        } else {
          hiliteText = selectedBlock.table.rows[0][1];
        }
      } else if (
        selectedBlock.table.cols.length > 1 &&
        selectedBlock.table.rows.length > 1
      ) {
        hiliteText = selectedBlock.header_text;
      } else if (
        selectedBlock.table.rows.length == 1 &&
        selectedBlock.table.cols.length > 1
      ) {
        hiliteText = selectedBlock.table.rows[0].join(' ');
      }
    }

    const keywords = selectedBlock.match_text_terms;
    const waitForContentWindow = () =>
      new Promise(resolve => {
        const waitForElement = () => {
          if (viewerRef.current) {
            let pdfIframe = viewerRef.current.querySelector('#pdfIframe');
            if (
              pdfIframe &&
              pdfIframe.contentWindow &&
              pdfIframe.contentWindow.frames.PDFViewerApplication &&
              pdfIframe.contentWindow.frames.PDFViewerApplication.pdfViewer
            ) {
              resolve(pdfIframe);
            } else {
              window.requestAnimationFrame(waitForElement);
            }
          } else {
            window.requestAnimationFrame(waitForElement);
          }
        };
        waitForElement();
      });
    waitForContentWindow().then(pdfIframe => {
      const pdfApplication =
        pdfIframe.contentWindow.frames.PDFViewerApplication;

      if (currentBlock) {
        if (currentBlock.page_idx + 1 in renderedPagesRef.current) {
          if (pdfIframe.contentWindow?.nlmExtensions) {
            pdfIframe.contentWindow.nlmExtensions.clearBox(
              renderedPagesRef.current[currentBlock.page_idx + 1]
            );
          }
        }
      }
      setCurrentBlock(selectedBlock);
      setChangedBBox(null);

      const pdfViewer = pdfApplication.pdfViewer;
      let pageNumber = pageIdx + 1;
      if (selectedBlock.table_bbox && selectedBlock.table_page_idx) {
        pageNumber = selectedBlock.table_page_idx + 1;
      }
      setPageNumber(pageNumber);
      pdfApplication.page = pageNumber;
      pdfApplication.toolbar.setPageNumber(
        pdfViewer.currentPageNumber,
        pageNumber
      );
      let selectedBlockTable =
        selectedBlock.table_bbox && selectedBlock.table_bbox.length > 0;
      setIsSelectedBlockTable(selectedBlockTable);

      const hiliteOnRender = pg =>
        new Promise(resolve => {
          const waitForElement = () => {
            if (
              pg in renderedPagesRef.current &&
              renderedPagesRef.current[pg].textLayer &&
              renderedPagesRef.current[pg].textLayer.renderingDone
            ) {
              resolve(pg);
            } else {
              pdfApplication.page = pg;
              window.requestAnimationFrame(waitForElement);
            }
          };
          waitForElement();
        });
      hiliteOnRender(pageNumber).then(pg => {
        console.debug('hiltite on rendrerer is called');
        let pdfIframe = viewerRef.current.querySelector('#pdfIframe');
        if (!(selectedBlock.table_bbox || selectedBlock.header_bbox)) {
          prevHilightedKeywords.current.forEach(
            ({ phrase, textLayer, searchTermHilightClass }) => {
              pdfIframe.contentWindow.nlmExtensions.removeHilightClassForPhrase(
                {
                  phrase,
                  textLayer,
                  searchTermHilightClass,
                }
              );
            }
          );
          prevHilightedKeywords.current = [];

          pdfIframe.contentWindow.nlmExtensions.hilightPhrase({
            phrase: hiliteText,
            pageView: renderedPagesRef.current[pg],
            selectedBlock,
            searchTermHilightClass: 'nlm-pdf-hilight-search-term',
          });

          prevHilightedKeywords.current.push({
            phrase: hiliteText,
            textLayer: renderedPagesRef.current[pg].textLayer,
            searchTermHilightClass: 'nlm-pdf-hilight-search-term',
          });

          keywords?.forEach(keyword => {
            pdfIframe.contentWindow.nlmExtensions.hilightPhrase({
              phrase: keyword,
              pageView: renderedPagesRef.current[pg],
              searchTermHilightClass: 'nlm-pdf-hilight-search-keyword',
            });

            prevHilightedKeywords.current.push({
              phrase: keyword,
              textLayer: renderedPagesRef.current[pg].textLayer,
              searchTermHilightClass: 'nlm-pdf-hilight-search-keyword',
            });
          });

          pdfIframe.contentWindow.nlmExtensions.drawBox(
            selectedBlock,
            renderedPagesRef.current[pg],
            pdfInteractiveMode && selectedBlockTable,
            onBoxChange
          );
        } else {
          pdfIframe.contentWindow.nlmExtensions.drawBox(
            selectedBlock,
            renderedPagesRef.current[pg],
            pdfInteractiveMode && selectedBlockTable,
            onBoxChange
          );
        }
      });
    });
  };

  const waitForEventBus = () => {
    return new Promise(resolve => {
      const poller = () => {
        if (pdfApplication?.eventBus) {
          resolve(pdfApplication);
        } else {
          window.requestAnimationFrame(poller);
        }
      };
      poller();
    });
  };

  useEffect(() => {
    pdfApplication &&
      waitForEventBus().then(pdfApplication => {
        pdfApplication?.eventBus?.on('pagerendered', function (renderEvent) {
          let pageView = renderEvent.source;
          let pageNumber = renderEvent.pageNumber;

          renderedPagesRef.current[pageNumber] = pageView;

          let bboxInfos = savedBBoxesByPage[pageNumber];
          if (bboxInfos && showSavedTables.checked) {
            nlmExtensionsRef.current.drawOutline(
              pageView,
              boxLayerName,
              bboxInfos
            );
          }
          hilightPhrases(nlmExtensionsRef.current, pageView, pageNumber - 1);
        });
      });
  }, [pdfApplication]);

  return (
    <Spin size="large" tip="Downloading PDF..." spinning={isFetchingDocument}>
      <div style={{ position: 'relative' }} className="nlm-pdfViewer">
        {showTablesOnly && (
          <div style={{ position: 'absolute', top: 5, left: 250, zIndex: 2 }}>
            <Divider type="vertical"></Divider>
            <Space align="start">
              <Tooltip placement="leftBottom" title={'Show all saved tables.'}>
                <Switch
                  size="small"
                  checkedChildren={<TableOutlined></TableOutlined>}
                  unCheckedChildren={<TableOutlined></TableOutlined>}
                  onChange={checked => hiliteSavedTables(checked)}
                ></Switch>
              </Tooltip>
              <Tooltip
                placement="leftBottom"
                title={
                  'Adjust table boundaries to adjust tables. Switching this option on will disable text selection on the pdf.'
                }
              >
                <Switch
                  size="small"
                  checked={pdfInteractiveMode}
                  checkedChildren={<BorderOuterOutlined></BorderOuterOutlined>}
                  unCheckedChildren={
                    <BorderOuterOutlined></BorderOuterOutlined>
                  }
                  onChange={checked => setPdfInteractiveMode(checked)}
                ></Switch>
              </Tooltip>
              <div
                style={{
                  display:
                    pdfInteractiveMode && isSelectedBlockTable
                      ? 'block'
                      : 'none',
                }}
              >
                <Button size="small" onClick={saveBoxChanges}>
                  Save
                </Button>
                <Button
                  size="small"
                  onClick={resetBoxChanges}
                  disabled={!changedBBox}
                >
                  Reset
                </Button>
              </div>
            </Space>
          </div>
        )}

        <Row gutter={[10, 10]} wrap={false}>
          <Col flex="auto" style={{ position: 'relative' }}>
            {implicitOutline && (
              <div
                style={{
                  position: 'absolute',
                  top: 34,
                  left: 5,
                  opacity: 0.9,
                  zIndex: 2,
                }}
              >
                {showFileOutline && (
                  <Card bodyStyle={{ padding: 5, width: 200 }}>
                    <FileOutline
                      documentData={getDocumentData()}
                      {...(isEdgar
                        ? { outlineHeight: 'calc(100vh - 230px)' }
                        : {})}
                    />
                  </Card>
                )}
              </div>
            )}
            {!!Object.keys(getDocumentData()?.referenceDefinitions || {})
              ?.length && (
              <div
                style={{
                  position: 'absolute',
                  top: 32,
                  right: 26,
                }}
              >
                <Tooltip title={'Toggle reference definitions'}>
                  <Switch
                    size="small"
                    defaultChecked
                    checked={showReferenceDefinitions}
                    onChange={checked => {
                      localStorage.setItem(
                        'reference-definitions-visible',
                        checked
                      );
                      setShowReferenceDefinitions(
                        showReferenceDefinitions => !showReferenceDefinitions
                      );
                      checked
                        ? nlmExtensionsRef.current.showReferenceDefinitions(
                            'nlm-reference-definitions'
                          )
                        : nlmExtensionsRef.current.hideReferenceDefinitions(
                            'nlm-reference-definitions'
                          );
                    }}
                  />
                </Tooltip>
                {!revealedReferenceDefinitions && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      zIndex: 3,
                      backgroundColor: BRAND_COLOR,
                      padding: 20,
                      textAlign: 'center',
                    }}
                  >
                    <Space direction="vertical">
                      <Typography.Text style={{ color: '#FFF' }}>
                        Link important terms to their definitions!
                      </Typography.Text>
                      <Button
                        size="small"
                        onClick={() => {
                          nlmExtensionsRef.current.showReferenceDefinitions(
                            'nlm-reference-definitions'
                          );
                          localStorage.setItem(
                            'nlm-revealed-reference-definitions',
                            true
                          );
                          localStorage.setItem(
                            'reference-definitions-visible',
                            true
                          );
                          setRevealedReferenceDefinitions(true);
                          setShowReferenceDefinitions(true);
                        }}
                      >
                        Link Definitions
                      </Button>
                    </Space>
                  </div>
                )}
              </div>
            )}
            {entityLabelConfig && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 1,
                  right: 26,
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
                  icon={
                    showAnnotations ? <MinusOutlined /> : <HighlightOutlined />
                  }
                  onClick={() => {
                    localStorage.setItem(
                      'annotations-visible',
                      !showAnnotations
                    );
                    setShowAnnotations(showAnnotations => !showAnnotations);
                  }}
                ></Button>
                <div style={{ display: showAnnotations ? 'block' : 'none' }}>
                  <Annotations
                    workspaceId={workspaceId}
                    entityLabelConfig={entityLabelConfig}
                    toggleHilightColor={({ color, checked }) =>
                      nlmExtensionsRef.current.toggleHilightColor({
                        color,
                        checked,
                      })
                    }
                    hilightAllPhrases={() => {
                      nlmExtensionsRef.current.hilightAllPhrases(
                        getHilightAllPhrasesCssRule(entityLabelConfig)
                      );
                      localStorage.setItem('hilight-annotations', true);
                    }}
                    unHilightAllPhrases={() => {
                      const className = `pdfViewer ${
                        showReferenceDefinitions
                          ? 'nlm-reference-definitions'
                          : ''
                      }`;
                      nlmExtensionsRef.current.unHilightAllPhrases(className);
                      localStorage.setItem('hilight-annotations', false);
                    }}
                  />
                </div>
                {!revealedAnnotations && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 3,
                      backgroundColor: `${BRAND_COLOR}`,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      height: '100%',
                      padding: 20,
                      textAlign: 'center',
                    }}
                  >
                    <Space direction="vertical">
                      <Typography.Text style={{ color: '#FFF' }}>
                        Auto-detect amounts, dates, locations, organizations and
                        more.
                      </Typography.Text>
                      <Button
                        onClick={() => {
                          nlmExtensionsRef.current.hilightAllPhrases(
                            getDefaultHilightPhrasesCssRule(entityLabelConfig)
                          );
                          localStorage.setItem(
                            'nlm-revealed-annotations',
                            true
                          );
                          localStorage.setItem('hilight-annotations', true);
                          setRevealedAnnotations(true);
                        }}
                      >
                        Unlock Insights
                      </Button>
                    </Space>
                  </div>
                )}
              </div>
            )}
            <div
              ref={viewerRef}
              id="nlm-viewer"
              style={{
                position: 'static',
                width: '100%',
                height: documentHeight,
              }}
            >
              <ReferenceDefinition
                open={showReferenceDefinition}
                term={term}
                referenceDefinition={referenceDefinition}
                position="absolute"
                top={termPagePosition.pageY + 15}
                referenceDefinitions={
                  getDocumentData()?.referenceDefinitions || {}
                }
                onClose={() => setShowReferenceDefinition(false)}
                isOutlineVisible={showFileOutline}
              />
            </div>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}
