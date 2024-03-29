import axios, { AxiosInstance, AxiosError } from 'axios';
import { useSecure } from './mode';
import { configure } from 'axios-hooks';
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_URL,
  integrations: [new Integrations.BrowserTracing()],

  tracesSampleRate: 1.0,
});

export const getAPIURL = (): string => {
  return `${useSecure ? 'https' : 'http'}://${process.env.REACT_APP_API_URL}`;
};

export const getAuthAPIURL = (): string => {
  return `${useSecure ? 'https' : 'http'}://${process.env.REACT_APP_AUTH_API_URL}`;
};

export let axiosClient: AxiosInstance;

export const createAxiosClient = (): void => {
  axiosClient = axios.create({
    baseURL: getAPIURL(),
  });

  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      let message = '';
      if (error.response?.data) {
        const errObj = error.response.data as IResponse<unknown>;
        message = errObj.message as string;
      }
      if (!message) {
        message = error.message;
      }
      Sentry.withScope((scope) => {
        scope.setExtra('message', message);
        Sentry.captureException(error);
      });
      return Promise.reject(error);
    }
  );

  configure({ axios: axiosClient });
};

export const getAxiosError = (err?: AxiosError): string => {
  if (!err) {
    return 'unknown error';
  }
  if (!err.response?.data) {
    return err.message;
  }
  return err.response.data as string;
};
