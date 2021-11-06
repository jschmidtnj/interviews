import { IttyRequest } from './types';
import HTTPStatus from 'http-status-codes';

declare const PUBLIC_URL: string
declare const API_URL: string
declare const WORKER_URL: string
declare const MODE: string

export const inProduction = MODE === 'production'


const allowedOrigins = [PUBLIC_URL, API_URL, WORKER_URL]

export const handleCors = (
  request: IttyRequest,
  methods: string[] = ['GET', 'POST', 'PUT', 'DELETE'],
) => {
  if (request.headers.get('Origin') !== null) {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Methods': methods.join(', '),
      'Access-Control-Allow-Headers':
        'referer, origin, content-type, sentry-trace, cache-control',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    }

    const origin = request.headers.get('Origin')
    if (origin !== null && allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin
    }

    // Handle CORS pre-flight request
    return new Response(null, {
      status: HTTPStatus.NO_CONTENT,
      headers,
    })
  }

  methods = methods.concat(['HEAD, OPTIONS'])

  // Handle standard OPTIONS request
  return new Response(null, {
    status: HTTPStatus.NO_CONTENT,
    headers: {
      Allow: methods.join(', '),
    },
  })
}