import axios, { AxiosInstance, AxiosError } from 'axios';
import { useSecure } from './mode';
import { configure } from 'axios-hooks';
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_URL,
});

export const getAPIURL = (): string => {
  return `${useSecure ? 'https' : 'http'}://${process.env.NEXT_PUBLIC_API_URL}`;
};

export let axiosClient: AxiosInstance;

export const createAxiosClient = (): void => {
  axiosClient = axios.create({
    baseURL: getAPIURL(),
  });

  axiosClient.interceptors.request.use(
    (config) => {
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
      let code: number | undefined = undefined;
      // if (error.response?.data) {
      //   const errObj = error.response.data as apiTypes['schemas']['Error'];
      //   message = errObj.message;
      //   code = errObj.code;
      // }
      if (!message) {
        message = error.message;
      }
      Sentry.withScope((scope) => {
        scope.setExtra('message', message);
        if (code !== undefined) {
          scope.setExtra('code', code);
        }
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
  // if (err.response?.data) {
  //   const errObj = err.response.data as apiTypes['schemas']['Error'];
  //   if (errObj.message) {
  //     return errObj.message;
  //   }
  // }
  return err.message;
};
