import { classToPlain, Expose } from 'class-transformer'
import {
  ValidationError,
  validate,
  IsDefined,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator'
import HTTPStatus from 'http-status-codes'
import { IttyRequest } from './types'

declare const PUBLIC_URL: string
declare const API_URL: string
declare const WORKER_URL: string
declare const MODE: string
declare const AUTH_API_URL: string
declare const USE_SECURE: string

export const inProduction = MODE === 'production'

export const useSecure = USE_SECURE === 'true';

export const getAPIURL = (): string => {
  return AUTH_API_URL;
};

export class IResponse<T> {
  @IsDefined()
  @IsObject({ each: true })
  @Expose()
  errors!: Record<string, string>[]

  @IsString()
  @Expose()
  message: string | undefined

  @ValidateNested()
  @Expose()
  data: T | undefined
}

const validationErrorsToStr = (
  errors: ValidationError[],
): Record<string, string>[] => {
  return errors
    .map((err) => err.constraints)
    .filter((elem) => elem !== undefined) as Record<string, string>[]
}

export const handleError = <T>(
  message: string,
  request: IttyRequest,
  errors: Record<string, string>[] = [],
  code: number = HTTPStatus.INTERNAL_SERVER_ERROR,
): Response => {
  const res: IResponse<T> = {
    data: undefined,
    errors: errors,
    message: message,
  }
  return generateResponse(JSON.stringify(classToPlain(res)), request, undefined, code)
}

export const validateObj = async <T>(
  obj: object,
  request: IttyRequest,
  code: number = HTTPStatus.BAD_REQUEST,
): Promise<Response | undefined> => {
  const validationErrors = await validate(obj, {
    skipMissingProperties: true,
  })
  if (validationErrors.length > 0) {
    return handleError<T>(
      'error parsing args',
      request,
      validationErrorsToStr(validationErrors),
      code,
    )
  }
}

export const getReactionsKey = (user: string, post: string): string =>
  `${user}:${post}`

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
      status: 204,
      headers,
    })
  }

  methods = methods.concat(['HEAD, OPTIONS'])

  // Handle standard OPTIONS request
  return new Response(null, {
    headers: {
      Allow: methods.join(', '),
    },
  })
}

export const generateResponse = (
  data: string,
  request: IttyRequest,
  headers: Headers | undefined = undefined,
  code: number = HTTPStatus.OK,
): Response => {
  const newHeaders = new Headers(headers)
  newHeaders.append('Content-Type', 'application/json')
  newHeaders.append('Access-Control-Allow-Credentials', 'true')

  const origin = request.headers.get('Origin')
  if (origin !== null && allowedOrigins.includes(origin)) {
    newHeaders.append('Access-Control-Allow-Origin', origin)
  }

  return new Response(data, {
    status: code,
    headers: newHeaders,
  })
}
