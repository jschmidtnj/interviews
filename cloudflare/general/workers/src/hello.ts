import { classToPlain } from "class-transformer"
import { IttyRequest } from "./types";
import { generateResponse, IResponse } from "./utils"

export const hello = async (request: IttyRequest): Promise<Response> => {
  const res: IResponse<unknown> = {
    data: undefined,
    errors: [],
    message: 'Hello World!'
  }
  return generateResponse(JSON.stringify(classToPlain(res)), request);
}

export const index = async (request: IttyRequest): Promise<Response> => {
  const res: IResponse<unknown> = {
    data: undefined,
    errors: [],
    message: 'Posts API'
  }
  return generateResponse(JSON.stringify(classToPlain(res)), request);
}
