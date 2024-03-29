import { SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Input,
  Layout,
  Row,
  Select,
  Typography,
} from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  getFieldsInfo,
  saveNewFieldInfo,
  updateFieldInfo,
} from '../utils/apiCalls';
import {
  clearWorkspaceSearchCriteria,
  clearWorkspaceSearchResults,
} from '../utils/helpers';
import { useAuth } from '../utils/use-auth';
import SearchCriteriaViewer from './SearchCriteriaViewer.js';
import { fetchFieldBundles } from './workspace/fetcher';
import FieldBundleSelector from './workspace/FieldBundleSelector';
import { WorkspaceContext } from './WorkspaceContext';

const { Text } = Typography;
const { Option } = Select;
const existingFields = new Set();

const SearchSaver = ({ workspaceId, from }) => {
  const history = useHistory();
  const location = useLocation();
  const fieldBundleId = location?.state?.fieldBundleId;
  const fieldIdToBeUpdated = location?.state?.fieldId;
  const [fieldLoading, setFieldLoading] = useState(false);
  const [isSavingField, setIsSavingField] = useState(false);
  const [selectDisable, setSelectDisable] = useState(true);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [isDuplicateField, setIsDuplicateField] = useState(false);
  const [fieldId, setFieldId] = useState(''); // the Field name dropdown
  const [updateField, setUpdateField] = useState(); // the Field name
  //eslint-disable-next-line
  const [updateFieldSelceted, setUpdateFieldSelected] = useState();
  const [createFieldValue, setCreateFieldValue] = useState('');
  //eslint-disable-next-line
  const [disableSave, setDisableSave] = useState(true); // nosonar
  const [parentBundleId, setParentBundleId] = useState(null); // the Field Set
  const [blank, setBlank] = useState(true);
  const [fieldBundles, setFieldBundles] = useState([]);
  const workspaceContext = useContext(WorkspaceContext);
  const auth = useAuth();
  const { user } = auth;

  useEffect(() => {
    async function fetchData(workspaceId) {
      const fieldBundles = await fetchFieldBundles(workspaceId);
      setFieldBundles(fieldBundles);

      setParentBundleId(fieldBundleId || fieldBundles[0].id);
    }
    workspaceId && fetchData(workspaceId);
  }, []);

  const clearState = () => {
    setUpdateFieldSelected(false);
    setUpdateField('');
    setCreateFieldValue('');
    setFieldId('');
    setIsDuplicateField(false);
    // workspaceContext.setFieldEditData(null);
    // clearWorkspaceSearchCriteria(workspaceContext);
    // workspaceContext.setSearchResults
  };

  const createFieldDefinition = () => {
    return {
      name: updateField,
      workspaceId: workspaceContext.currentWorkspaceId,
      isUserDefined: true,
      isEnteredField: false,
      parentBundleId: parentBundleId,
      searchCriteria: workspaceContext.workspaceSearchCriteria,
    };
  };

  const handleFieldSetSelect = value => {
    selectFieldBundle(value);
    setFieldId('');
    setUpdateFieldSelected(false);
  };

  const handleSave = async () => {
    const fieldDefinition = createFieldDefinition();
    setDisableSave(true);
    setIsSavingField(true);
    let id;
    if (existingFields.has(fieldId)) {
      await updateFieldInfo(
        user,
        fieldId,
        fieldDefinition,
        'replace',
        workspaceContext
      );
      id = fieldId;
    } else {
      id = await saveNewFieldInfo(
        user,
        fieldDefinition,
        workspaceContext.setCurrentWorkspaceFields,
        workspaceContext.setSavedFieldId,
        workspaceContext.setSavedBundleId,
        workspaceContext.setUpdateFieldSelectorEdit,
        workspaceContext
      );
      clearState();
    }
    setIsSavingField(false);
    setDisableSave(false);
    // clear search criteria
    workspaceContext.setFieldEditData(null);
    clearWorkspaceSearchCriteria(workspaceContext);
    clearWorkspaceSearchResults(workspaceContext);
    history.push({
      pathname: from,
      state: { id, refreshDataGrid: id },
    });
  };

  const selectFieldBundle = async value => {
    if (
      value != parentBundleId ||
      fieldOptions.length == 0 ||
      workspaceContext.updateFieldSelctorEdit
    ) {
      setParentBundleId(value);
      await getFieldsInfo(
        user,
        value,
        options => {
          setFieldOptions(options.fieldDescriptions);
          options.fieldDescriptions.forEach(option => {
            existingFields.add(option.field_id);
          });
        },
        setFieldLoading,
        setSelectDisable
      );
    }
  };

  useEffect(() => {
    if (
      workspaceContext.fieldEditData &&
      parentBundleId === workspaceContext.fieldEditData.parentBundleId
    ) {
      setFieldId(workspaceContext.fieldEditData.id);
      setUpdateField(workspaceContext.fieldEditData.name);
    }
  }, [fieldOptions]);

  useEffect(() => {
    if (fieldBundleId) {
      selectFieldBundle(fieldBundleId);
    }
  }, [fieldBundleId]);

  useEffect(() => {
    if (workspaceContext.updateFieldSelctorEdit === true && parentBundleId) {
      selectFieldBundle(parentBundleId);
      workspaceContext.setUpdateFieldSelectorEdit(false);
    }
  }, [workspaceContext.updateFieldSelctorEdit]);

  useEffect(() => {
    if (workspaceContext.fieldEditData?.parentBundleId) {
      setUpdateField(workspaceContext.fieldEditData.name);
      if (workspaceContext.fieldEditData.parentBundleId === parentBundleId) {
        setFieldId(workspaceContext.fieldEditData.id);
      } else {
        selectFieldBundle(workspaceContext.fieldEditData.parentBundleId);
      }
      setBlank(false);
    } else {
      setFieldId('');
      setDisableSave(true);
      setUpdateField('');
      setBlank(false);
    }
  }, [workspaceContext.fieldEditData]);

  // Sets the Field Set to the last one that was selected on the main page
  useEffect(() => {
    if (fieldBundleId) {
      setParentBundleId(fieldBundleId);
    }
  }, [fieldBundleId]);

  return (
    <Layout style={{ padding: 20, height: 'auto' }}>
      <Row gutter={[10, 10]}>
        <Col span={12}>
          <Row>
            <Col>
              <Text>Field Set</Text>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FieldBundleSelector
                disabled={!!workspaceContext.fieldEditData}
                fieldBundleId={fieldIdToBeUpdated || parentBundleId}
                onSelect={handleFieldSetSelect}
                fieldBundles={fieldBundles}
              />
            </Col>
          </Row>
        </Col>
        {workspaceContext.fieldEditData ? (
          <Col span={12}>
            <Row>
              <Col>
                <Text>Update Existing Field</Text>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Select
                  value={fieldIdToBeUpdated || fieldId}
                  placeholder="Select Field to Update"
                  disabled={!!workspaceContext.fieldEditData || selectDisable}
                  loading={fieldLoading}
                  style={{ width: '100%' }}
                  onChange={(value, option) => {
                    setCreateFieldValue('');
                    if (value) {
                      setDisableSave(false);
                      setUpdateFieldSelected(true);
                    } else {
                      setDisableSave(true);
                    }
                    if (option) {
                      if (option.children) {
                        setUpdateField(option.children);
                        setFieldId(value);
                        setBlank(false);
                      } else {
                        setUpdateField('');
                        setFieldId('');
                      }
                    } else {
                      setUpdateField('');
                      setFieldId('');
                    }
                  }}
                  allowClear={true}
                  onClear={() => {
                    setFieldId('');
                    setUpdateFieldSelected(false);
                    // if not duplicate and there is create field text setDisableSave(false);
                    if (createFieldValue && !isDuplicateField) {
                      setDisableSave(false);
                      setUpdateField(createFieldValue);
                      setBlank(false);
                    }
                  }}
                >
                  {fieldOptions
                    .sort((fieldA, fieldB) => {
                      if (fieldA.name < fieldB.name) {
                        return -1;
                      } else if (fieldA.name > fieldB.name) {
                        return 1;
                      } else {
                        return 0;
                      }
                    })
                    .map(field => {
                      return (
                        <Option key={field.field_id} value={field.field_id}>
                          {field.name}
                        </Option>
                      );
                    })}
                </Select>
              </Col>
            </Row>
          </Col>
        ) : (
          <Col span={12}>
            <Row>
              <Col>
                <Text>Create New Field</Text>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Input
                  autoFocus
                  // ref={newField}
                  value={createFieldValue}
                  disabled={
                    workspaceContext.fieldEditData ||
                    !(fieldId === 'N/A' || fieldId === '')
                  }
                  placeholder={'Enter New Field Name'}
                  onChange={e => {
                    if (e) {
                      if (
                        e.target.value === '' &&
                        (fieldId === 'N/A' || fieldId === '')
                      ) {
                        setBlank(true);
                      } else {
                        setBlank(false);
                      }
                    } else {
                      setCreateFieldValue('');
                    }

                    if (e.target.value.length === 0) {
                      setCreateFieldValue('');
                      setDisableSave(true);
                    }

                    if (
                      !fieldOptions
                        .map(field => field.name)
                        .includes(e.target.value)
                    ) {
                      if (e.target.value) {
                        // setFieldId('N/A');
                        setUpdateField(e.target.value);
                        setCreateFieldValue(e.target.value);
                        setDisableSave(false);
                      }
                      if (isDuplicateField) {
                        setIsDuplicateField(false);
                        setDisableSave(true);
                      }
                    } else {
                      setDisableSave(true);
                      setIsDuplicateField(true);
                    }
                  }}
                />
              </Col>
            </Row>
          </Col>
        )}
      </Row>
      {isDuplicateField ? (
        <Text type="danger" style={{ marginTop: '10px' }}>
          Field name already exists!
        </Text>
      ) : (
        ''
      )}
      <Divider />
      <div style={{ height: 'calc(100vh - 360px)', overflow: 'auto' }}>
        <SearchCriteriaViewer
          fieldDefinition={workspaceContext.workspaceSearchCriteria}
          useWorkspaceCriteria={true}
        ></SearchCriteriaViewer>
      </div>
      <Button
        style={{ width: 200, marginTop: 10 }}
        loading={isSavingField}
        icon={<SaveOutlined />}
        type="primary"
        disabled={
          !workspaceContext.workspaceSearchCriteria.criterias ||
          !(
            workspaceContext.workspaceSearchCriteria.criterias[0].question ||
            workspaceContext.workspaceSearchCriteria.criterias[0].templates ||
            workspaceContext.workspaceSearchCriteria.criterias[0].headers
          ) ||
          isDuplicateField ||
          (createFieldValue.length === 0 && fieldId === '') ||
          blank
        }
        onClick={handleSave}
      >
        {workspaceContext.fieldEditData ? 'Update Field' : 'Save Field'}
      </Button>
    </Layout>
  );
};

export default SearchSaver;
