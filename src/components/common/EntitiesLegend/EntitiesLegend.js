import { Checkbox, List, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import EntityTypesContext from '../../../contexts/entityTypes/EntityTypesContext';
import { WorkspaceContext } from '../../WorkspaceContext';

export default function EntitiesLegend() {
  const workspaceContext = useContext(WorkspaceContext);
  const [indeterminate, setIndeterminate] = useState(false);
  const {
    entityTypes,
    selectedEntityTypes,
    updateSelectedEntityTypes,
    selectAllEntityTypes,
    deSelectAllEntityTypes,
    getEntityTypesByKeys,
    selectLookForEntityTypes,
  } = useContext(EntityTypesContext);

  useEffect(() => {
    setIndeterminate(
      selectedEntityTypes.length &&
        entityTypes.length !== selectedEntityTypes.length
    );
  }, [selectedEntityTypes.length, entityTypes.length]);

  useEffect(() => {
    const entityKeys =
      workspaceContext.workspaceSearchCriteria.criterias.flatMap(
        ({ entityTypes }) => entityTypes
      );
    if (entityKeys?.length) {
      const entityTypesByKeys = getEntityTypesByKeys(entityKeys);
      selectLookForEntityTypes(entityTypesByKeys);
    }
  }, [workspaceContext.workspaceSearchCriteria.criterias]);

  return (
    <List
      size="small"
      header={
        <Checkbox
          defaultChecked
          indeterminate={indeterminate}
          onChange={event => {
            const {
              target: { checked },
            } = event;
            checked ? selectAllEntityTypes() : deSelectAllEntityTypes();
          }}
        >
          <Typography.Title level={5} style={{ marginBottom: 0 }}>
            {workspaceContext.currentWorkspace?.settings?.domain === 'biology'
              ? 'Bioconcepts'
              : 'Concepts'}
          </Typography.Title>
        </Checkbox>
      }
      bordered
      dataSource={entityTypes}
      renderItem={({ label, color }) => (
        <List.Item style={{ paddingTop: 2, paddingBottom: 2, border: 'none' }}>
          <Checkbox
            defaultChecked
            checked={selectedEntityTypes.find(
              ({ color: selectedColor }) => selectedColor === color
            )}
            onChange={event => {
              const {
                target: { checked },
              } = event;

              updateSelectedEntityTypes({
                entityType: { label, color },
                isSelected: checked,
              });
            }}
          >
            <span
              style={{
                textDecorationThickness: 2,
                textDecorationLine: 'underline',
                textDecorationColor: color,
              }}
            >
              {label}
            </span>
          </Checkbox>
        </List.Item>
      )}
    />
  );
}
