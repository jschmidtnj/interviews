import { IttyRequestCookies } from './types'
import { generateResponse, useSecure } from './utils'
import { serialize } from 'cookie'
import { decodeJWT } from 'jwt-parse'

export const authCookieName = 'token'
const jwtIssuer = 'PostIt Monster'
const jwtAudience = 'post-it-users'

export const getUsername = async (
  request: IttyRequestCookies,
): Promise<string> => {
  if (!(authCookieName in request.cookies)) {
    throw new Error('no auth cookie found')
  }

  const token = request.cookies[authCookieName]
  const data = decodeJWT(token)

  if (data.payload.iss !== jwtIssuer || !data.payload.aud.includes(jwtAudience)) {
    throw new Error('invalid jwt')
  }

  return data.payload.sub as string
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
