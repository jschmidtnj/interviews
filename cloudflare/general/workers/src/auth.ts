import { IttyRequestCookies } from './types'
import { generateResponse, getAPIURL, useSecure } from './utils'
import { serialize } from 'cookie'

export const authCookieName = 'token'

export const getUsername = async (
  request: IttyRequestCookies,
): Promise<string> => {
  if (!(authCookieName in request.cookies)) {
    throw new Error('no auth cookie found')
  }

  const res = await fetch(getAPIURL() + '/verify', {
    method: 'GET',
    headers: {
      Cookie: `${authCookieName}=${request.cookies[authCookieName]}`,
    },
  })
  const message = await res.text()
  if (!res.ok) {
    throw new Error(message)
  }
  return message
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
