import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Carousel,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Popover,
  Row,
  Select,
  Space,
  Tooltip,
} from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import AppContext from '../contexts/app/AppContext';
import { getEntitySelectionValues } from '../utils/helpers';
import { searchTips } from './Tips';
import { WorkspaceContext } from './WorkspaceContext';
const { Option } = Select;

function SearchCriteriaForm({ currentCriterionIndex, layout }) {
  const flex = layout === 'vertical' ? '25px' : '120px';
  const layoutProps = {
    labelCol: { flex },
    wrapperCol: { flex: 'auto' },
    style: { marginBottom: 5 },
  };
  const scopeFieldLayoutProps = {
    labelCol: { flex },
    wrapperCol: { flex: 'auto' },
    style: { marginBottom: 5 },
  };
  const carouselRef = useRef(null);
  const workspaceContext = useContext(WorkspaceContext);
  const { isChattyPdf } = useContext(AppContext);
  // eslint-disable-next-line
  const [availableEntities, setAvailableEntities] = useState(
    Object.entries(getEntitySelectionValues(workspaceContext))
  );
  useEffect(() => {
    carouselRef.current.goTo(currentCriterionIndex);
  }, [currentCriterionIndex]);
  return (
    <Form.List name="multiCriteria">
      {(fields, { add, remove }) => {
        // nosonar
        return (
          <Row gutter={[10, 10]}>
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Carousel ref={carouselRef} dots={false}>
                    {fields.map((field, index) => (
                      <Card
                        key={field.key}
                        size="small"
                        title={
                          isChattyPdf()
                            ? 'Advanced Search'
                            : `Search Criterion ${index + 1}`
                        }
                        bodyStyle={{
                          padding: '10px',
                        }}
                        extra={
                          fields.length > 1 ? (
                            <Button
                              size="small"
                              danger
                              type="link"
                              onClick={() => remove(field.name)}
                              icon={<DeleteOutlined />}
                            ></Button>
                          ) : null
                        }
                      >
                        <div key={field.key}>
                          <Form.Item
                            {...layoutProps}
                            label={
                              <>
                                <span className="input-description">Query</span>
                                <Popover
                                  style={{ maxWidth: '50px' }}
                                  content={searchTips.question.help}
                                  title={'Query'}
                                  trigger="click"
                                >
                                  <QuestionCircleOutlined />
                                </Popover>
                              </>
                            }
                            name={[index, 'question']}
                          >
                            <Input
                              placeholder={searchTips.question.placeHolderText}
                            ></Input>
                          </Form.Item>

                          <Form.Item
                            {...layoutProps}
                            label={
                              <>
                                <span className="input-description">
                                  Must Have
                                </span>
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
                              placeholder="Specify the keywords or phrases that Search results must contain"
                              tagRender={({ label, onClose }) => {
                                if (label)
                                  return (
                                    <Tooltip
                                      title={label}
                                      onClick={() => {
                                        navigator.clipboard.writeText(label);
                                        message.success(
                                          'Pattern successfully copied!'
                                        );
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
                                              label ===
                                              workspaceContext.selectedText
                                            ) {
                                              workspaceContext.setSelectedText(
                                                ''
                                              );
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
                            {...layoutProps}
                            label={
                              <>
                                <span className="input-description">
                                  Headings
                                </span>
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
                                              label ===
                                              workspaceContext.selectedText
                                            ) {
                                              workspaceContext.setSelectedText(
                                                ''
                                              );
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
                            {...layoutProps}
                            label={
                              <>
                                <span className="input-description">
                                  Look for
                                </span>
                                <Popover
                                  content={searchTips.entities.help}
                                  title="Look for"
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
                              placeholder="Specify date or period, money, organization and more"
                            >
                              {availableEntities.map(entry => (
                                <Option key={entry[1]}>{entry[0]}</Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...layoutProps}
                            className="nlm-search-criterion-scope"
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
                          >
                            <Row>
                              <Col span={12}>
                                <Form.Item
                                  label="From Page"
                                  name={[index, 'pageStart']}
                                  {...scopeFieldLayoutProps}
                                  labelCol={{ flex }}
                                >
                                  <InputNumber
                                    width={60}
                                    min={1}
                                    max={1000}
                                    precision={0}
                                    defaultValue={null}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item
                                  label="To Page"
                                  name={[index, 'pageEnd']}
                                  {...scopeFieldLayoutProps}
                                  labelCol={{ flex }}
                                >
                                  <InputNumber
                                    width={60}
                                    min={1}
                                    max={1000}
                                    precision={0}
                                    defaultValue={null}
                                  />
                                </Form.Item>
                              </Col>
                              {!isChattyPdf() && (
                                <>
                                  <Col span={12}>
                                    <Form.Item
                                      label={
                                        <>
                                          <span className="input-description">
                                            Before Match
                                          </span>
                                          <Popover
                                            content="# of sentences to include before match"
                                            title="Before Match"
                                            trigger="click"
                                          >
                                            <QuestionCircleOutlined />
                                          </Popover>
                                        </>
                                      }
                                      name={[index, 'beforeContextWindow']}
                                      {...scopeFieldLayoutProps}
                                      labelCol={{ flex }}
                                    >
                                      <InputNumber
                                        width={60}
                                        min={0}
                                        max={20}
                                        precision={0}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item
                                      label={
                                        <>
                                          <span className="input-description">
                                            After Match
                                          </span>
                                          <Popover
                                            content="# of sentences to include after match"
                                            title="After Match"
                                            trigger="click"
                                          >
                                            <QuestionCircleOutlined />
                                          </Popover>
                                        </>
                                      }
                                      name={[index, 'afterContextWindow']}
                                      {...scopeFieldLayoutProps}
                                      labelCol={{ flex }}
                                    >
                                      <InputNumber
                                        width={60}
                                        min={0}
                                        max={20}
                                        precision={0}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item
                                      label={
                                        <>
                                          <span className="input-description">
                                            Search Tables
                                          </span>
                                          <Popover
                                            content={searchTips.tables.help}
                                            title="Include Tables"
                                            trigger="click"
                                          >
                                            <QuestionCircleOutlined />
                                          </Popover>
                                        </>
                                      }
                                      {...scopeFieldLayoutProps}
                                      name={[index, 'enableTableSearch']}
                                      valuePropName="checked"
                                    >
                                      <Checkbox defaultChecked />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item
                                      label={
                                        <>
                                          <span className="input-description">
                                            Group Answers
                                          </span>
                                          <Popover
                                            content={searchTips.group.help}
                                            title="Group Answers"
                                            trigger="click"
                                          >
                                            <QuestionCircleOutlined />
                                          </Popover>
                                        </>
                                      }
                                      name={[index, 'enableGrouping']}
                                      valuePropName="checked"
                                      {...scopeFieldLayoutProps}
                                    >
                                      <Checkbox defaultChecked />
                                    </Form.Item>
                                  </Col>
                                </>
                              )}
                            </Row>
                          </Form.Item>
                        </div>
                      </Card>
                    ))}
                  </Carousel>
                </Col>
              </Row>
            </Col>
            {!isChattyPdf() && (
              <Col span={24}>
                <Row justify="center">
                  <Col>
                    <Space>
                      <Button
                        disabled={fields.length === 1}
                        onClick={() => carouselRef.current.prev()}
                        icon={<ArrowLeftOutlined />}
                      />

                      <Button
                        onClick={() => {
                          add();
                          carouselRef.current.goTo(fields.length);
                        }}
                      >
                        <PlusOutlined /> Add Criterion
                      </Button>
                      <Button
                        disabled={fields.length === 1}
                        onClick={() => carouselRef.current.next()}
                        icon={<ArrowRightOutlined />}
                      />
                    </Space>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
        );
      }}
    </Form.List>
  );
}

export default SearchCriteriaForm;
