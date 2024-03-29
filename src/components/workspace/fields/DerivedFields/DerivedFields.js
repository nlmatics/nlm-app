import { Route, useRouteMatch, Switch } from 'react-router-dom';
import AllDerivedFields from './AllDerivedFields';
import EditDerivedField from './EditDerivedField';
import NewDerivedField from './NewDerivedField';

export default function DerivedFields({ workspaceId }) {
  const { path, url } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/all`}>
        <AllDerivedFields workspaceId={workspaceId} url={url} />
      </Route>
      <Route path={`${path}/new`}>
        <NewDerivedField workspaceId={workspaceId} url={url} />
      </Route>
      <Route path={`${path}/:derivedFieldId`}>
        <EditDerivedField url={url} />
      </Route>
    </Switch>
  );
}
