import { useContext, useState } from 'react';
import {
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Form, Space } from 'antd';
import { getEditorByDataType } from './editorHelper';
import { getDataType } from '../../utils/helpers';
import { dataTypes, dataTypesFormatters } from '../../utils/constants';
import ThemeContext from '../../contexts/theme/ThemContext';

export default function MultiValueEditor({ cellData, onEdit }) {
  const { theme } = useContext(ThemeContext);
  const [form] = Form.useForm();
  const [editorVisible, setEditorVisible] = useState(false);
  const dataType = getDataType(cellData.fieldDefinition, cellData.options);
  const onFinish = formData => {
    if (checkEdited(formData.cellValues)) {
      let editedMatches = [];
      for (let value of formData.cellValues) {
        let editorCellValue = value.cellValue;
        let editedMatch = {
          formatted_answer: editorCellValue,
          answer: editorCellValue,
        };
        if (dataType && dataType !== dataTypes.TEXT) {
          if (dataType !== dataTypes.PERIOD) {
            editedMatch = {
              answer_details: {
                raw_value: editorCellValue,
                formatted_answer: editorCellValue,
              },
            };
          } else {
            editedMatch = { answer_details: editorCellValue };
          }
          let formatter = dataTypesFormatters[dataType];
          editedMatch.formatted_answer = formatter(editedMatch);
          editedMatch.answer_details.formatted_answer =
            editedMatch.formatted_answer;
          editedMatch.answer = editedMatch.formatted_answer;
        }
        if (editedMatch.answer && editedMatch.answer !== '') {
          editedMatches.push(editedMatch);
        }
      }
      if (cellData.answerItem) {
        cellData.answerItem.matches = editedMatches;
      } else {
        cellData.answerItem = {
          matches: editedMatches,
        };
      }
      onEdit(editedMatches);
      setEditorVisible(false);
    } else {
      console.log('no change detected');
    }
  };
  const getMultiRawCellValues = () => {
    let cellValues = [];
    if (cellData.answerItem) {
      let matches = cellData.answerItem.matches;
      if (!matches) {
        matches = [cellData.answerItem];
      }

      for (let match of matches) {
        let rawCellValue = undefined;
        if (match.answer_details && match.answer_details.raw_value) {
          if (dataType === dataTypes.PERIOD) {
            rawCellValue = match.answer_details;
          } else {
            rawCellValue = match.answer_details.raw_value;
          }
        } else if (match.formatted_answer) {
          rawCellValue = match.formatted_answer;
        }
        if (rawCellValue && rawCellValue !== '') {
          cellValues.push({ cellValue: rawCellValue });
        }
      }
    }
    return cellValues;
  };
  const originalValues = getMultiRawCellValues();
  form.setFieldsValue({ cellValues: originalValues });
  const checkEdited = values => {
    if (values.length !== originalValues.length) {
      return true;
    }
    for (let i = 0; i < values.length; i++) {
      if (values[i].cellValue !== originalValues[i].cellValue) {
        return true;
      }
    }
    return false;
  };
  const onReset = () => {
    form.setFieldsValue({ cellValues: originalValues });
  };
  const WrappedEditor = ({ value = null, onChange }) => {
    return (
      <>
        {getEditorByDataType({
          dataType: dataType,
          editable: true,
          reset: undefined,
          onEdit: val => {
            onChange(val);
          },
          cellValue: value,
        })}
      </>
    );
  };
  const createEditorList = () => {
    return (
      <div className={`nlm-multivalue-editor ${theme}`}>
        <Form
          name="dynamic_form_nest_item"
          onFinish={onFinish}
          form={form}
          autoComplete="off"
        >
          <div
            style={{
              maxHeight: '40vh',
              overflowX: 'hidden',
              overflowY: 'scroll',
            }}
          >
            <Form.List name="cellValues">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: 'flex' }}
                      align="baseline"
                    >
                      <Form.Item {...restField} name={[name, 'cellValue']}>
                        <WrappedEditor />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add value
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
          <Form.Item>
            <Space direction="horizontal">
              <Button size="small" type="primary" htmlType="submit">
                Apply
              </Button>
              <Button size="small" onClick={() => onReset()}>
                Reset
              </Button>
              <Button size="small" onClick={() => setEditorVisible(false)}>
                Close
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    );
  };
  return (
    <div>
      <Dropdown
        placement="right"
        menu={{
          items: [
            {
              label: createEditorList(),
            },
          ],
        }}
        trigger={['click']}
        onClick={e => e.stopPropagation()}
        open={editorVisible}
        onOpenChange={val => setEditorVisible(val)}
      >
        <a onClick={e => e.preventDefault()}>
          <Space>
            <EditOutlined />
            Audit {originalValues?.length} Values
          </Space>
        </a>
      </Dropdown>
    </div>
  );
}
