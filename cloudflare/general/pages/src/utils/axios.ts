import axios, { AxiosInstance, AxiosError } from 'axios';
import { useSecure } from './mode';
import { configure } from 'axios-hooks';
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';
import { IResponse } from 'api/utils';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_URL,
  integrations: [new Integrations.BrowserTracing()],

  tracesSampleRate: 1.0,
});

export const getAPIURL = (): string => {
  console.log(process.env)
  return `${useSecure ? 'https' : 'http'}://${process.env.REACT_APP_API_URL}`;
};

export let axiosClient: AxiosInstance;

export const createAxiosClient = (): void => {
  axiosClient = axios.create({
    baseURL: getAPIURL(),
  });

  axiosClient.interceptors.request.use(
    (config) => {
      // TODO - handle auth for api
      // if (config.baseURL === getAPIURL() && !config.headers.Authorization) {
      //   const token = getAuthToken();
      //   if (token) {
      //     config.headers.Authorization = buildAuthHeader(token);
      //   }
      // }
      return config;
    },
    (error) => Promise.reject(error)
  );

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
  if (err.response?.data) {
    const errObj = err.response.data as IResponse<unknown>;
    if (errObj.errors) {
      return errObj.errors.map(elem => Object.entries(elem).map(([key, val]) => `${key}: ${val}`).join(', ')).join(', ');
    }
  }
  return err.message;
};
