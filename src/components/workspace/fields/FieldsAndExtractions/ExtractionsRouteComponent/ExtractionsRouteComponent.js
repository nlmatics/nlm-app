import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import DataFields from '../../DataFields';
import WorkflowFields from '../../WorkflowFields';
import DerivedFields from '../../DerivedFields';

const MenuContentWrapper = ({ visible, children }) => (
  <div style={{ display: visible ? 'block' : 'none' }}>{children}</div>
);
export default function ExtractionsRouteComponent({
  workspaceId,
  setExtractionsMenuKey,
  currentExtractionsMenuKey,
}) {
  const { extractionsMenuKey } = useParams();
  const [isRefineField, setIsRefineField] = useState(false);

  const location = useLocation();
  const refineField = location?.state?.refineField;
  const gotoExtractionsView = location?.state?.gotoExtractionsView;

  useEffect(() => {
    setExtractionsMenuKey(extractionsMenuKey);
  }, [extractionsMenuKey, setExtractionsMenuKey]);

  useEffect(() => {
    if (refineField) {
      setIsRefineField(true);
    }
  }, [refineField]);

  useEffect(() => {
    if (gotoExtractionsView) {
      setIsRefineField(false);
    }
  }, [gotoExtractionsView]);

  return (
    <>
      <MenuContentWrapper visible={currentExtractionsMenuKey === 'dataFields'}>
        <DataFields
          workspaceId={workspaceId}
          isRefineField={isRefineField}
          setIsRefineField={setIsRefineField}
        />
      </MenuContentWrapper>
      <MenuContentWrapper
        visible={currentExtractionsMenuKey === 'workflowFields'}
      >
        <WorkflowFields workspaceId={workspaceId} />
      </MenuContentWrapper>
      <MenuContentWrapper
        visible={currentExtractionsMenuKey === 'derivedFields'}
      >
        <DerivedFields workspaceId={workspaceId} />
      </MenuContentWrapper>
    </>
  );
}
