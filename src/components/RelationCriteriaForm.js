import { useContext, useState } from 'react';
import {
  InputNumber,
  Form,
  Card,
  Button,
  Input,
  Space,
  message,
  Select,
  Tooltip,
  Popover,
} from 'antd';
import { MinusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { WorkspaceContext } from './WorkspaceContext';
import { searchTips } from './Tips';
import { getEntitySelectionValues } from '../utils/helpers';
import { relationtypes } from '../utils/constants';
const { Option } = Select;
function SearchCriteriaForm(props) {
  const workspaceContext = useContext(WorkspaceContext);
  // eslint-disable-next-line
  const [availableEntities, setAvailableEntities] = useState(
    Object.entries(getEntitySelectionValues(workspaceContext))
  );
  return (
    <Form.List name="multiCriteria">
      {(fields, { remove }) => {
        // nosonar
        return (
          <div>
            {fields.map((field, index) => (
              <Card
                key={index}
                size="small"
                bodyStyle={{
                  height: 'calc(100vh - 255px)',
                }}
                extra={
                  fields.length > 1 ? (
                    <Button
                      danger
                      type="link"
                      onClick={() => remove(field.name)}
                      icon={<MinusCircleOutlined />}
                    >
                      Remove Criteria
                    </Button>
                  ) : null
                }
              >
                <div key={field.key}>
                  {props.relationType === relationtypes.TRIPLE && (
                    <>
                      <Form.Item
                        {...props.formItemLayout}
                        label={
                          <>
                            <span style={{ marginRight: '0.25rem' }}>
                              Relation
                            </span>
                            <Popover
                              style={{ maxWidth: '50px' }}
                              content={searchTips.relation.help}
                              title={'Relation'}
                              trigger="click"
                            >
                              <QuestionCircleOutlined />
                            </Popover>
                          </>
                        }
                        name={[index, 'question']}
                      >
                        <Input
                          style={{ width: '100%' }}
                          placeholder={searchTips.relation.placeHolderText}
                        ></Input>
                      </Form.Item>
                      <Form.Item
                        {...props.formItemLayout}
                        label={
                          <>
                            <span style={{ marginRight: '0.25rem' }}>
                              Source Question
                            </span>
                            <Popover
                              style={{ maxWidth: '50px' }}
                              content={searchTips.sourceQuestion.help}
                              title={'Source Question'}
                              trigger="click"
                            >
                              <QuestionCircleOutlined />
                            </Popover>
                          </>
                        }
                        name={[index, 'sourceQuestion']}
                      >
                        <Input
                          style={{ width: '100%' }}
                          placeholder={
                            searchTips.sourceQuestion.placeHolderText
                          }
                        ></Input>
                      </Form.Item>
                      <Form.Item
                        {...props.formItemLayout}
                        label={
                          <>
                            <span style={{ marginRight: '0.25rem' }}>
                              Target Question
                            </span>
                            <Popover
                              style={{ maxWidth: '50px' }}
                              content={searchTips.targetQuestion.help}
                              title={'Target Question'}
                              trigger="click"
                            >
                              <QuestionCircleOutlined />
                            </Popover>
                          </>
                        }
                        name={[index, 'targetQuestion']}
                      >
                        <Input
                          style={{ width: '100%' }}
                          placeholder={
                            searchTips.targetQuestion.placeHolderText
                          }
                        ></Input>
                      </Form.Item>
                    </>
                  )}
                  {props.relationType === relationtypes.MULTI && (
                    <Form.Item
                      {...props.formItemLayout}
                      label={
                        <>
                          <span style={{ marginRight: '0.25rem' }}>
                            Relation
                          </span>
                          <Popover
                            style={{ maxWidth: '50px' }}
                            content={searchTips.relation.help}
                            title={'Relation'}
                            trigger="click"
                          >
                            <QuestionCircleOutlined />
                          </Popover>
                        </>
                      }
                      name={[index, 'question']}
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder={searchTips.relation.placeHolderText}
                      ></Input>
                    </Form.Item>
                  )}
                  {props.relationType === relationtypes.NODE && (
                    <Form.Item
                      {...props.formItemLayout}
                      label={
                        <>
                          <span style={{ marginRight: '0.25rem' }}>
                            Node Question
                          </span>
                          <Popover
                            style={{ maxWidth: '50px' }}
                            content={searchTips.node.help}
                            title={'Node Question'}
                            trigger="click"
                          >
                            <QuestionCircleOutlined />
                          </Popover>
                        </>
                      }
                      name={[index, 'question']}
                    >
                      <Input
                        style={{ width: '100%' }}
                        placeholder={searchTips.node.placeHolderText}
                      ></Input>
                    </Form.Item>
                  )}
                  {props.relationType === relationtypes.MULTI && (
                    <>
                      <Form.Item
                        {...props.formItemLayout}
                        label={
                          <>
                            <span className="input-description">
                              Source Entity
                            </span>
                            <Popover
                              content={searchTips.sourceEntity.help}
                              title="Source Entity"
                              trigger="click"
                            >
                              <QuestionCircleOutlined />
                            </Popover>
                          </>
                        }
                        name={[index, 'sourceEntityType']}
                      >
                        <Select
                          allowClear
                          style={{
                            width: '100%',
                            height: '32px',
                            overflowY: 'auto',
                          }}
                          placeholder={searchTips.sourceEntity.placeHolderText}
                        >
                          {availableEntities.map(entry => (
                            <Option key={entry[1]}>{entry[0]}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...props.formItemLayout}
                        label={
                          <>
                            <span className="input-description">
                              Target Entity
                            </span>
                            <Popover
                              content={searchTips.targetEntity.help}
                              title="Target Entity"
                              trigger="click"
                            >
                              <QuestionCircleOutlined />
                            </Popover>
                          </>
                        }
                        name={[index, 'targetEntityType']}
                      >
                        <Select
                          allowClear
                          style={{
                            width: '100%',
                            height: '32px',
                            overflowY: 'auto',
                          }}
                          placeholder={searchTips.targetEntity.placeHolderText}
                        >
                          {availableEntities.map(entry => (
                            <Option key={entry[1]}>{entry[0]}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </>
                  )}
                  {(props.relationType === relationtypes.NODE ||
                    props.relationType === relationtypes.TRIPLE) && (
                    <Form.Item
                      {...props.formItemLayout}
                      label={
                        <>
                          <span className="input-description">
                            Entity Types
                          </span>
                          <Popover
                            content={searchTips.entities.help}
                            title="Entity Types"
                            trigger="click"
                          >
                            <QuestionCircleOutlined />
                          </Popover>
                        </>
                      }
                      name={[index, 'entityTypes']}
                    >
                      <Select
                        style={{
                          width: '100%',
                          height: '32px',
                          overflowY: 'auto',
                        }}
                        mode="tags"
                        placeholder={searchTips.entities.placeHolderText}
                      >
                        {availableEntities.map(entry => (
                          <Option key={entry[1]}>{entry[0]}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                  <Form.Item
                    {...props.formItemLayout}
                    label={
                      <>
                        <span className="input-description">Must Have</span>
                        <Popover
                          content={searchTips.keywords.help}
                          title="Must Have"
                          trigger="click"
                        >
                          <QuestionCircleOutlined />
                        </Popover>
                      </>
                    }
                    name={[index, 'templates']}
                  >
                    <Select
                      style={{
                        width: '100%',
                        height: '32px',
                        overflowY: 'auto',
                      }}
                      mode="tags"
                      dropdownStyle={{ display: 'none' }}
                      placeholder={searchTips.keywords.placeHolderText}
                      tagRender={({ label, onClose }) => {
                        if (label)
                          return (
                            <Tooltip
                              title={label}
                              onClick={() => {
                                navigator.clipboard.writeText(label);
                                message.success('Pattern successfully copied!');
                              }}
                            >
                              <span className="ant-select-selection-item">
                                <span className="ant-select-selection-item-content">
                                  {label}
                                </span>
                                <span
                                  className="ant-select-selection-item-remove"
                                  onClick={e => {
                                    if (
                                      label === workspaceContext.selectedText
                                    ) {
                                      workspaceContext.setSelectedText('');
                                    }
                                    onClose(e);
                                  }}
                                >
                                  X
                                </span>
                              </span>
                            </Tooltip>
                          );
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    {...props.formItemLayout}
                    label={
                      <>
                        <span className="input-description">Headings</span>
                        <Popover
                          content={searchTips.headings.help}
                          title="Headings"
                          trigger="click"
                        >
                          <QuestionCircleOutlined />
                        </Popover>
                      </>
                    }
                    name={[index, 'headers']}
                  >
                    <Select
                      style={{
                        width: '100%',
                        overflowY: 'auto',
                      }}
                      mode="tags"
                      dropdownStyle={{ display: 'none' }}
                      placeholder={searchTips.headings.placeHolderText}
                      tagRender={({ label, onClose }) => {
                        if (label)
                          return (
                            <Tooltip title={label}>
                              <span className="ant-select-selection-item">
                                <span className="ant-select-selection-item-content">
                                  {label}
                                </span>
                                <span
                                  className="ant-select-selection-item-remove"
                                  onClick={e => {
                                    if (
                                      label === workspaceContext.selectedText
                                    ) {
                                      workspaceContext.setSelectedText('');
                                    }
                                    onClose(e);
                                  }}
                                >
                                  X
                                </span>
                              </span>
                            </Tooltip>
                          );
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    {...props.formItemLayout}
                    label={
                      <>
                        <span className="input-description">Scope</span>
                        <Popover
                          content={searchTips.scope.help}
                          title="Scope"
                          trigger="click"
                        >
                          <QuestionCircleOutlined />
                        </Popover>
                      </>
                    }
                    style={{ marginBottom: '-20px' }}
                  >
                    <Space>
                      <Form.Item label="From Page" name={[index, 'pageStart']}>
                        <InputNumber
                          min={1}
                          max={1000}
                          precision={0}
                          defaultValue={null}
                        />
                      </Form.Item>
                      <Form.Item label="To Page" name={[index, 'pageEnd']}>
                        <InputNumber
                          min={1}
                          max={1000}
                          precision={0}
                          defaultValue={null}
                        />
                      </Form.Item>
                    </Space>
                  </Form.Item>
                </div>
              </Card>
            ))}
            {/* <Form.Item style={{marginTop: '10px'}}>
              <Button
                onClick={() => add()}
              >
                <PlusOutlined /> Add Criteria
              </Button>
            </Form.Item> */}
          </div>
        );
      }}
    </Form.List>
  );
}

export default SearchCriteriaForm;
