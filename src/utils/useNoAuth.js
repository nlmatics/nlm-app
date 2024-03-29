export function useNoAuth() {
  const initializing = false;

  const user = {
    displayName: '',
    getIdToken: function () {
      return process.env.REACT_APP_NO_AUTH_DEFAULT_USER;
    },
  };

  return {
    user,
    initializing,
  };
}
