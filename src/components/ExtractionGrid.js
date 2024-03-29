import { useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Layout, Breadcrumb, Spin, Typography } from 'antd';
import { WorkspaceContext } from './Workspace.js';
import { WorkspaceGrid } from './WorkspaceGrid.js';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    flexDirection: 'column',
    height: '45px',
  },

  headerElements: { width: '100%' },

  breadcrumbBar: {
    marginTop: '20px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: '8px',
    fontSize: '12px',
  },

  spin: {
    width: '100%',
  },

  triggerButton: {},
});
const { Content, Header } = Layout;
const { Text, Title } = Typography;

export const ExtractionGrid = ({ gridData, setGridData, gridLoading }) => {
  const workspaceContext = useContext(WorkspaceContext);
  const classes = useStyles();

  return (
    <Layout>
      <Header className={classes.header}>
        <div className={classes.headerElements}>
          <div className={classes.breadcrumbBar}>
            <Breadcrumb separator="|">
              <Breadcrumb.Item className="extraction-grid--breadcrumb-item">
                {`Workspace: ${workspaceContext.currentWorkspaceName}`}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </Header>
      <Content>
        <Title level={4} style={{ paddingLeft: '59px' }}>
          <Text className="extraction-grid--fieldset">
            Field Set: {workspaceContext.selectedBundleName}
          </Text>
        </Title>
        <Spin
          tip="Please wait while our algorithms do their work. This may take a few minutes."
          spinning={gridLoading}
          wrapperClassName={classes.spin}
          size="large"
        >
          {' '}
          <div style={{ marginLeft: '10px' }}>
            <WorkspaceGrid
              setGridData={setGridData}
              gridData={gridData}
              tableHeight="calc(100vh - 140px)"
            />
          </div>
        </Spin>
      </Content>
    </Layout>
  );
};
