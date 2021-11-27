export const isDebug = process.env.NEXT_PUBLIC_MODE === 'debug';
export const isSSR = typeof window === 'undefined';
export const useSecure = process.env.NEXT_PUBLIC_USE_SECURE === 'true';
export const inProduction = process.env.NODE_ENV === 'production';
