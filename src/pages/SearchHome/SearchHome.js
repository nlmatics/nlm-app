import { Button, Col, Layout, Row } from 'antd';
import { useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import nlmaticsLogoDark from '../../assets/images/nlmatics-logo-horizontal-black-bg.svg';
import nlmaticsLogoLight from '../../assets/images/nlmatics-logo-horizontal-white-bg.svg';
import { WorkspaceContext } from '../../components/WorkspaceContext';
import WorkspaceSearch from '../../components/WorkspaceSearch';
import ThemeContext from '../../contexts/theme/ThemContext';
import useUserPermission from '../../hooks/useUserPermission';
import API from '../../utils/API.js';
import './index.less';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function SearchHome({ showBackButton }) {
  const { workspaceId } = useParams();
  const workspaceContext = useContext(WorkspaceContext);
  const { theme, THEMES } = useContext(ThemeContext);

  useEffect(() => {
    workspaceContext.resetSearchResults();
    workspaceContext.resetWorkspaceSearchCriteria();
  }, []);

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
    <Layout className="nlm-searchHome">
      {showBackButton && (
        <Link to={`/workspace/${workspaceId}`}>
          <Button
            title="Go Back"
            style={{ position: 'fixed', left: 15, top: 15 }}
            icon={<ArrowLeftOutlined />}
          ></Button>
        </Link>
      )}

      <Layout.Content>
        <Row justify="center" style={{ marginBottom: 20 }}>
          <Col>
            <img
              height={100}
              src={
                theme === THEMES.LIGHT ? nlmaticsLogoLight : nlmaticsLogoDark
              }
              alt="nlmatics Logo"
            ></img>
          </Col>
        </Row>
        <Row justify="center">
          <Col>
            <WorkspaceSearch
              key={workspaceId}
              workspaceId={workspaceId}
              mode="SEARCH"
            />
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
}
