import {
  DatabaseOutlined,
  FileOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  Layout,
  PageHeader,
  Row,
  Spin,
  Statistic,
  Tabs,
  Typography,
} from 'antd';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { WorkspaceContext } from '../../components/WorkspaceContext';
import WorkspaceEditor from '../../components/WorkspaceEditor';
import { fetchWorkspaces } from '../../utils/apiCalls.js';
import { roles } from '../../utils/constants';
import { selectCurrentWorkspace } from '../../utils/helpers';
import { useAuth } from '../../utils/use-auth';
import './index.less';
import useWorkspaces from './useWorkspaces';
import debounce from '../../utils/debounce';

const workspaceGroups = {
  MY: 'private_workspaces',
  SHARED: 'collaborated_workspaces',
  SUBSCRIBED: 'subscribed_workspaces',
  PUBLIC: 'public_workspaces',
};

const filterByQuery = ({ groupedWorkspaces, query }) => {
  const { MY, SHARED, SUBSCRIBED, PUBLIC } = workspaceGroups;

  const filterByGroupType = groupType =>
    groupedWorkspaces[groupType].filter(({ name }) =>
      name.toLowerCase().includes(query.toLowerCase())
    );
  return {
    [MY]: filterByGroupType(MY),
    [SHARED]: filterByGroupType(SHARED),
    [SUBSCRIBED]: filterByGroupType(SUBSCRIBED),
    [PUBLIC]: filterByGroupType(PUBLIC),
  };
};
const getAllWorkspaces = groupedWorkspaces => {
  return [
    ...groupedWorkspaces[workspaceGroups.MY],
    ...groupedWorkspaces[workspaceGroups.SHARED],
    ...groupedWorkspaces[workspaceGroups.SUBSCRIBED],
    ...groupedWorkspaces[workspaceGroups.PUBLIC],
  ];
};
const getSortedWorkspacesByName = workspaces => {
  return workspaces.sort(({ name: nameA }, { name: nameB }) =>
    nameA.toLowerCase() > nameB.toLowerCase() ? 1 : -1
  );
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const getCardBackgroundColor = () => {
  let h = Math.floor(Math.random() * (182 - 225 + 1)) + 182;
  let s = Math.floor(Math.random() * (60 - 25 + 1)) + 25;
  let l = Math.floor(Math.random() * (85 - 45 + 1)) + 45;
  const color = 'hsl(' + h + ', ' + s + '%, ' + l + '%, 0.5)';
  return color;
};

const createTileCover = (name, id, workspaceIdByColorMap) => {
  const firstLetters = name.trim().split(/\s+/);
  let acronym = '';
  firstLetters.forEach(word => {
    acronym += word[0];
  });

  const { Title } = Typography;

  return (
    <Link to={`/workspace/${id}/documents`}>
      <div
        style={{
          height: 70,
          backgroundColor: workspaceIdByColorMap && workspaceIdByColorMap[id],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Title
          style={{ fontSize: 24, marginBottom: 0, fontWeight: 500 }}
          level={5}
        >
          {acronym.toUpperCase()}
        </Title>
      </div>
    </Link>
  );
};

export default function Workspaces() {
  const workspaceIdByColorMapRef = useRef({});
  const workspaceContext = useContext(WorkspaceContext);
  const history = useHistory();
  const { user } = useAuth();
  let userId;
  const tokens = user?.displayName?.split('#');
  if (tokens.length > 1) {
    userId = tokens[1];
  }
  const { workspacesFilter } = useParams();
  const query = decodeURIComponent(useQuery().get('q') || '');
  const { pathname } = useLocation();
  const { data: workspaces, isLoading: isFetchingWorkspaces } =
    useWorkspaces(userId);

  const [groupedWorkspaces, setGroupedWorkspaces] = useState({
    [workspaceGroups.MY]: [],
    [workspaceGroups.SHARED]: [],
    [workspaceGroups.SUBSCRIBED]: [],
    [workspaceGroups.PUBLIC]: [],
  });

  const [filteredWorkspaces, setFilteredWorkspaces] = useState({
    [workspaceGroups.MY]: [],
    [workspaceGroups.SHARED]: [],
    [workspaceGroups.SUBSCRIBED]: [],
    [workspaceGroups.PUBLIC]: [],
  });
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    document.title = 'nlmatics: Workspaces';
  }, []);

  useEffect(() => {
    if (query) {
      setFilteredWorkspaces(
        filterByQuery({
          groupedWorkspaces,
          query,
        })
      );
    }
  }, [query, groupedWorkspaces]);

  useEffect(() => {
    if (!isFetchingWorkspaces) {
      setGroupedWorkspaces(workspaces);
      setFilteredWorkspaces(workspaces);
      workspaceIdByColorMapRef.current = Object.fromEntries(
        getAllWorkspaces(workspaces).map(({ id }) => [
          id,
          getCardBackgroundColor(),
        ])
      );
    }
  }, [workspaces, isFetchingWorkspaces]);

  // Given the list of workspaces, creates a grid of tiles for each workspace in the list. If the tile is clicked on, it will take the user
  // to that workspace.
  const workspaceCards = workspaceList => {
    if (
      workspaceContext.currentUserRole === roles.VIEWER &&
      !workspaceList?.length
    ) {
      return (
        <div
          style={{
            display: 'flex',
            height: '80vh',
            width: '100vw',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isFetchingWorkspaces ? <Spin /> : <h2>No Workspaces Available</h2>}
        </div>
      );
    }
    return (
      <>
        {workspaceContext.currentUserRole !== roles.VIEWER && (
          <Col span={4}>
            <Card
              size="small"
              style={{
                height: 145,
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
              }}
            >
              <Button
                size="large"
                shape="circle"
                type="primary"
                title="Create new workspace"
                icon={<PlusOutlined></PlusOutlined>}
                onClick={createNewWorkspace}
              ></Button>
            </Card>
          </Col>
        )}
        {!!workspaceList?.length &&
          workspaceList.map(
            ({
              name,
              id,
              statistics: {
                document: { total: docTotal },
                fields: { total: fieldTotal },
              },
            }) => (
              <Col key={id} span={4}>
                <Card
                  size="small"
                  hoverable
                  cover={createTileCover(
                    name,
                    id,
                    workspaceIdByColorMapRef.current
                  )}
                  style={{
                    textAlign: 'center',
                    height: 145,
                  }}
                  bodyStyle={{ padding: 0 }}
                  title={<Link to={`/workspace/${id}/documents`}>{name}</Link>}
                  actions={[
                    <Button
                      size="small"
                      key={`${id}-docs`}
                      type="link"
                      href={`/workspace/${id}/documents`}
                    >
                      <Statistic
                        valueStyle={{ fontSize: 13 }}
                        value={docTotal}
                        prefix={<FileOutlined />}
                      />
                    </Button>,
                    <Button
                      size="small"
                      key={`${id}-fields`}
                      type="link"
                      href={`/workspace/${id}/extractions/data`}
                    >
                      <Statistic
                        valueStyle={{ fontSize: 13 }}
                        value={fieldTotal}
                        prefix={<DatabaseOutlined />}
                      />
                    </Button>,
                  ]}
                ></Card>
              </Col>
            )
          )}
      </>
    );
  };

  // Opens up the workspace creation modal
  const createNewWorkspace = () => {
    setModalVisible(true);
  };

  // Closes the workspace creation modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Accepts the data for the new workspace and creates it. Also opens that new workspace
  const handleWorkspaceCreation = (formData, workspaceId) => {
    const newWorkspace = {
      id: workspaceId,
      name: formData.workspaceName,
      collaborators: formData.collaborators ? formData.collaborators : {},
      isPublic: formData.isPublic,
    };
    setModalVisible(false);
    fetchWorkspaces(user, workspaceContext, formData.workspaceName);
    selectCurrentWorkspace(workspaceContext, newWorkspace);
    history.push(`/workspace/${workspaceId}/documents`);
  };

  const handleChange = debounce(({ query, groupedWorkspaces }) => {
    setFilteredWorkspaces(
      filterByQuery({
        groupedWorkspaces,
        query,
      })
    );
    history.replace(`${pathname}?q=${encodeURIComponent(query)}`);
  }, 300);

  return (
    // TODO: 93vh is 100vh minus the height of the header (~7vh). Eventually, we should make these variables (and more exact by defining
    // the header height in terms of vh)
    <PageHeader title="Workspaces" className="nlm-page-workspaces">
      <Layout>
        <Layout.Content>
          <Tabs
            size="large"
            activeKey={workspacesFilter}
            defaultActiveKey="all"
            onTabClick={key => {
              history.push(`/workspaces/${key}?q=${encodeURIComponent(query)}`);
            }}
            tabBarExtraContent={{
              left: (
                <Input
                  defaultValue={query}
                  style={{ marginRight: 20, width: 200 }}
                  allowClear
                  placeholder="Search"
                  addonBefore={<SearchOutlined />}
                  onChange={({ target: { value: query } }) => {
                    handleChange({ query, groupedWorkspaces });
                  }}
                />
              ),
            }}
            className="nlm-page-workspaces__tabs"
            items={[
              {
                key: 'all',
                label: 'All',
                children: (
                  <Row gutter={[10, 10]}>
                    {workspaceCards(
                      getSortedWorkspacesByName(
                        getAllWorkspaces(filteredWorkspaces)
                      )
                    )}
                  </Row>
                ),
              },
              {
                key: 'my',
                label: 'My',
                children: (
                  <Row gutter={[10, 10]}>
                    {workspaceCards(
                      getSortedWorkspacesByName(
                        filteredWorkspaces[workspaceGroups.MY]
                      )
                    )}
                  </Row>
                ),
              },
              {
                key: 'shared',
                label: 'Shared',
                children: (
                  <Row gutter={[10, 10]}>
                    {workspaceCards(
                      getSortedWorkspacesByName(
                        filteredWorkspaces[workspaceGroups.SHARED]
                      )
                    )}
                  </Row>
                ),
              },
              {
                key: 'subscribed',
                label: 'Subscribed',
                children: (
                  <Row gutter={[10, 10]}>
                    {workspaceCards(
                      getSortedWorkspacesByName(
                        filteredWorkspaces[workspaceGroups.SUBSCRIBED]
                      )
                    )}
                  </Row>
                ),
              },
              {
                key: 'public',
                label: 'Public',
                children: (
                  <Row gutter={[10, 10]}>
                    {workspaceCards(
                      getSortedWorkspacesByName(
                        filteredWorkspaces[workspaceGroups.PUBLIC]
                      )
                    )}
                  </Row>
                ),
              },
            ]}
          />

          <WorkspaceEditor
            onClose={closeModal}
            createWorkspace={true}
            visible={modalVisible}
            wsEdit={false}
            onWorkspaceCreate={handleWorkspaceCreation}
          />
        </Layout.Content>
      </Layout>
    </PageHeader>
  );
}
