import { classToPlain, Expose, plainToClass } from "class-transformer";
import { IsDefined, IsString } from "class-validator";
import { IttyRequest, IUser } from "./types";
import { generateResponse, handleError, IResponse, validateObj } from "./utils";
import HTTPStatus from 'http-status-codes'

declare const USERS: KVNamespace

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
  token!: string
}

export const login = async (request: IttyRequest): Promise<Response> => {
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

  const currUserStr = await USERS.get(loginArgs.username);
  let userID: string;
  if (currUserStr !== null) {
    const currUserObj = plainToClass(IUser, JSON.parse(currUserStr));
    userID = currUserObj.username;
  } else {
    const user: IUser = {
      ...loginArgs
    };
    const userObj = plainToClass(IUser, user);
    err = await validateObj(userObj, request)
    if (err) {
      return err
    }

    await USERS.put(loginArgs.username, JSON.stringify(classToPlain(userObj)))
    userID = loginArgs.username;
  }

  const res: IResponse<ILoginResponse> = {
    data: {
      token: 'TODO - get token'
    },
    message: undefined,
    errors: [],
  }
  err = await validateObj(res, request, HTTPStatus.INTERNAL_SERVER_ERROR)
  if (err) {
    return err
  }

  return generateResponse(JSON.stringify(classToPlain(res)), request)
};
