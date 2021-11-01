export const isDebug = process.env.MODE === 'debug';
export const isSSR = typeof window === 'undefined';
export const useSecure = process.env.USE_SECURE === 'true';
export const inProduction = process.env.NODE_ENV === 'production';
