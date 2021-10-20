import { classToPlain } from "class-transformer"
import { generateResponse, IResponse } from "./utils"

export const hello = async (_request: Request): Promise<Response> => {
  const res: IResponse<unknown> = {
    data: undefined,
    errors: [],
    message: 'Hello World!'
  }
  return generateResponse(JSON.stringify(classToPlain(res)));
}

export const index = async (_request: Request): Promise<Response> => {
  const res: IResponse<unknown> = {
    data: undefined,
    errors: [],
    message: 'Posts API'
  }
  return generateResponse(JSON.stringify(classToPlain(res)));
}
