import React, {
  useState,
  ReactNode,
  useEffect,
  FunctionComponent,
  useCallback,
} from 'react';
import { useToast } from '@chakra-ui/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { AppRoute } from 'i18n/const/app-routes';
import { useLocalStorageValue } from '@react-hookz/web';
import { getUsername, usernameKey } from 'utils/auth';

const checkAuthInterval = 2; // check every few minutes

interface PrivateRouteArgs {
  children: ReactNode;
}

const PrivateRoute: FunctionComponent<PrivateRouteArgs> = (args) => {
  const [isLoading, setLoading] = useState(true);
  const toast = useToast();
  const { formatMessage, locale } = useIntl();

  const location = useLocation();
  const history = useHistory();
  const [username, setUsername, deleteUsername] = useLocalStorageValue<string>(usernameKey);

  const getRedirect = useCallback((): string =>
    `?redirect=${encodeURIComponent(location.pathname)}`, [location.pathname]);

  const checkLoggedIn = useCallback(async (showMessage = false): Promise<boolean> => {
    const loggedoutCallback = (): boolean => {
      if (username === null) {
        deleteUsername();
        localStorage.removeItem(usernameKey);
      }
      if (showMessage) {
        toast({
          description: 'user signed out',
          status: 'info',
        });
      }
      history.push(`/${locale}` + formatMessage({ id: AppRoute.Login }) + getRedirect());
      return false;
    };
    try {
      const usernameRes = await getUsername();
      if (usernameRes === '') {
        throw new Error('not logged in');
      }
      setUsername(usernameRes);
      return true;
    } catch (_err) {
      // handle error
      return loggedoutCallback();
    }
  }, [username, history, locale, formatMessage, getRedirect, deleteUsername, toast, setUsername]);

  useEffect(() => {
    (async () => {
      // trigger check to see if user is logged in
      if (await checkLoggedIn()) {
        setLoading(false);
      }
    })();
    const checkInterval = setInterval(async () => {
      await checkLoggedIn(true);
    }, checkAuthInterval * 60 * 1000);
    return () => {
      clearInterval(checkInterval);
    };
  }, [checkLoggedIn]);

  useEffect(() => {
    if (username === null) {
      history.push(`/${locale}` + formatMessage({ id: AppRoute.Login }) + getRedirect());
    }
  }, [username, history, formatMessage, getRedirect, locale]);

  return <>{isLoading ? null : args.children}</>;
};

export default PrivateRoute;
