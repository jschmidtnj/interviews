import { nanoid } from 'nanoid'
import { IsDefined, IsString, ValidateNested } from 'class-validator'
import { plainToClass, Expose, classToPlain, Type } from 'class-transformer'
import HTTPStatus from 'http-status-codes'
import { IPost, IPostBase, IttyRequest } from './types'
import { generateResponse, handleError, IResponse, validateObj } from './utils'

declare const POSTS: KVNamespace

class IPostRes extends IPost {
  @IsDefined()
  @IsString()
  @Expose()
  id!: string
}

class IPostsArgs {
  @Expose()
  @Type(() => Number)
  limit: number | undefined

  @Expose()
  @Type(() => Number)
  page: number | undefined

  @IsString()
  @Expose()
  cursor: string | undefined
}

class IGetPostsResponse {
  @IsDefined()
  @ValidateNested()
  @Expose()
  posts!: IPostRes[]

  @IsString()
  @Expose()
  cursor: string | undefined
}

export const getPosts = async (request: IttyRequest): Promise<Response> => {
  console.log('get posts');

  let args: IPostsArgs
  if (request.query) {
    args = plainToClass(IPostsArgs, request.query)
  } else {
    args = {
      cursor: undefined,
      limit: undefined,
      page: undefined,
    }
  }
  let err = await validateObj(args, request)
  if (err) {
    return err
  }

  const postKeys = await POSTS.list<IPost>({
    limit: args.limit,
    cursor: args.cursor,
  })

  const posts: IPostRes[] = []
  for (const key of postKeys.keys) {
    const data = await POSTS.get(key.name)
    if (!data) {
      continue
    }
    posts.push({
      ...plainToClass(IPost, JSON.parse(data)),
      id: key.name,
    })
  }

  const res: IResponse<IGetPostsResponse> = {
    data: {
      cursor: postKeys.cursor,
      posts,
    },
    message: undefined,
    errors: [],
  }

  err = await validateObj(res, request, HTTPStatus.INTERNAL_SERVER_ERROR)
  if (err) {
    return err
  }
  console.log(res.data?.posts.length)

  return generateResponse(JSON.stringify(classToPlain(res)), request)
}

const newPostID = (): string => `${new Date().getTime()}_${nanoid()}`

class IAddPostArgs extends IPostBase {
  // add post args
}

class IAddPostResponse {
  @IsDefined()
  @IsString()
  @Expose()
  id!: string
}

export const addPost = async (request: IttyRequest): Promise<Response> => {
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
  const post = plainToClass(IAddPostArgs, body)
  let err = await validateObj(post, request)
  if (err) {
    return err
  }

  const postID = newPostID()
  await POSTS.put(postID, JSON.stringify(classToPlain(post)))

  const res: IResponse<IAddPostResponse> = {
    data: {
      id: postID,
    },
    message: undefined,
    errors: [],
  }
  err = await validateObj(res, request, HTTPStatus.INTERNAL_SERVER_ERROR)
  if (err) {
    return err
  }

  return generateResponse(JSON.stringify(classToPlain(res)), request)
}

class IUpdatePostArgs extends IPostBase {
  // update post args
}

class IUpdatePostResponse {
  @IsDefined()
  @IsString()
  @Expose()
  id!: string
}

export const updatePost = async (request: IttyRequest): Promise<Response> => {
  if (!request.params) {
    return handleError(
      'no request params found',
      request,
      [],
      HTTPStatus.BAD_REQUEST,
    )
  }

  const postID = request.params.id
  if (!postID) {
    return handleError('no post id found', request, [], HTTPStatus.BAD_REQUEST)
  }

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
  const post = plainToClass(IUpdatePostArgs, body)
  let err = await validateObj(post, request)
  if (err) {
    return err
  }

  await POSTS.put(postID, JSON.stringify(classToPlain(post)))

  const res: IResponse<IUpdatePostResponse> = {
    data: {
      id: postID,
    },
    message: undefined,
    errors: [],
  }
  err = await validateObj(res, request, HTTPStatus.INTERNAL_SERVER_ERROR)
  if (err) {
    return err
  }

  return generateResponse(JSON.stringify(classToPlain(res)), request)
}

class IDeletePostResponse {
  @IsDefined()
  @IsString()
  @Expose()
  id!: string
}

export const deletePost = async (request: IttyRequest): Promise<Response> => {
  if (!request.params) {
    return handleError(
      'no request params found',
      request,
      [],
      HTTPStatus.BAD_REQUEST,
    )
  }

  const postID = request.params.id
  if (!postID) {
    return handleError('no post id found', request, [], HTTPStatus.BAD_REQUEST)
  }
  await POSTS.delete(postID)

  const res: IResponse<IDeletePostResponse> = {
    data: {
      id: postID,
    },
    message: undefined,
    errors: [],
  }
  const err = await validateObj(res, request, HTTPStatus.INTERNAL_SERVER_ERROR)
  if (err) {
    return err
  }

  return generateResponse(JSON.stringify(classToPlain(res)), request)
}

export const getPost = async (request: IttyRequest): Promise<Response> => {
  if (!request.params) {
    return handleError(
      'no request params found',
      request,
      [],
      HTTPStatus.BAD_REQUEST,
    )
  }

  const postID = request.params.id
  if (!postID) {
    return handleError('no post id found', request, [], HTTPStatus.BAD_REQUEST)
  }

  const data = await POSTS.get(postID)
  if (!data) {
    return handleError('no post found', request, [], HTTPStatus.NOT_FOUND)
  }

  const res: IResponse<IPostRes> = {
    data: {
      ...plainToClass(IPost, JSON.parse(data)),
      id: postID,
    },
    message: undefined,
    errors: [],
  }
  const err = await validateObj(res, request, HTTPStatus.INTERNAL_SERVER_ERROR)
  if (err) {
    return err
  }

  return generateResponse(JSON.stringify(classToPlain(res)), request)
}
