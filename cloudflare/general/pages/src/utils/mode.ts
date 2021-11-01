export const isDebug = process.env.REACT_APP_MODE === 'debug';
export const isSSR = typeof window === 'undefined';
export const useSecure = process.env.REACT_APP_USE_SECURE === 'true';
export const inProduction = process.env.NODE_ENV === 'production';
