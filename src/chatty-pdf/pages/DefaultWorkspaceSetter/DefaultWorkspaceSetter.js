import { useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { WorkspaceContext } from '../../../components/WorkspaceContext';
import useUserInfo from '../../../hooks/useUserInfo';
import useWorkspaces from '../../../pages/Workspaces/useWorkspaces';
import { useAuth } from '../../../utils/use-auth';

export default function DefaultWorkspaceSetter() {
  const workspaceContext = useContext(WorkspaceContext);
  const { user } = useAuth();
  const { data: userInfo } = useUserInfo();
  let userId;
  const tokens = user?.displayName?.split('#');
  if (tokens.length > 1) {
    userId = tokens[1];
  }
  const { data: workspaces, isLoading: isFetchingWorkspaces } =
    useWorkspaces(userId);

  useEffect(() => {
    let defaultWorkspace =
      workspaces?.private_workspaces && workspaces?.private_workspaces[0];
    let defaultWorkspaceId = defaultWorkspace?.id;

    if (defaultWorkspace) {
      workspaceContext.setCurrentWorkspace(defaultWorkspace);
      workspaceContext.setCurrentWorkspaceId(defaultWorkspaceId);

      var newCanEdit =
        defaultWorkspace &&
        userInfo &&
        (userInfo.id === defaultWorkspace.userId || userInfo.isAdmin);
      workspaceContext.setCurrentWorkspaceEditable(newCanEdit);
    }
  }, [workspaces?.private_workspaces && workspaces?.private_workspaces[0]]);

  if (!isFetchingWorkspaces && workspaceContext.currentWorkspaceId) {
    return (
      <Redirect to={`/documents/${workspaceContext.currentWorkspaceId}`} />
    );
  }
  return null;
}
