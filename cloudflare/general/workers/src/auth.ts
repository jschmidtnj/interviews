import { IttyRequestCookies } from './types'
import { generateResponse, getAPIURL, handleError, IResponse, useSecure } from './utils'
import HTTPStatus from 'http-status-codes'
import { classToPlain } from 'class-transformer'
import { serialize } from 'cookie'

export const authCookieName = 'token'

export const getUsername = async (
  request: IttyRequestCookies,
): Promise<string> => {
  if (!(authCookieName in request.cookies)) {
    throw new Error('no auth cookie found');
  }

  const res = await fetch(getAPIURL() + '/verify', {
    method: 'GET',
    headers: {
      Cookie: `${authCookieName}=${request.cookies[authCookieName]}`
    }
  });
  const message = await res.text();
  if (!res.ok) {
    throw new Error(message);
  }
  return message;
}

export const verify = async (
  request: IttyRequestCookies,
): Promise<Response> => {
  let username: string
  try {
    username = await getUsername(request);
  } catch (err) {
    const errObj = err as Error;
    return handleError(
      errObj.message,
      request,
      [],
      HTTPStatus.UNAUTHORIZED,
    )
  }
  const res: IResponse<string> = {
    data: username,
    errors: [],
    message: username,
  }

  return generateResponse(JSON.stringify(classToPlain(res)), request)
}

export const logout = async (request: IttyRequestCookies): Promise<Response> => {
  const cookies = serialize(authCookieName, '', {
    path: '/',
    secure: useSecure,
    httpOnly: true,
    sameSite: useSecure ? 'strict' : 'lax'
  });
  const headers = new Headers()
  headers.set('Set-Cookie', cookies)
  return generateResponse('', request, headers)
}
