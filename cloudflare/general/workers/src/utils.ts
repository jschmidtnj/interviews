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

export const inProduction = MODE === 'production'

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
  return generateResponse(JSON.stringify(classToPlain(res)), request, code)
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
  code: number = HTTPStatus.OK,
): Response => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  const origin = request.headers.get('Origin')
  if (origin !== null && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return new Response(data, {
    status: code,
    headers,
  })
}
