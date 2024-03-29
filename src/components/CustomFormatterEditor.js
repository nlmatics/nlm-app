import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

var tmpFormatterOptions = [];

export default function CustomFormatterEditor(props) {
  const [formatterEditorVisible, setFormatterEditor] = useState(false);
  const [customFormatterOptions, setCustomFormatterOptions] = useState(
    props.customFormatterOptions
  );
  function handleCancel() {
    // Here, we invoke the callback with the new value
    props.onClose();
  }

  useEffect(() => {
    setFormatterEditor(props.visible);
  }, [props.visible]);

  const customFormatList = () => {
    const onChange = (changedValues, allValues) => {
      tmpFormatterOptions = allValues.formatterList;
    };
    return (
      <Form onValuesChange={onChange}>
        <Form.List name="formatterList">
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields.map((field, index) => (
                  <Form.Item
                    // {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    // label={index === 0 ? 'Custom Values' : ''}
                    required={false}
                    key={field.key}
                  >
                    <Form.Item
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      // rules={[
                      //   {
                      //     required: true,
                      //     whitespace: true,
                      //     message: "Please input passenger's name or delete this field.",
                      //   },
                      // ]}
                      noStyle
                    >
                      <Input
                        placeholder="Custom Formatter Value"
                        style={{ width: '40%' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name={['age', index]}
                      validateTrigger={['onChange', 'onBlur']}
                      // rules={[
                      //   {
                      //     required: true,
                      //     whitespace: true,
                      //     message: "Please input passenger's age or delete this field.",
                      //   },
                      // ]}
                      noStyle
                    ></Form.Item>

                    {fields.length > 0 ? (
                      <MinusCircleOutlined
                        style={{ textIndent: '50%', opacity: '0.3' }}
                        className="dynamic-delete-button"
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    ) : null}
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                    }}
                    style={{ textAlign: 'left', marginBottom: '-25px' }}
                  >
                    <PlusOutlined /> Create new Custom Format Value
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Button
                    type="link"
                    onClick={() => {
                      fields.map(() => {
                        remove(0);
                      });
                    }}
                    style={{ marginTop: '-50em', textAlign: 'left' }}
                  >
                    <u>Clear all custom values</u>
                  </Button>
                </Form.Item>
              </div>
            );
          }}
        </Form.List>
        <Form.Item></Form.Item>
      </Form>
    );
  };
  const handleSave = () => {
    let newCustomFormatterValues = tmpFormatterOptions.filter(function (
      element
    ) {
      return element !== undefined;
    });
    setCustomFormatterOptions(newCustomFormatterValues);
    props.onChange(newCustomFormatterValues);
  };

  return (
    <Modal
      open={formatterEditorVisible}
      zIndex={9999}
      value={customFormatterOptions}
      onCancel={handleCancel}
      footer={[
        <Button key="Cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="Save"
          type="primary"
          onClick={handleSave}
          htmlType="submit"
        >
          Save
        </Button>,
      ]}
    >
      <h1>
        <b>Edit Custom Format Values</b>
      </h1>
      <Form onFinish={handleSave}>{customFormatList}</Form>
    </Modal>
  );
}
