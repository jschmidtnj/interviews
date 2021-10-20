import { handleError } from "./utils";
import HTTPStatus from 'http-status-codes';
import { Request } from 'itty-router';

export const validateLoggedIn = (_request: Request): (Response | undefined) => {
  const loggedIn = false;
  if (!loggedIn) {
    return handleError('user not logged in', [], HTTPStatus.UNAUTHORIZED);
  }
}

export const getUserID = (_request: Request): string => {
  // TODO - get user id
  return 'user_id';
}
