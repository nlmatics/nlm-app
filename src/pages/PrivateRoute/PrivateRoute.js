import { Route } from 'react-router-dom';
import { useAuth } from '../../utils/use-auth';
import Landing from '../Landing';

export default function PrivateRoute({ children, source, ...rest }) {
  const { user } = useAuth();
  return (
    <Route
      {...rest}
      render={({ location: { pathname } }) => {
        if (user) {
          localStorage.removeItem('redirectUrl');
        }
        return user ? (
          children
        ) : (
          <Landing source={source} from={pathname !== '/' ? pathname : ''} />
          // <Redirect
          //   to={{
          //     pathname: '/login',
          //     state: { from: pathname, source },
          //   }}
          // />
        );
      }}
    />
  );
}
