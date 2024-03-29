import { Route, useRouteMatch, Switch } from 'react-router-dom';
import AllWorkflowFields from './AllWorkflowFields';
import EditWorkflowField from './EditWorkflowField';
import NewWorkflowField from './NewWorkflowField';

export default function WorkflowFields({ workspaceId }) {
  const { path, url } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/all`}>
        <AllWorkflowFields workspaceId={workspaceId} url={url} />
      </Route>
      <Route path={`${path}/new`}>
        <NewWorkflowField workspaceId={workspaceId} url={url} />
      </Route>
      <Route path={`${path}/:workflowFieldId`}>
        <EditWorkflowField url={url} />
      </Route>
    </Switch>
  );
}
