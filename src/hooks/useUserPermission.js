import { useContext, useEffect } from 'react';

import { WorkspaceContext } from '../components/WorkspaceContext';
import useUserInfo from './useUserInfo';
import { roles } from '../utils/constants';

// Determines the users current role based on the active workspace
export default function useUserPermission() {
  const workspaceContext = useContext(WorkspaceContext);
  const { data: userInfo } = useUserInfo();

  useEffect(() => {
    if (!!userInfo && !!workspaceContext.currentWorkspace) {
      let currentWorkspace = workspaceContext.currentWorkspace;
      let assignedRole = Object.keys(currentWorkspace.collaborators).find(
        email => email === userInfo.emailId
      );
      let isPublic = Object.keys(currentWorkspace.collaborators).some(
        email => email === '*'
      );

      if (userInfo.id === currentWorkspace.userId) {
        workspaceContext.setCurrentUserRole(roles.OWNER);
      } else if (assignedRole) {
        workspaceContext.setCurrentUserRole(
          currentWorkspace.collaborators[assignedRole]
        );
      } else if (isPublic) {
        workspaceContext.setCurrentUserRole(roles.VIEWER);
      } else {
        workspaceContext.setCurrentUserRole(roles.UNAUTHORIZED);
      }
    }
  }, [workspaceContext.currentWorkspace, userInfo]);

  return {
    isAllowedToCreateField: () =>
      workspaceContext.currentUserRole === roles.EDITOR ||
      workspaceContext.currentUserRole === roles.OWNER,
    isViewerRole: () => workspaceContext.currentUserRole === roles.VIEWER,
  };
}
