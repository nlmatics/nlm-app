import { CloseOutlined, ExclamationCircleTwoTone } from '@ant-design/icons';
import {
  Button,
  Input,
  message,
  Result,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import { Fragment, useContext, useEffect, useState } from 'react';
import API from '../../../../utils/API.js';
import {
  approveFieldValue,
  getFieldDefinition,
  removeAudit,
  unapproveFieldValue,
} from '../../../../utils/apiCalls.js';
import { fieldEditSources } from '../../../../utils/constants.js';
import { getAnswerTypesFromCriteria } from '../../../../utils/helpers.js';
import SearchResult from '../../../SearchResult.js';
import { WorkspaceContext } from '../../../WorkspaceContext.js';
import { fetchFieldBundleExtractionDataForDoc } from '../../fetcher.js';
const { Text } = Typography;
const { Option } = Select;

// TODO: reduce functional complexity
export default function DetailSider({
  // nosonar
  editedField,
  refreshGrid,
  setDetailVisible,
  resultHandler,
  docId,
  sourceComponent,
  workspaceId,
  siderHeight,
  fieldBundleId,
}) {
  if (!editedField.topic_facts) {
    editedField.topic_facts = [];
  }
  const emptyResult = () => {
    return {
      answer: '',
      phrase: '',
      answer_score: 0.0,
      file_idx: docId,
      filename: workspaceContext.currentDocument.name,
      formatted_answer: '',
      level: 'sent',
      match_idx: -1,
      page_idx: -1,
      match_score: 0.0,
      question_score: 0.0,
      scaled_score: 0.0,
    };
  };
  const [editedFieldResults, setEditedFieldResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spinTip, setSpinTip] = useState('Saving...');
  const workspaceContext = useContext(WorkspaceContext);
  const [pickedResult, setPickedResult] = useState();
  const [fieldAnswer, setFieldAnswer] = useState('');
  const [fieldEditData, setFieldEditData] = useState(null);
  const [searchHeight, setSearchHeight] = useState(null);
  const [selectedSearchCriteria, setSelectedSearchCriteria] = useState(null);
  const [answerTypes, setAnswerTypes] = useState([]);

  useEffect(() => {
    setSearchHeight(
      workspaceContext.fieldEditMode
        ? 'calc(100vh - 290px)'
        : `calc(100vh - ${siderHeight}px)`
    );
  }, [workspaceContext.fieldEditMode]);

  useEffect(() => {
    let searchCriteria = fieldEditData ? fieldEditData.searchCriteria : null;
    if (searchCriteria) {
      setSelectedSearchCriteria(searchCriteria);
      let criteriaAnswerTypes = getAnswerTypesFromCriteria(
        searchCriteria.criterias,
        'expectedAnswerType'
      );
      setAnswerTypes(criteriaAnswerTypes);
      console.log('getting answer type', searchCriteria, criteriaAnswerTypes);
    }
  }, [fieldEditData]);

  useEffect(() => {
    const fieldValueEditData = workspaceContext.fieldValueEditData;
    if (fieldEditData) {
      if (
        fieldValueEditData &&
        fieldValueEditData.fieldValue &&
        fieldValueEditData.source !== getSourceKey()
      ) {
        if (
          getDocId() === fieldValueEditData.fileId &&
          fieldEditData.id === fieldValueEditData.fieldId
        ) {
          if (
            editedFieldResults.length > 0 &&
            editedFieldResults[0].is_override
          ) {
            editedFieldResults.splice(0, 1, fieldValueEditData.fieldData);
          } else {
            editedFieldResults.unshift(fieldValueEditData.fieldData);
          }
          setEditedFieldResults(editedFieldResults.slice());
        }
      }
    }
  }, [workspaceContext.fieldValueEditData]);

  const loadFieldSearchResults = async () => {
    setSpinTip('Loading...');
    let newResults = [];
    setLoading(true);
    const fieldBundleExtractionDataforDoc =
      await fetchFieldBundleExtractionDataForDoc({
        fieldBundleId: fieldBundleId,
        documentId: docId,
      });
    setLoading(false);

    for (let extractionData of fieldBundleExtractionDataforDoc) {
      if (extractionData.topicId === editedField.fieldId) {
        editedField.topic_facts = extractionData.topic_facts;
        setEditedFieldResults(editedField.topic_facts);
        newResults = editedField.topic_facts;
      }
    }
    return newResults;
  };

  useEffect(() => {
    if (editedField.fieldId) {
      getFieldDefinition(editedField.fieldId, setFieldEditData);
    }
    if (!(editedField.topic_facts && editedField.topic_facts.length > 0)) {
      loadFieldSearchResults();
    } else {
      setEditedFieldResults(editedField.topic_facts);
    }
  }, [editedField]);

  const undoPick = () => {
    if (pickedResult) {
      pickedResult.is_picked = false;
      editedFieldResults.shift();
      setPickedResult(null);
    }
  };

  const pickResult = selectedResult => {
    undoPick();
    selectedResult.is_picked = true;
    setPickedResult(selectedResult);
    //add picked item to top of stack
    editedFieldResults.unshift(selectedResult);
  };

  const overrideAnswer = answer => {
    pickedResult.answer = answer;
    pickedResult.formatted_answer = answer;
    setFieldAnswer(answer);
  };

  const getDocId = () => {
    return docId;
  };

  const getSourceKey = () => {
    return fieldEditSources.DETAIL_SIDER + '.' + sourceComponent;
  };
  const saveNewAnswer = async () => {
    setSpinTip('Saving...');
    setLoading(true);
    // save picked result
    let savedResult = null;
    for (let fieldResult of editedFieldResults) {
      fieldResult.is_picked = false;
      fieldResult.is_override = false;
      fieldResult['type'] = null;
    }
    const topResult = editedFieldResults[0];
    let fieldValue = null;
    if (topResult === pickedResult) {
      if (editedFieldResults.length > 1) {
        const nextResult = editedFieldResults[1];
        //unapprove field value if it was approved
        if (nextResult['type'] === 'approve') {
          await unapproveFieldValue({
            fieldId: editedField.fieldId,
            docId: getDocId(),
          });
          nextResult['type'] = null;
        }
      }
      savedResult = pickedResult;
      pickedResult.is_picked = true;
      pickedResult.is_override = true;
      pickedResult['type'] = 'override';
      fieldValue = {
        docId: getDocId(),
        fieldId: editedField.fieldId,
        workspaceId,
        fieldBundleId: fieldBundleId,
        selectedRow: savedResult,
      };
      try {
        await API.post(`/fieldValue`, fieldValue, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        message.info('Answer Selection Saved');
      } catch (error) {
        console.error(error);
        message.error({
          icon: (
            <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
          ),
          content: error.message,
          duration: 3,
        });
      } finally {
        setLoading(false);
      }
    } else {
      fieldValue = {
        docId: getDocId(),
        fieldId: editedField.fieldId,
        workspaceId,
        selectedRow: savedResult,
      };
      await approveFieldValue(fieldValue);
      savedResult = editedFieldResults[0];
      savedResult['type'] = 'approve';
    }
    workspaceContext.setFieldValueEditData({
      fieldId: editedField.fieldId,
      fileId: getDocId(),
      fieldValue: fieldValue,
      source: getSourceKey(),
      topicFacts: editedFieldResults,
      fieldData: savedResult,
    });
    if (refreshGrid) {
      refreshGrid();
    }
    setLoading(false);
  };

  const removeAnswer = async () => {
    try {
      setSpinTip('Saving...');
      setLoading(true);
      let topResult = null;
      let newResults = editedFieldResults;
      if (
        editedFieldResults.length > 0 &&
        editedFieldResults[0]['type'] === 'approve'
      ) {
        await unapproveFieldValue({
          fieldId: editedField.fieldId,
          docId: getDocId(),
        });
        topResult = editedFieldResults[0];
        editedFieldResults[0]['type'] = null;
      } else {
        await removeAudit(getDocId(), editedField.fieldId, fieldBundleId);
        newResults = await loadFieldSearchResults();
        topResult = newResults.length ? newResults[0] : emptyResult();
        setPickedResult(null);
        message.info('Audit Removed');
      }
      workspaceContext.setFieldValueEditData({
        fieldId: editedField.fieldId,
        fileId: getDocId(),
        fieldValue: topResult,
        source: getSourceKey(),
        topicFacts: newResults,
        fieldData: topResult,
      });

      if (refreshGrid) {
        refreshGrid();
      }
    } catch (error) {
      console.error(error);
      message.error({
        icon: (
          <ExclamationCircleTwoTone twoToneColor="var(--error-color-red)" />
        ),
        content: error.message,
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // shows the appropriate answer input
  const showAnswerInput = () => {
    if (
      fieldEditData &&
      fieldEditData.answerFormat &&
      fieldEditData.answerFormat.indexOf('AnswerPicker') !== -1
    ) {
      return (
        <Select
          style={{ width: '100%' }}
          defaultValue={fieldAnswer}
          mode="multiple"
          value={fieldAnswer}
          onChange={option => {
            overrideAnswer(option);
          }}
        >
          {fieldEditData && Array.isArray(fieldEditData.answerFormat) ? (
            <Fragment>
              {fieldEditData.answerFormat.map((format, index) => (
                <Option key={index} value={format}>
                  {format}
                </Option>
              ))}
            </Fragment>
          ) : (
            fieldEditData.answerFormat
              .match(/AnswerPicker\(\[(.*)\]\)\]/)[1]
              .split(',')
              .map(format =>
                format.length ? (
                  <Option value={format.trim().slice(1, -1)}>
                    {format.slice(1, -1)}
                  </Option>
                ) : (
                  ''
                )
              )
          )}
        </Select>
      );
    } else {
      return (
        <Input
          style={{ width: '100%' }}
          onChange={e => overrideAnswer(e.target.value)}
          value={fieldAnswer}
          onPressEnter={() => {
            saveNewAnswer();
          }}
          defaultValue={
            editedFieldResults.length
              ? editedFieldResults[0].formatted_answer
              : '(no value)'
          }
        />
      );
    }
  };

  // appropriate title for the Results element
  const resultsTitle =
    editedFieldResults && editedFieldResults.length > 0
      ? editedFieldResults[0].formatted_answer
      : 'No Value';

  const handleClose = () => {
    workspaceContext.setPickedResult(null);
    if (workspaceContext.workspaceEditedFieldId) {
      workspaceContext.setWorkspaceEditedFieldId(null);
    }
    setDetailVisible(false);
  };

  return (
    <div>
      <div className="detail-sider--second-div">
        <div
          style={{
            marginLeft: '10px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Typography.Title level={5}>{editedField.fieldName}</Typography.Title>
          <Text type="secondary">other potential answers to pick from</Text>
        </div>
        <div
          style={{
            marginRight: '12px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <CloseOutlined
            style={{ marginRight: '17pax', fontSize: '18px' }}
            onClick={() => {
              handleClose();
            }}
          />
        </div>
      </div>
      <Spin tip={spinTip} spinning={loading}>
        <div className="detail-sider--spinner-1">
          <div className="detail-sider--spinner-2">
            <>
              <span>{fieldEditData ? fieldEditData.question : '-'}</span>
              <span className="detail-sider--section-heading">
                {' '}
                {fieldEditData ? fieldEditData.sectionHeading : ''}
              </span>
            </>
          </div>
        </div>
        {workspaceContext.fieldEditMode && (
          <div className="detail-sider--field-edit-mode">
            <div
              style={{
                maxHeight: '30vh',
                padding: '10px 10px 10px 10px',
                zIndex: 9,
                position: 'relative',
                overflow: 'auto',
                width: '100%',
              }}
            >
              <div>
                <Fragment>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      alignItems: 'end',
                    }}
                  >
                    <span>Edit Answer:</span>
                    <Space>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          saveNewAnswer();
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          workspaceContext.setPickedResult(null);
                          setDetailVisible(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </Space>
                  </div>
                  <div className="detail-sider--spacer">
                    {showAnswerInput()}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span>Answer Passage:</span>
                  </div>
                  <div>
                    <span className="line-clamp">{pickedResult.phrase}</span>
                  </div>
                </Fragment>
              </div>
            </div>
          </div>
        )}
        <div className="detail-sider--background">
          {fieldEditData && fieldEditData.isEnteredField ? (
            <Result
              icon={undefined}
              title={resultsTitle}
              subTitle="Edit this value in the call"
            ></Result>
          ) : (
            <SearchResult
              fieldName={editedField.fieldName}
              searchResults={editedFieldResults}
              tableHeight={searchHeight}
              resultHandler={resultHandler}
              removeAnswer={removeAnswer}
              saveNewAnswer={saveNewAnswer}
              pickResult={pickResult}
              undoPick={undoPick}
              docId={docId}
              answerTypes={answerTypes}
              // showCriteria={!workspaceContext.fieldEditMode}
              showCriteria={false}
              selectedSearchCriteria={selectedSearchCriteria}
              showCreateFieldButton={false}
              detailEditMode={false}
              detailVisible={true}
              from="fields"
              fieldBundleId={fieldBundleId}
            ></SearchResult>
          )}
        </div>
      </Spin>
    </div>
  );
}
