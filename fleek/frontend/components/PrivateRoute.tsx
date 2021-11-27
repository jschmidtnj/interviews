import React, {
  useState,
  ReactNode,
  useEffect,
  FunctionComponent,
  useCallback,
} from 'react';
import { useToast } from '@chakra-ui/react';
import { useLocalStorageValue } from '@react-hookz/web';
import { getUsername, usernameKey } from 'utils/auth';
import { useRouter } from 'next/router';

const checkAuthInterval = 2; // check every few minutes

interface PrivateRouteArgs {
  children: ReactNode;
}

const PrivateRoute: FunctionComponent<PrivateRouteArgs> = (args) => {
  const [isLoading, setLoading] = useState(true);
  const toast = useToast();

  const router = useRouter();
  const [username, setUsername, deleteUsername] = useLocalStorageValue<string>(usernameKey);

  const getRedirect = useCallback((): string =>
    `?redirect=${encodeURIComponent(router.asPath)}`, [router.asPath]);

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
      router.push('/login' + getRedirect());
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
  }, [username, router, getRedirect, deleteUsername, toast, setUsername]);

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
      setLoading(true);
      router.push('/login' + getRedirect());
    }
  }, [username, router, getRedirect]);

  return <>{isLoading ? null : args.children}</>;
};

export default PrivateRoute;
