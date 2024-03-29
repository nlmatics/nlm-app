import { useState, useEffect, useRef } from 'react';
import API from '../utils/API.js';
import { useCookies } from 'react-cookie';
import Cookies from 'js-cookie';
import Axios from 'axios';

const clearLocalStorageTokens = () => {
  ['access_token', 'refresh_token', 'displayName'].forEach(token => {
    localStorage.removeItem(token);
  });
};

// Provider Hook that creates auth object and handles state
export function useActiveDirectoryProvideAuth() {
  let isRefreshingTokenRef = useRef(false);
  const [user, setUser] = useState(null);
  const initializing = false;
  const [cookies] = useCookies([
    'access_token',
    'refresh_token',
    'user_id',
    'first_name',
    'last_name',
  ]);
  const [interceptorsAdded, setInterceptorAdded] = useState(false);
  const requestsToBeReplayedPostRefreshingTokenRef = useRef([]);

  function addToRequestsToBeReplayedPostRefreshingToken(cb) {
    requestsToBeReplayedPostRefreshingTokenRef.current.push(cb);
  }
  //   confirmPasswordReset: (code, password) => {…}
  // initializing: false
  // sendPasswordResetEmail: email => {…}
  // signIn: (email, password) => {…}
  // signOut: () => {…}
  // signUp: (email, password) => {…}
  // user: false

  async function getAccessToken() {
    let accessToken = Cookies.get('access_token');
    if (!accessToken) {
      accessToken = window.localStorage.getItem('access_token');
    }
    //wait state here
    if (!accessToken) {
      accessToken = await refreshToken();
    }
    return accessToken;
  }
  const addCookiesToStorage = cookies => {
    window.localStorage.setItem('access_token', cookies.access_token);
    window.localStorage.setItem('refresh_token', cookies.refresh_token);
    window.localStorage.setItem(
      'displayName',
      cookies.first_name + ' ' + cookies.last_name + '#' + cookies.user_id
    );
  };

  const createUserFromStorage = () => {
    let displayName = window.localStorage.getItem('displayName');
    let existingUser = null;
    if (displayName) {
      existingUser = { displayName: displayName, signOut: signOut };
    }
    return existingUser;
  };

  const addInterceptors = () => {
    API.interceptors.request.use(
      async config => {
        console.log('accessing service', config.url);
        if (!config.url.startsWith('auth/')) {
          const access_token = await getAccessToken();
          if (access_token) {
            config.headers.Authorization = `Bearer ${access_token}`;
          }
        }
        return config;
      },
      error => {
        Promise.reject(error);
      }
    );

    API.interceptors.response.use(
      response => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
      },
      async error => {
        const status = error.response ? error.response.status : null;
        const originalRequest = error.config;
        console.debug(
          'Total requests to replay',
          requestsToBeReplayedPostRefreshingTokenRef.current.length
        );
        if (status === 401) {
          console.debug('isRefreshing', isRefreshingTokenRef.current);
          if (!isRefreshingTokenRef.current) {
            window.localStorage.removeItem('access_token');
            isRefreshingTokenRef.current = true;
            refreshToken().then(accessToken => {
              isRefreshingTokenRef.current = false;
              requestsToBeReplayedPostRefreshingTokenRef.current.forEach(
                request => request(accessToken)
              );
              requestsToBeReplayedPostRefreshingTokenRef.current = [];
            });
          }

          return new Promise(resolve => {
            addToRequestsToBeReplayedPostRefreshingToken(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(Axios.request(originalRequest));
            });
          });
        }
        // console.log("auth provider", activeDirectoryAuth);
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
      }
    );
  };

  useEffect(() => {
    if (cookies) {
      if (cookies.user_id && cookies.access_token) {
        // check for access token
        setUser({
          displayName:
            cookies.first_name +
            ' ' +
            cookies.last_name +
            '#' +
            cookies.user_id,
          signOut: signOut,
        });
        addCookiesToStorage(cookies);
      } else {
        setUser(false);
      }
    } else {
      setUser(false);
    }
  }, [cookies]);

  useEffect(() => {
    if (!interceptorsAdded) {
      addInterceptors();
      setInterceptorAdded(true);
    }
    let existingUser = createUserFromStorage();
    if (existingUser) {
      setUser(existingUser);
    }
  }, []);

  const getSignInUrl = async () => {
    try {
      await API.get(`auth/loginUrl`);
    } catch (err) {
      console.log(err);
    }
  };

  const getSignOutUrl = async () => {
    try {
      const response = await API.get(`auth/logoutUrl`);
      window.location.href = response.data;
    } catch (err) {
      console.log(err);
    }
  };

  const refreshToken = async () => {
    let refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) {
      refreshToken = window.localStorage.getItem('refresh_token');
    }
    if (refreshToken) {
      try {
        const response = await API.post(`auth/refreshToken`, {
          refresh_token: refreshToken,
        });
        console.log('refresh token is', response.data);
        window.localStorage.setItem('access_token', response.data.access_token);
        window.localStorage.setItem(
          'refresh_token',
          response.data.refresh_token
        );
        Cookies.set('refresh_token', response.data.refresh_token);
        return response.data.access_token;
      } catch (err) {
        // refresh_token expired or invalid, redirect to login page
        console.log(
          'refresh_token expired or invalid, redirect to login page',
          refreshToken
        );
        console.log(err);
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        clearLocalStorageTokens();

        const response = await API.get(`auth/loginUrl`);

        window.location.href = response.data;
      }
    } else {
      window.href = await getSignInUrl();
      return null;
    }
  };

  const signUp = () => {
    return;
  };

  const signIn = () => {
    // re-direct user
    getSignInUrl();
    return;
  };

  const signOut = () => {
    clearLocalStorageTokens();
    getSignOutUrl();
    setUser(false);
    return;
  };

  const sendPasswordResetEmail = () => {
    return;
  };

  const confirmPasswordReset = () => {
    return;
  };

  return {
    user,
    initializing,
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    confirmPasswordReset,
  };
}
