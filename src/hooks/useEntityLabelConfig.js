import { useEffect, useState } from 'react';
import API from '../utils/API.js';
import {
  BIO_ENTITY_LABEL_CONFIG,
  GENERAL_ENTITY_LABEL_CONFIG,
} from '../utils/constants';

async function fetchWorkspaceById(workspaceId) {
  return await API.get(`/workspace/${workspaceId}`, {});
}
export const useEntityLabelConfig = workspaceId => {
  const [entityLabelConfig, setEntityLabelConfig] = useState(null);

  useEffect(() => {
    async function getEntityLabelConfig() {
      const response = await fetchWorkspaceById(workspaceId);
      const workspace = response.data;

      let domain = workspace?.settings ? workspace?.settings.domain : 'general';
      setEntityLabelConfig(
        domain === 'biology'
          ? BIO_ENTITY_LABEL_CONFIG
          : GENERAL_ENTITY_LABEL_CONFIG
      );
    }
    workspaceId && getEntityLabelConfig(workspaceId);
  }, [workspaceId]);

  return {
    entityLabelConfig,
  };
};
