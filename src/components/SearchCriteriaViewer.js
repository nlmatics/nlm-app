import { useContext } from 'react';
import { Checkbox, Descriptions, List, Alert } from 'antd';
import { getAnswerTypesFromCriteria } from '../utils/helpers.js';
import { WorkspaceContext } from './WorkspaceContext';

export default function SearchCriteriaViewer({
  fieldDefinition,
  useWorkspaceCriteria = false,
}) {
  const workspaceContext = useContext(WorkspaceContext);
  const getAnswerTypeDisplay = () => {
    let criteriaAnswerTypes = getAnswerTypesFromCriteria(
      fieldDefinition?.criterias,
      'expectedAnswerType'
    );
    if (
      useWorkspaceCriteria &&
      workspaceContext.searchResults &&
      workspaceContext.searchResults.fileFacts &&
      workspaceContext.searchResults.fileFacts.length > 0
    ) {
      if (
        workspaceContext.searchResults.fileFacts[0].criterias.length > 0 &&
        workspaceContext.searchResults.fileFacts[0].criterias[0].is_question
      ) {
        criteriaAnswerTypes = getAnswerTypesFromCriteria(
          workspaceContext.searchResults.fileFacts[0].criterias
        );
      }
    }
    if (criteriaAnswerTypes.length > 0) {
      return (
        <Alert
          message={
            <span>
              Expects <b>{criteriaAnswerTypes.join(', ')}</b> as answer
            </span>
          }
        />
      );
    } else {
      return '';
    }
  };
  return (
    <>
      {getAnswerTypeDisplay()}
      <List
        header={<div>Field Criteria</div>}
        dataSource={fieldDefinition?.criterias}
        renderItem={item => (
          <Descriptions
            colon={true}
            style={{ marginTop: '20px' }}
            size={'small'}
            bordered
            column={2}
          >
            <Descriptions.Item label={<span>Question/Keyword</span>} span={2}>
              <span>{item.question}</span>
            </Descriptions.Item>

            <Descriptions.Item
              label={<span>Additional Keywords</span>}
              span={2}
            >
              <span>{item.templates && item.templates.join(', ')}</span>
            </Descriptions.Item>

            <Descriptions.Item label={<span>Heading</span>} span={2}>
              <span>{item.headers && item.headers.join(', ')}</span>
            </Descriptions.Item>

            <Descriptions.Item label={<span>Page Start</span>}>
              <span>{item.pageStart == -1 ? 'N/A' : item.pageStart}</span>
            </Descriptions.Item>

            <Descriptions.Item label={<span>Page End</span>}>
              <span>{item.pageEnd == -1 ? 'N/A' : item.pageEnd}</span>
            </Descriptions.Item>

            <Descriptions.Item
              label={<span>Include # sentences before match</span>}
            >
              <span>{item.beforeContextWindow}</span>
            </Descriptions.Item>

            <Descriptions.Item
              label={<span>Include # sentences after match</span>}
            >
              <span>{item.afterContextWindow}</span>
            </Descriptions.Item>

            <Descriptions.Item label={<span>Search Tables</span>}>
              <span>
                <Checkbox checked={item.tableFlag === 'enable'} disabled />
              </span>
            </Descriptions.Item>

            <Descriptions.Item label={<span>Group Answers</span>}>
              <span>
                <Checkbox checked={item.groupFlag === 'enable'} disabled />
              </span>
            </Descriptions.Item>
          </Descriptions>
        )}
      ></List>

      <Descriptions style={{ paddingTop: '10px' }} bordered size="small">
        <Descriptions.Item label={<span>Result Format</span>}>
          <span>{fieldDefinition?.postProcessors}</span>
        </Descriptions.Item>
      </Descriptions>
    </>
  );
}
