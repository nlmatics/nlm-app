import { useContext, createContext } from 'react';
import { useActiveDirectoryProvideAuth } from './useActiveDirectoryProvideAuth.js';

const authContext = createContext();
// available to any child component that calls useAuth().

export function ProvideAuth({ children }) {
  let auth;

  auth = ProvideActiveDirectoryAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

function ProvideActiveDirectoryAuth() {
  let activeDirectoryAuth = useActiveDirectoryProvideAuth();
  return activeDirectoryAuth;
}

export const authRequired = () => {
  return true;
};

// Custom Hook
export const useAuth = () => {
  // console.log(authContext);
  return useContext(authContext);
};
