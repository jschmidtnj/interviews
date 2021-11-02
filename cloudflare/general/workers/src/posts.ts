import 'reflect-metadata';

import { nanoid } from "nanoid";
import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { plainToClass, Expose, classToPlain, Type } from 'class-transformer';
import HTTPStatus from 'http-status-codes';
import { IPost, IPostBase, IttyRequest } from "./types";
import { generateResponse, handleError, IResponse, validateObj } from "./utils";

declare const POSTS: KVNamespace;

class IPostRes extends IPost {
  @IsDefined()
  @IsString()
  @Expose()
  id!: string;
}

class IPostsArgs {
  @Expose()
  @Type(() => Number)
  limit: number | undefined;

  @Expose()
  @Type(() => Number)
  page: number | undefined;

  @IsString()
  @Expose()
  cursor: string | undefined;
}

class IGetPostsResponse {
  @IsDefined()
  @ValidateNested()
  @Expose()
  posts!: IPostRes[];

  @IsString()
  @Expose()
  cursor: string | undefined;
}

export const getPosts = async (request: IttyRequest): Promise<Response> => {
  let args: IPostsArgs;
  if (request.query) {
    args = plainToClass(IPostsArgs, request.query);
  } else {
    args = {
      cursor: undefined,
      limit: undefined,
      page: undefined
    }
  }
  let err = await validateObj(args, request);
  if (err) {
    return err;
  }

  const postKeys = await POSTS.list<IPost>({
    limit: args.limit,
    cursor: args.cursor
  });

  const posts: IPostRes[] = [];
  for (const key of postKeys.keys) {
    const data = await POSTS.get(key.name);
    if (!data) {
      continue;
    }
    // console.log(data)
    posts.push({
      ...plainToClass(IPost, data),
      id: key.name
    });
  }

  const res: IResponse<IGetPostsResponse> = {
    data: {
      cursor: postKeys.cursor,
      posts,
    },
    message: undefined,
    errors: []
  }

  err = await validateObj(res, request, HTTPStatus.INTERNAL_SERVER_ERROR);
  if (err) {
    return err;
  }

  // TODO - the output of posts is messed up. this might be happening in class to plain? not 100% sure

  return generateResponse(JSON.stringify(classToPlain(res)), request);
}

const newPostID = (): string => new Date().toString() + nanoid();

class IAddPostArgs extends IPostBase {
  // add post args
}

class IAddPostResponse {
  @IsDefined()
  @IsString()
  @Expose()
  id!: string;
}

export const addPost = async (request: IttyRequest): Promise<Response> => {
  let body: Record<string, unknown>;
  try {
    body = await request.json!();
  } catch (err) {
    return handleError('no request body found', request, [], HTTPStatus.BAD_REQUEST);
  }
  const post = plainToClass(IAddPostArgs, body);
  let err = await validateObj(post, request);
  if (err) {
    return err;
  }

  const postID = newPostID();
  await POSTS.put(postID, JSON.stringify(classToPlain(post)));

  const res: IResponse<IAddPostResponse> = {
    data: {
      id: postID,
    },
    message: undefined,
    errors: []
  }
  err = await validateObj(res, request, HTTPStatus.INTERNAL_SERVER_ERROR);
  if (err) {
    return err;
  }

  return generateResponse(JSON.stringify(classToPlain(res)), request)
}
