import { useContext, useEffect, useState } from 'react';
import { WorkspaceContext } from '../../components/WorkspaceContext';
import {
  getEntityLabelConfig,
  getUniqueEntityConfigByLabel,
} from '../../utils/helpers';
import EntityTypesContext from './EntityTypesContext';

export default function EntityTypesProvider({ children }) {
  const workspaceContext = useContext(WorkspaceContext);
  const entityLabelConfig = getEntityLabelConfig(workspaceContext);
  const uniqueEntityConfigByLabel =
    getUniqueEntityConfigByLabel(entityLabelConfig);
  const defaultEntityTypes = uniqueEntityConfigByLabel.filter(
    ({ defaultHilight }) => defaultHilight
  );
  const [entityTypes, setEntityTypes] = useState(uniqueEntityConfigByLabel);
  const [selectedEntityTypes, setSelectedEntityTypes] =
    useState(defaultEntityTypes);

  useEffect(() => {
    const entityLabelConfig = getEntityLabelConfig(workspaceContext);
    const uniqueEntityConfigByLabel =
      getUniqueEntityConfigByLabel(entityLabelConfig);
    const defaultEntityTypes = uniqueEntityConfigByLabel.filter(
      ({ defaultHilight }) => defaultHilight
    );
    setEntityTypes(uniqueEntityConfigByLabel);
    setSelectedEntityTypes(defaultEntityTypes);
  }, [workspaceContext.currentWorkspace]);

  const updateSelectedEntityTypes = ({ entityType, isSelected }) => {
    if (isSelected) {
      setSelectedEntityTypes([...selectedEntityTypes, entityType]);
    } else {
      setSelectedEntityTypes(
        selectedEntityTypes.filter(({ color }) => color !== entityType.color)
      );
    }
  };

  const selectLookForEntityTypes = entityTypes => {
    setSelectedEntityTypes(entityTypes);
  };

  const selectAllEntityTypes = () => {
    setSelectedEntityTypes(entityTypes);
  };
  const deSelectAllEntityTypes = () => {
    setSelectedEntityTypes([]);
  };
  const getEntityTypesByKeys = keys => {
    return uniqueEntityConfigByLabel.filter(({ key }) => keys.includes(key));
  };
  return (
    <EntityTypesContext.Provider
      value={{
        entityTypes,
        setEntityTypes,
        selectedEntityTypes,
        updateSelectedEntityTypes,
        selectAllEntityTypes,
        deSelectAllEntityTypes,
        getEntityTypesByKeys,
        selectLookForEntityTypes,
      }}
    >
      {children}
    </EntityTypesContext.Provider>
  );
}
