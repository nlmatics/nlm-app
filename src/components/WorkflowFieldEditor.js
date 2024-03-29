import { Radio, Form, Input, Button, Tooltip, Select } from 'antd';
import { useState } from 'react';
import { saveWorkflowField } from '../utils/apiCalls';
import useFieldBundles from './workspace/fields/useFieldBundles';
import useFieldManager from './workspace/fields/useFieldManager';

export default function WorkflowFieldEditor({
  workspaceId,
  parentBundleId,
  fieldEditData,
  onEditComplete,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState(
    fieldEditData ? fieldEditData.dataType : null
  );

  const { useRefetchFields } = useFieldManager();
  const refetchFields = useRefetchFields();

  const { useRefetchFieldBundles } = useFieldBundles(workspaceId);
  const refetchFieldBundles = useRefetchFieldBundles();

  const saveFieldDefinition = async formData => {
    let options = {};
    if (formData.dataType === 'number') {
      options = { numberType: formData.numberType };
    } else if (formData.dataType === 'list') {
      options = {
        values: formData.listOptions,
        selectionType: formData.selectionType,
      };
    }
    let fieldDefinition;
    if (fieldEditData) {
      fieldDefinition = {
        name: formData.name,
      };
    } else {
      fieldDefinition = {
        name: formData.name,
        workspaceId: workspaceId,
        isUserDefined: true,
        isEnteredField: true,
        parentBundleId: parentBundleId,
        dataType: formData.dataType,
        options: options,
        searchCriteria: {},
      };
    }
    const { id } = await saveWorkflowField(
      fieldEditData ? fieldEditData.id : null,
      fieldDefinition
    );
    fieldDefinition.fieldId = id;
    refetchFieldBundles(workspaceId);
    refetchFields(parentBundleId);
    onEditComplete(fieldDefinition);
  };
  const onCheck = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      console.log('Success:', values);
      await saveFieldDefinition(values);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    } finally {
      setLoading(false);
    }
  };
  const getInitialValues = () => {
    if (fieldEditData) {
      let initialValues = {};
      initialValues.name = fieldEditData.name;
      initialValues.dataType = fieldEditData.dataType;
      if (fieldEditData.dataType === 'list') {
        initialValues.listOptions = fieldEditData?.options?.values;
        initialValues.selectionType = fieldEditData?.options?.selectionType;
      }
      if (
        fieldEditData.dataType === 'number' &&
        fieldEditData.options &&
        fieldEditData.options.numberType
      ) {
        initialValues.numberType = fieldEditData.options.numberType;
      }
      return initialValues;
    } else {
      return {};
    }
  };
  return (
    <>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        initialValues={getInitialValues()}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: 'Please input a name for the field',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Data Type"
          name="dataType"
          rules={[
            {
              required: true,
              message: 'Please select the data type of the field',
            },
          ]}
        >
          <Radio.Group
            disabled={fieldEditData}
            buttonStyle="solid"
            size="small"
            onChange={() => {
              console.log('form value', form.getFieldsValue());
              setSelectedDataType(form.getFieldsValue().dataType);
            }}
          >
            <Tooltip
              placement="top"
              title="A field consisting of a line of text"
            >
              <Radio.Button value="text">Text</Radio.Button>
            </Tooltip>
            <Tooltip
              placement="top"
              title="A field consisting of multiple lines of free flowing text e.g. Comment"
            >
              <Radio.Button value="longText">Long Text</Radio.Button>
            </Tooltip>
            <Tooltip
              placement="top"
              title="A numeric field with different formatting options"
            >
              <Radio.Button value="number">Number</Radio.Button>
            </Tooltip>
            <Tooltip placement="top" title="A date field">
              <Radio.Button value="date">Date</Radio.Button>
            </Tooltip>
            <Tooltip
              placement="right"
              title="A field that can have one or more values selected from a preset list of options."
            >
              <Radio.Button value="list">List</Radio.Button>
            </Tooltip>
          </Radio.Group>
        </Form.Item>
        {selectedDataType === 'list' && (
          <>
            <Form.Item
              label="List Options"
              name="listOptions"
              rules={[
                {
                  required: selectedDataType === 'list',
                  message: 'Please input a few options for the list field',
                },
              ]}
            >
              <Select
                disabled={fieldEditData}
                style={{
                  overflowY: 'auto',
                }}
                mode="tags"
                dropdownStyle={{ display: 'none' }}
                placeholder="Type in an option, press enter to add new option"
                onChange={() => {
                  console.log('form value', form.getFieldsValue());
                  // setCustomFormatterOptions(form.getFieldsValue().customFormValue)
                }}
              />
            </Form.Item>
            <Form.Item
              label="Selection Type"
              name="selectionType"
              rules={[
                {
                  required: selectedDataType === 'list',
                  message: 'Please input a few options for the list field',
                },
              ]}
            >
              <Radio.Group
                size="small"
                buttonStyle="solid"
                disabled={fieldEditData}
              >
                <Tooltip
                  placement="left"
                  title="Allow selection of a single item from the list of options"
                >
                  <Radio.Button value="single">Single</Radio.Button>
                </Tooltip>
                <Tooltip
                  placement="right"
                  title="Allow selection of multiple items from a list of options"
                >
                  <Radio.Button value="multiple">Multiple</Radio.Button>
                </Tooltip>
              </Radio.Group>
            </Form.Item>
          </>
        )}
        {selectedDataType === 'number' && (
          <Form.Item
            label="Number Type"
            name="numberType"
            rules={[
              {
                required: selectedDataType === 'number',
                message: 'Please select the type for the number field',
              },
            ]}
          >
            <Radio.Group
              disabled={fieldEditData}
              size="small"
              buttonStyle="solid"
              onChange={() => {
                console.log('form value', form.getFieldsValue());
                setSelectedDataType(form.getFieldsValue().dataType);
              }}
            >
              <Tooltip placement="top" title="e.g. 20, 30">
                <Radio.Button value="integer">Integer</Radio.Button>
              </Tooltip>
              <Tooltip placement="top" title="e.g. 20.23, 20.30">
                <Radio.Button value="decimal">Decimal Number</Radio.Button>
              </Tooltip>
              <Tooltip
                placement="top"
                title="a decimal number with currency e.g. USD 20"
              >
                <Radio.Button value="money">Money</Radio.Button>
              </Tooltip>
              <Tooltip placement="right" title="a percentage number e.g. 92.3%">
                <Radio.Button value="percentage">Percentage</Radio.Button>
              </Tooltip>
            </Radio.Group>
          </Form.Item>
        )}
        <Form.Item wrapperCol={{ span: 14, offset: 4 }}>
          <Button type="primary" onClick={onCheck} loading={loading}>
            {fieldEditData ? 'Update' : 'Create'}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
