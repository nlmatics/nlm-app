import {
  Radio,
  Form,
  Input,
  Button,
  Tooltip,
  Select,
  Alert,
  Row,
  Col,
} from 'antd';
import { useEffect, useState } from 'react';
import useFieldManager from '../../useFieldManager';
import useFieldBundles from '../../useFieldBundles';
import { saveDerivedField } from '../../../../../utils/apiCalls';
import { QueryBuilderAntD } from '@react-querybuilder/antd';
import { QueryBuilder } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { getDataType } from '../../../../../utils/helpers';
import { dataTypes } from '../../../../../utils/constants';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';

import './index.less';

const messages = {
  CAST: 'Allows to cast each value of selected field to any other custom value.',
  FORMULA:
    'Allows to apply logical operators on boolean fields and further cast the boolean outputs to custom values.',
  BOOLEAN_MULTI_CAST: `Allows to group multiple boolean fields into one field.
  Value of the grouped field is a list of all fields whose values are truthy (true).
    The default value for each field is the field name but can be further casted into a custom value.`,
};

export default function DerivedFieldEditor({
  workspaceId,
  parentBundleId,
  fieldEditData,
  onEditComplete,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(
    fieldEditData ? fieldEditData.options?.type : null
  );
  const [castField, setSelectedCastField] = useState(
    fieldEditData ? fieldEditData.options.parent_fields[0] : null
  );
  const [castFields, setCastFields] = useState([]);
  const [booleanCastFields, setBooleanCastFields] = useState(
    fieldEditData?.options?.parent_fields || []
  );
  const [booleanFields, setBooleanFields] = useState([]);
  const [castFieldValues, setCastFieldValues] = useState(
    fieldEditData?.options?.cast_options
      ? Object.keys(fieldEditData.options.cast_options)
      : []
  );

  const { useRefetchFields, useFields } = useFieldManager();
  const refetchFields = useRefetchFields();
  const { data: fields, isLoading: isFetchingFields } =
    useFields(parentBundleId);

  const { useRefetchFieldBundles } = useFieldBundles(workspaceId);
  const refetchFieldBundles = useRefetchFieldBundles();

  const [formulaQuery, setFormulaQuery] = useState(
    fieldEditData?.options?.query
  );

  useEffect(() => {
    if (!isFetchingFields) {
      const dataFields = fields
        .filter(({ isEnteredField }) => !isEnteredField)
        .map(({ id, name, distinctValues }) => ({ id, name, distinctValues }))
        .sort(({ name: a }, { name: b }) => (a > b ? 1 : a < b ? -1 : 0));
      setCastFields(dataFields);

      const booleanFields = fields
        .filter(
          field => getDataType(field, field.options) === dataTypes.BOOLEAN
        )
        .map(({ id, name, distinctValues }) => ({ id, name, distinctValues }))
        .sort(({ name: a }, { name: b }) => (a > b ? 1 : a < b ? -1 : 0));
      setBooleanFields(booleanFields);
    }
  }, [isFetchingFields, fields]);

  const saveFieldDefinition = async formData => {
    let options = {};
    const { name, type, booleanCastFields, ...castOptions } = formData;
    if (type === 'CAST') {
      options = {
        deduct_from_fields: true,
        parent_fields: [formData.castField],
        type: 'CAST',
        cast_options: Object.fromEntries(
          formData.castFieldValues.map(value => [value, formData[value]])
        ),
      };
    } else if (type === 'FORMULA') {
      const { query, formulaOutputCastForTrue, formulaOutputCastForFalse } =
        formData;
      options = {
        query,
        deduct_from_fields: true,
        parent_fields: query.rules.flatMap(rule =>
          rule?.id ? [rule.field.split('_')[1]] : []
        ),
        type: 'FORMULA',
        formula_options: {
          formula_str: query.rules
            .flatMap(rule => (rule?.id ? [rule.field] : [rule]))
            .join(' '),
          formula_field_map: Object.fromEntries(
            query.rules.flatMap(rule =>
              rule?.id ? [[rule.field.split('_')[1], rule.field]] : []
            )
          ),
          formula_output_cast: {
            true: formulaOutputCastForTrue,
            false: formulaOutputCastForFalse,
            __default__: 'NA',
          },
        },
      };
    } else if (type === 'BOOLEAN_MULTI_CAST') {
      options = {
        deduct_from_fields: true,
        parent_fields: booleanCastFields,
        type: 'BOOLEAN_MULTI_CAST',
        selectionType: 'multiple',
        cast_options: castOptions,
      };
    }

    let fieldDefinition = {
      name,
      workspaceId: workspaceId,
      isUserDefined: true,
      isEnteredField: true,
      isDependentField: true,
      parentBundleId: parentBundleId,
      dataType: type === 'BOOLEAN_MULTI_CAST' ? 'list' : 'text',
      options,
      searchCriteria: {},
    };

    const { id } = await saveDerivedField(
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
      await saveFieldDefinition(values);
    } catch (errorInfo) {
      console.error('Failed:', errorInfo);
    } finally {
      setLoading(false);
    }
  };
  const getInitialValues = () => {
    if (fieldEditData) {
      let initialValues = {};
      initialValues.name = fieldEditData.name;
      initialValues.type = fieldEditData.options.type;
      if (fieldEditData.options.type === 'CAST') {
        initialValues.castField = fieldEditData.options.parent_fields[0];
        initialValues.castFieldValues = Object.keys(
          fieldEditData.options.cast_options
        );
        initialValues = {
          ...initialValues,
          ...fieldEditData.options.cast_options,
        };
      }
      if (fieldEditData.options.type === 'FORMULA') {
        initialValues = {
          ...initialValues,
          query: fieldEditData.options.query,
          formulaOutputCastForFalse:
            fieldEditData.options.formula_options.formula_output_cast.false,
          formulaOutputCastForTrue:
            fieldEditData.options.formula_options.formula_output_cast.true,
        };
      }
      if (fieldEditData.options.type === 'BOOLEAN_MULTI_CAST') {
        initialValues.booleanCastFields = fieldEditData.options.parent_fields;
        initialValues = {
          ...initialValues,
          ...fieldEditData.options.cast_options,
        };
      }
      return initialValues;
    } else {
      return {
        formulaOutputCastForTrue: 'Yes',
        formulaOutputCastForFalse: 'No',
      };
    }
  };

  const getBooleanFieldById = booleanCastField =>
    booleanFields.find(({ id }) => id === booleanCastField);

  return (
    <>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        initialValues={getInitialValues()}
        className="derived-field-editor"
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
          label="Type"
          name="type"
          rules={[
            {
              required: true,
              message: 'Please select the type of the field',
            },
          ]}
        >
          <Radio.Group
            disabled={fieldEditData}
            buttonStyle="solid"
            size="small"
            onChange={() => {
              setSelectedType(form.getFieldsValue().type);
            }}
          >
            <Tooltip placement="top" title="A field that casts the answers">
              <Radio.Button value="CAST">Simple Cast</Radio.Button>
            </Tooltip>
            <Tooltip placement="top" title="A formula field">
              <Radio.Button value="FORMULA">Logical Cast</Radio.Button>
            </Tooltip>
            <Tooltip placement="top" title="A boolean multicast field">
              <Radio.Button value="BOOLEAN_MULTI_CAST">
                Selective Cast
              </Radio.Button>
            </Tooltip>
          </Radio.Group>
        </Form.Item>
        <Row style={{ marginBottom: 24 }}>
          <Col span={14} push={4}>
            {messages[selectedType] && (
              <Alert message={messages[selectedType]} type="info" showIcon />
            )}
          </Col>
        </Row>

        {selectedType === 'CAST' && (
          <>
            <Form.Item
              label="Data field to be casted"
              name="castField"
              rules={[
                {
                  required: selectedType === 'CAST',
                  message: 'Please select type of field.',
                },
              ]}
            >
              <Select
                placeholder="Select a field to be casted"
                onChange={castField => {
                  setSelectedCastField(castField);
                  setCastFieldValues([]);
                }}
                options={castFields.map(({ id, name }) => ({
                  label: name,
                  value: id,
                }))}
              />
            </Form.Item>
            {castField && (
              <>
                <Form.Item
                  label="Values to be casted"
                  name="castFieldValues"
                  rules={[
                    {
                      required: !!castField,
                      message: 'Please select Field to be casted.',
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    filterOption
                    allowClear
                    placeholder="Select field values to be casted"
                    onChange={castFieldValues => {
                      setCastFieldValues(castFieldValues);
                    }}
                    options={castFields
                      .find(({ id }) => id === castField)
                      ?.distinctValues.map(value => ({ label: value, value }))}
                  />
                </Form.Item>

                {castFieldValues?.map((castFieldValue, index) => (
                  <Form.Item
                    label={castFieldValue}
                    key={index}
                    name={castFieldValue}
                  >
                    <Input
                      placeholder={`Enter cast value for ${castFieldValue}`}
                    ></Input>
                  </Form.Item>
                ))}
              </>
            )}
          </>
        )}
        {selectedType === 'FORMULA' && (
          <>
            <Form.Item
              label="Define Formula"
              rules={[
                {
                  required: true,
                  message: 'Minimum 2 fields required',
                },
              ]}
              name="query"
            >
              <QueryBuilderAntD>
                <QueryBuilder
                  translations={{
                    addRule: {
                      label: (
                        <>
                          <PlusOutlined /> Field
                        </>
                      ),
                      title: 'Add Field',
                    },
                    removeRule: {
                      label: <CloseOutlined />,
                      title: 'Remove Field',
                    },
                  }}
                  showCombinatorsBetweenRules
                  independentCombinators
                  fields={booleanFields.map(({ id, name }) => ({
                    name: `field_${id}`,
                    label: name,
                  }))}
                  query={formulaQuery}
                  onQueryChange={query => {
                    setFormulaQuery(query);
                    if (query.rules.length > 1) {
                      form.setFieldValue('query', query);
                    } else {
                      form.setFieldValue('query', null);
                    }
                  }}
                  controlElements={{
                    addGroupAction: () => null,
                    removeGroupAction: () => null,
                    operatorSelector: () => null,
                    valueEditor: () => null,
                  }}
                />
              </QueryBuilderAntD>
            </Form.Item>
            <Form.Item
              label="Cast Truthy Output to"
              rules={[
                {
                  required: true,
                  message: 'Specify cast for truthy output',
                },
              ]}
              name="formulaOutputCastForTrue"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Cast Falsy Output to"
              rules={[
                {
                  required: true,
                  message: 'Specify cast for falsy output',
                },
              ]}
              name="formulaOutputCastForFalse"
            >
              <Input />
            </Form.Item>
          </>
        )}
        {selectedType === 'BOOLEAN_MULTI_CAST' && (
          <>
            <Form.Item
              label="Data fields to be grouped"
              name="booleanCastFields"
              rules={[
                {
                  required: selectedType === 'BOOLEAN_MULTI_CAST',
                  message: 'Please select fields.',
                },
              ]}
            >
              <Select
                mode="multiple"
                filterOption={(input, { label }) =>
                  label?.toLowerCase()?.includes(input?.toLowerCase())
                }
                placeholder="Select fields to be grouped"
                options={booleanFields.map(({ id, name }) => ({
                  label: name,
                  value: id,
                }))}
                onChange={booleanCastFields => {
                  setBooleanCastFields(booleanCastFields);
                  booleanCastFields.forEach(booleanCastField => {
                    form.setFieldValue(
                      booleanCastField,
                      getBooleanFieldById(booleanCastField)?.name
                    );
                  });
                }}
              />
            </Form.Item>
            {booleanCastFields?.map((booleanCastField, index) => (
              <Form.Item
                label={getBooleanFieldById(booleanCastField)?.name}
                key={index}
                name={getBooleanFieldById(booleanCastField)?.id}
                rules={[
                  {
                    required: selectedType === 'BOOLEAN_MULTI_CAST',
                    message: 'Please enter cast value.',
                  },
                ]}
              >
                <Input
                  placeholder={`Enter cast value for ${
                    getBooleanFieldById(booleanCastField)?.name
                  }`}
                ></Input>
              </Form.Item>
            ))}
          </>
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
