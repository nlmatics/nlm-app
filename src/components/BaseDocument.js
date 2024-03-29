import { makeStyles } from '@material-ui/styles';
import { Button, Layout, message, Result, Spin } from 'antd';
import {
  Fragment,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactJson from 'react-json-view';
import XMLViewer from 'react-xml-viewer';
import { useEntityLabelConfig } from '../hooks/useEntityLabelConfig';
import { displayFormats } from '../utils/constants';
import { highlightInPhrase, isPubmedFile } from '../utils/helpers';
import PubmedAbstractRenderer from './document/renderers/PubmedAbstractRenderer';
const HTMLDocRenderer = lazy(() => import('./HTMLDocRenderer.js'));
const PdfViewer = lazy(() => import('./PdfViewer'));
import { WorkspaceContext } from './WorkspaceContext.js';
import useDocumentKeyInfo from '../edgar/hooks/useDocumentKeyInfo';

const { Content } = Layout;

const HandleUnprocessedDoc = ({ isProcessed, children }) =>
  isProcessed ? (
    children
  ) : (
    <Result status="warning" title="The document is being processed." />
  );
// TODO: lower the functional complexity by refactoring
export default function BaseDocument({
  displayFormat,
  currentDocument,
  fileData,
  documentId,
  workspaceId,
  documentHeight,
}) {
  const { getDocumentData } = useDocumentKeyInfo(documentId);
  const useStyles = makeStyles({
    root: {
      display: 'flex',
    },

    sidebar: {
      left: 0,
    },
    titleWrapper: {
      display: 'flex',
      height: '60px',
      alignItems: 'center',
    },
    triggerButton: {},
    fileIcon: {
      fontSize: '18px',
      paddingLeft: '10px',
    },
    title: {
      fontSize: '25px',
      marginLeft: '5px',
      marginBottom: '3px',
    },
    baseDocument: () => ({
      fontSize: '18px',
      lineHeight: '24px',
      height: documentHeight,
      padding: 0,
      overflow: 'hidden',
    }),
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 20px',
      height: '40px',
    },
    headerElements: { width: '100%' },
    breadcrumbBar: {
      marginTop: '5px',
      width: '100%',
      paddingLeft: '7px',
      fontSize: '12px',
      display: 'flex',
      justifyContent: 'space-between',
    },
    documentContent: () => ({
      margin: '0 0px',
      height: documentHeight,
    }),
    contendHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '94%',
      height: '0px',
      margin: '0 auto',
    },
    docTitle: {
      marginBottom: '0px',
      fontSize: '34px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    activeScope: {
      textDecoration: 'underline',
      fontWeight: 'bold',
      '& span': {
        textDecoration: 'underline',
      },
    },
    inactiveScope: {
      textDecoration: 'none',
    },
  });
  // nosonar
  const workspaceContext = useContext(WorkspaceContext);
  const baseDocNode = useRef();

  const [openCollapse] = useState(false);

  const classes = useStyles({ openCollapse });
  const { entityLabelConfig } = useEntityLabelConfig(workspaceId);

  useEffect(() => {
    workspaceContext.setScrollIntoView(scrollIntoView);
  }, [workspaceContext.fileBrowserSelectedKeys]);

  // TODO: Reduce functional complexity
  const scrollIntoView = (prevFact, fact, key_field = 'match_idx') => {
    // nosonar
    if (baseDocNode.current) {
      if (prevFact && !prevFact.table) {
        const prev_match_idx = prevFact[key_field];
        let prevElmId = `[sent_idx="${prev_match_idx}"]`; //`.nlm_sent_${prev_match_idx}`;
        if (prevFact.level === 'blocks') {
          prevElmId = `[block_idx="${prev_match_idx}"]`; //`.nlm_block_${prev_match_idx}`;
        }
        let prevElm = baseDocNode.current.querySelector(prevElmId);
        if (prevElm) {
          prevElm.classList.remove('match-hilite');
          if (prevElm.nodeName != 'TR') {
            prevElm.innerHTML = ' ' + prevFact.phrase;
          }
        }
      }
      if (fact) {
        const match_idx = fact[key_field];
        let elmId = `[sent_idx="${match_idx}"]`; //`.nlm_sent_${match_idx}`;
        if (fact.level === 'blocks') {
          elmId = `[block_idx="${match_idx}"]`; //`.nlm_block_${match_idx}`;
        }
        if (fact.table_bbox?.length) {
          elmId = `[name="${fact.phrase}"]`;
        }
        let elm = baseDocNode.current.querySelector(elmId);
        if (elm === null) {
          console.warn('elm is null');
        } else {
          elm.classList.add('match-hilite');
          if (
            fact.answer &&
            fact.answer !== '' &&
            !fact.table &&
            elm.nodeName != 'TR'
          ) {
            elm.innerHTML = highlightInPhrase(
              fact.answer,
              fact.phrase,
              'answer-highlight'
            );
          }
          const keywords = fact.match_text_terms;
          if (keywords?.length) {
            // Only hilighting one keyword as of now
            elm.innerHTML = highlightInPhrase(
              keywords[0],
              fact.phrase,
              'nlm-html-hilight-keyword'
            );
          }
          elm?.focus({ focusVisible: true });
        }
      }
    }
  };

  const copyXMLToClipboard = () => {
    const el = document.createElement('textarea');
    let clipboardBuf = [];
    if (workspaceContext.currentDocument.xml) {
      clipboardBuf.push(workspaceContext.currentDocument.xml);
    }
    el.value = clipboardBuf.join('\n');
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    message.success('XML copied to clipboard');
  };

  return (
    <Layout
      style={{ width: workspaceContext.baseDocumentWidth, overflow: 'hidden' }}
    >
      <Spin
        tip="Loading..."
        spinning={workspaceContext.loadingBasedocument}
        style={{ marginTop: '20%' }}
      >
        <Content className={classes.documentContent}>
          <Fragment>
            <div>
              {displayFormat === displayFormats.PDF && (
                <Suspense fallback={<Spin />}>
                  <PdfViewer
                    workspaceId={workspaceId}
                    entityLabelConfig={entityLabelConfig}
                    documentId={documentId}
                    currentDocument={currentDocument}
                    documentHeight={documentHeight}
                    implicitOutline={true}
                  />
                </Suspense>
              )}
              {displayFormat === displayFormats.HTML && (
                <div id="baseDocument" className={classes.baseDocument}>
                  <HandleUnprocessedDoc isProcessed={!!fileData}>
                    {isPubmedFile(
                      fileData?.document?.blocks &&
                        fileData?.document?.blocks[0]?.sentences &&
                        fileData?.document?.blocks[0]?.sentences[0]
                    ) ? (
                      <PubmedAbstractRenderer
                        srcJSON={fileData}
                        documentId={documentId}
                        documentData={getDocumentData()}
                        entityLabelConfig={entityLabelConfig}
                      />
                    ) : (
                      <Suspense fallback={<Spin />}>
                        <HTMLDocRenderer
                          srcJSON={fileData}
                          documentId={documentId}
                          documentData={getDocumentData()}
                          entityLabelConfig={entityLabelConfig}
                          ref={baseDocNode}
                        />
                      </Suspense>
                    )}
                  </HandleUnprocessedDoc>
                </div>
              )}
              {displayFormat === displayFormats.JSON && (
                <div
                  id="baseDocument"
                  className={classes.baseDocument}
                  style={{ overflow: 'auto' }}
                >
                  <HandleUnprocessedDoc isProcessed={!!fileData}>
                    <ReactJson src={fileData} />
                  </HandleUnprocessedDoc>
                </div>
              )}
              {displayFormat === displayFormats.XML && (
                <div
                  id="baseDocument"
                  className={classes.baseDocument}
                  style={{ overflow: 'auto' }}
                >
                  <HandleUnprocessedDoc isProcessed={!!fileData}>
                    <>
                      <Button onClick={copyXMLToClipboard}>
                        Copy to Clipboard
                      </Button>
                      <XMLViewer
                        style={{ marginTop: '20px' }}
                        invalidXml={''}
                        xml={fileData}
                        collapsible={true}
                      />
                    </>
                  </HandleUnprocessedDoc>
                </div>
              )}
            </div>
          </Fragment>
        </Content>
      </Spin>
    </Layout>
  );
}
