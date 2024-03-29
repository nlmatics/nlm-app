import { Route, Switch, useRouteMatch } from 'react-router-dom';
import FieldExtraction from '../FieldExtraction';
import AllDataFields from './AllDataFields';

export default function DataFields({ workspaceId }) {
  const { path, url } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/all`}>
        <AllDataFields workspaceId={workspaceId} url={url} />
      </Route>
      <Route path={`${path}/new`}>
        <FieldExtraction />
      </Route>
      <Route path={`${path}/refine/:fieldId`}>
        <FieldExtraction />
      </Route>
    </Switch>
  );
}
