import { classToPlain, Expose, plainToClass } from "class-transformer";
import { IsDefined, IsString } from "class-validator";
import { IttyRequest } from "./types";
import { generateResponse, getAPIURL, handleError, IResponse, useSecure, validateObj } from "./utils";
import HTTPStatus from 'http-status-codes'
import { parse } from 'set-cookie-parser'
import { serialize, CookieSerializeOptions } from 'cookie'
import { authCookieName } from "./auth";

class ILoginArgs {
  @IsDefined()
  @IsString()
  @Expose()
  username!: string
}

class ILoginResponse {
  @IsDefined()
  @IsString()
  @Expose()
  publicKey!: string
}

export const login = async (request: IttyRequest): Promise<Response> => {
  console.log('handle login request')
  let body: Record<string, unknown>
  try {
    body = await request.json!()
  } catch (err) {
    return handleError(
      'no request body found',
      request,
      [],
      HTTPStatus.BAD_REQUEST,
    )
  }

  const loginArgs = plainToClass(ILoginArgs, body);
  let err = await validateObj(loginArgs, request)
  if (err) {
    return err
  }

  console.log('get from api', getAPIURL() + `/auth/${loginArgs.username}`)
  const authRes = await fetch(getAPIURL() + `/auth/${loginArgs.username}`, {
    method: 'GET',
  })
  const authMessage = await authRes.text()
  if (!authRes.ok) {
    return handleError(authMessage, request, [], HTTPStatus.UNAUTHORIZED)
  }
  const headers = new Headers()
  const cookiesStr = authRes.headers.get('set-cookie')
  if (!cookiesStr) {
    return handleError('cannot find cookie', request, [], HTTPStatus.INTERNAL_SERVER_ERROR)
  }
  const cookies = parse(cookiesStr)
  const authCookie = cookies.find(c => c.name === authCookieName)
  if (!authCookie) {
    return handleError('cannot find auth cookie', request, [], HTTPStatus.NOT_FOUND)
  }
  authCookie.secure = useSecure

  headers.set('set-cookie', serialize(authCookie.name, authCookie.value, authCookie as CookieSerializeOptions))

  const res: IResponse<ILoginResponse> = {
    data: {
      publicKey: authMessage
    },
    message: undefined,
    errors: [],
  }
  err = await validateObj(res, request, HTTPStatus.INTERNAL_SERVER_ERROR)
  if (err) {
    return err
  }

  return generateResponse(JSON.stringify(classToPlain(res)), request, headers)
};
