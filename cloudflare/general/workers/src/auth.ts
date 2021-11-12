import { IttyRequestCookies } from './types'
import { generateResponse, useSecure } from './utils'
import { serialize } from 'cookie'
import { importSPKI, jwtVerify } from 'jose'

declare const PUBLIC_KEY: string;

export const authCookieName = 'token'
const jwtIssuer = 'PostIt Monster'
const jwtAudience = 'post-it-users'
const algorithm = 'RS256'

export const getUsername = async (
  request: IttyRequestCookies,
): Promise<string> => {
  if (!(authCookieName in request.cookies)) {
    throw new Error('no auth cookie found')
  }

  const token = request.cookies[authCookieName]

  const publicKey = await importSPKI(PUBLIC_KEY, algorithm)

  const data = await jwtVerify(token, publicKey, {
    audience: [jwtAudience],
    issuer: jwtIssuer,
    algorithms: [algorithm]
  })

  if (!data.payload.sub) {
    throw new Error('no sub found in cookie')
  }

  return data.payload.sub
}

export const logout = async (
  request: IttyRequestCookies,
): Promise<Response> => {
  const cookies = serialize(authCookieName, '', {
    path: '/',
    secure: useSecure,
    httpOnly: true,
  })
  const headers = new Headers()
  headers.set('Set-Cookie', cookies)
  return generateResponse('', request, headers)
}
