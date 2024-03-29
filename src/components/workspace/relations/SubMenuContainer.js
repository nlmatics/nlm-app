import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import KnowledgeGraphVisualizer from '../../relationViz/KnowlegeGraphVisualizer';
import { fetchRelations } from './fetcher';
import Nodes from './Nodes';
import { RELATION_TYPES } from './Relations/Relations';
import Triples from './Triples';

const getRelationsByType = ({ data, type }) => {
  return data
    .filter(relation => {
      return relation.dataType === `relation-${type}`;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

export default function SubMenuContainer({
  workspaceId,
  setRelationType,
  currentRelationType,
}) {
  const { relationType } = useParams();
  const { state } = useLocation();
  const { postNewOrEdit } = state || {};
  const [nodes, setNodes] = useState([]);
  const [triples, setTriples] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    setRelationType(relationType);
  }, [relationType, setRelationType]);

  useEffect(() => {
    async function getRelations() {
      setIsFetching(true);
      const data = await fetchRelations(workspaceId);

      if (data) {
        setTriples(getRelationsByType({ data, type: 'triple' }));
        setNodes(getRelationsByType({ data, type: 'node' }));
        setIsFetching(false);
      }
    }
    workspaceId && getRelations(workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    async function getRelations() {
      setIsFetching(true);
      const data = await fetchRelations(workspaceId);

      if (data) {
        setTriples(getRelationsByType({ data, type: 'triple' }));
        setNodes(getRelationsByType({ data, type: 'node' }));
        setIsFetching(false);
      }
    }
    workspaceId && postNewOrEdit && getRelations(workspaceId);
  }, [workspaceId, postNewOrEdit]);

  return (
    <>
      {currentRelationType === RELATION_TYPES.TRIPLE && (
        <Triples
          isFetching={isFetching}
          triples={triples}
          workspaceId={workspaceId}
        />
      )}
      {currentRelationType === RELATION_TYPES.NODE && (
        <Nodes
          isFetching={isFetching}
          nodes={nodes}
          workspaceId={workspaceId}
        />
      )}
      {currentRelationType === RELATION_TYPES.KNOWLEDGE_GRAPH && (
        <KnowledgeGraphVisualizer workspaceId={workspaceId} />
      )}
    </>
  );
}
