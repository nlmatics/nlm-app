import { Layout, Spin } from 'antd';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import EntityTypesProvider from '../../../contexts/entityTypes/EntityTypesProvider';
import useUserInfo from '../../../hooks/useUserInfo';
import DocumentPage from '../../../pages/DocumentPage/DocumentPage';
import FieldsAndExtractions from '../fields/FieldsAndExtractions';
import Relations from '../relations/Relations';
import Analytics from '../visualizations/Visualizations';
import WorkspaceSearchWithEntitiesLegend from '../WorkspaceSearchWithEntitiesLegend';
const DocumentList = lazy(() => import('../documents/DocumentList'));
const MenuContentWrapper = ({
  visible,
  children,
  isDocument,
  isRenderedBefore,
}) => {
  // Why isRenderedBefore: Toggle the display of components only after they are rendered once before
  // else do not render the component. This is done to avoid unnecessary rendering of all the tabs and
  // making api calls.
  return visible || isRenderedBefore ? (
    <Layout
      style={{
        display: visible ? 'block' : 'none',
        marginTop: isDocument ? -105 : 10,
      }}
    >
      {children}
    </Layout>
  ) : null;
};
export default function MenuContainer({
  currentActiveMenuKey,
  setLatestExtractionsMenuKey,
  setActiveMenuKey,
  workspaceId,
  workspaceDocumentsIngestionStatus,
}) {
  const { activeMenuKey } = useParams();
  const visitedKeysSetRef = useRef(new Set());
  const { isFeatureIncluded, FEATURES } = useUserInfo();

  useEffect(() => {
    visitedKeysSetRef.current.add(currentActiveMenuKey);
  }, [currentActiveMenuKey]);

  useEffect(() => {
    setActiveMenuKey(activeMenuKey);
  }, [activeMenuKey, setActiveMenuKey]);

  return (
    <>
      <MenuContentWrapper
        visible={currentActiveMenuKey === 'documents'}
        isRenderedBefore={visitedKeysSetRef.current.has('documents')}
      >
        <Suspense fallback={<Spin />}>
          <DocumentList
            workspaceDocumentsIngestionStatus={
              workspaceDocumentsIngestionStatus
            }
          ></DocumentList>
        </Suspense>
      </MenuContentWrapper>
      <MenuContentWrapper
        visible={currentActiveMenuKey === 'search'}
        isRenderedBefore={visitedKeysSetRef.current.has('search')}
      >
        <EntityTypesProvider>
          <WorkspaceSearchWithEntitiesLegend workspaceId={workspaceId} />
        </EntityTypesProvider>
      </MenuContentWrapper>
      {isFeatureIncluded(FEATURES.EXTRACTION) && (
        <MenuContentWrapper
          visible={currentActiveMenuKey === 'extractions'}
          isRenderedBefore={visitedKeysSetRef.current.has('extractions')}
        >
          <FieldsAndExtractions
            workspaceId={workspaceId}
            setLatestExtractionsMenuKey={setLatestExtractionsMenuKey}
          />
        </MenuContentWrapper>
      )}
      {isFeatureIncluded(FEATURES.RELATION_EXTRACTION) && (
        <MenuContentWrapper
          visible={currentActiveMenuKey === 'relations'}
          isRenderedBefore={visitedKeysSetRef.current.has('relations')}
        >
          <Relations workspaceId={workspaceId} />
        </MenuContentWrapper>
      )}
      {isFeatureIncluded(FEATURES.VISUALIZATION) && (
        <MenuContentWrapper
          visible={currentActiveMenuKey === 'analytics'}
          isRenderedBefore={visitedKeysSetRef.current.has('analytics')}
        >
          <Analytics workspaceId={workspaceId} />
        </MenuContentWrapper>
      )}
      <MenuContentWrapper
        visible={currentActiveMenuKey === 'document'}
        isDocument
      >
        <Switch>
          {/* Using path={`${path}/:documentId/:docActiveTabKey`} conflicts with extractions path. Hence hardcoded `document`. */}
          <Route
            exact
            path={`/workspace/:workspaceId/document/:documentId/:docActiveTabKey`}
          >
            <DocumentPage />
          </Route>
        </Switch>
      </MenuContentWrapper>
    </>
  );
}
