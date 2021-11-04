import { handleError } from './utils'
import HTTPStatus from 'http-status-codes'
import { IttyRequest } from './types'

export const validateLoggedIn = (
  request: IttyRequest,
): Response | undefined => {
  const loggedIn = false
  if (!loggedIn) {
    return handleError(
      'user not logged in',
      request,
      [],
      HTTPStatus.UNAUTHORIZED,
    )
  }
}

export const getUserID = (_request: IttyRequest): string => {
  // TODO - get user id
  return 'user_id'
}
