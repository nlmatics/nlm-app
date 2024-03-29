import { Button, Col, Layout, Row } from 'antd';
import { useContext, useEffect, useRef } from 'react';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import nlmaticsLogoDark from '../../assets/images/nlmatics-logo-horizontal-black-bg.svg';
import nlmaticsLogoLight from '../../assets/images/nlmatics-logo-horizontal-white-bg.svg';
import EntitiesLegend from '../../components/common/EntitiesLegend';
import FieldFilters from '../../components/common/FieldFilters';
import { WorkspaceContext } from '../../components/WorkspaceContext';
import WorkspaceSearch from '../../components/WorkspaceSearch';
import DocumentContext from '../../contexts/document/DocumentContext';
import FieldFiltersProvider from '../../contexts/fieldFilters/FieldFiltersProvider';
import ThemeContext from '../../contexts/theme/ThemContext';
import useUserPermission from '../../hooks/useUserPermission';
import API from '../../utils/API.js';
import {
  clearWorkspaceSearchCriteria,
  clearWorkspaceSearchResults,
} from '../../utils/helpers';
import DocumentPage from '../DocumentPage/DocumentPage';
import usePageHelper from '../hooks/usePageHelper';
import './index.less';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function Search({ showBackButton }) {
  const { workspaceId } = useParams();
  const location = useLocation();
  const from = location?.state?.from;
  const workspaceContext = useContext(WorkspaceContext);
  const history = useHistory();
  const { isDocumentPage } = usePageHelper();
  const { isDrawerOpen } = useContext(DocumentContext);
  const searchPageRef = useRef(null);
  const isDocumentDisplayed = isDocumentPage || isDrawerOpen;
  const { theme, THEMES } = useContext(ThemeContext);

  useEffect(() => {
    searchPageRef?.current?.scrollTo(0, 0);
  }, [workspaceContext.searchResults]);

  useEffect(() => {
    document.title = 'nlmatics: Search';
  }, []);

  useEffect(() => {
    async function fetchWorkspaceById(workspaceId) {
      const response = await API.get(`/workspace/${workspaceId}`, {});
      workspaceContext.setCurrentWorkspace(response.data);
    }
    workspaceId &&
      !workspaceContext.currentWorkspace &&
      fetchWorkspaceById(workspaceId);
  }, [workspaceId]);

  useUserPermission();

  return (
    <>
      {isDocumentPage && (
        <div style={{ marginLeft: 20, marginRight: 20 }}>
          <DocumentPage />
        </div>
      )}
      <Layout
        className="nlm-search"
        ref={searchPageRef}
        style={{ display: isDocumentDisplayed ? 'none' : 'flex' }}
      >
        {showBackButton && (
          <Link to={`/workspace/${workspaceId}`}>
            <Button
              title="Go Back"
              style={{ position: 'fixed', left: 15, top: 15, zIndex: 3 }}
              icon={<ArrowLeftOutlined />}
            ></Button>
          </Link>
        )}
        <Layout.Content>
          <FieldFiltersProvider>
            <Row justify="start" gutter={[20, 0]} className="nlm-home__results">
              <Col style={{ paddingTop: 7 }} span={4}>
                <Row className="nlm-search__logo-wrapper">
                  <Col
                    span={24}
                    style={{
                      ...(showBackButton ? { textAlign: 'right' } : {}),
                    }}
                  >
                    <img
                      className="nlm-search__logo"
                      width={150}
                      src={
                        theme === THEMES.LIGHT
                          ? nlmaticsLogoLight
                          : nlmaticsLogoDark
                      }
                      alt="nlmatics Logo"
                      onClick={() => {
                        setTimeout(() => {
                          clearWorkspaceSearchCriteria(workspaceContext);
                          clearWorkspaceSearchResults(workspaceContext);
                        });
                        history.push(`/search/${workspaceId}`);
                      }}
                    ></img>
                  </Col>
                </Row>
                <Row className="nlm-search__field-filters">
                  <Col span={24}>
                    <FieldFilters workspaceId={workspaceId} />
                  </Col>
                </Row>
              </Col>

              <Col span={16}>
                <WorkspaceSearch
                  key={workspaceId}
                  workspaceId={workspaceId}
                  mode="SEARCH"
                  from={from}
                />
              </Col>
              <Col span={4} className="nlm-entities-legend">
                <EntitiesLegend />
              </Col>
            </Row>
          </FieldFiltersProvider>
        </Layout.Content>
      </Layout>
    </>
  );
}
