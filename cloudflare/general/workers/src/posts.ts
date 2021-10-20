import 'reflect-metadata';

import { nanoid } from "nanoid";
import { IsDefined, IsInt, IsString, ValidateNested } from 'class-validator';
import { plainToClass, Expose, classToPlain, Type } from 'class-transformer';
import HTTPStatus from 'http-status-codes';
import { IPost } from "./types";
import { generateResponse, handleError, IResponse, validateObj } from "./utils";
import { Request } from 'itty-router';

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

export const getPosts = async (request: Request): Promise<Response> => {
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
  let err = await validateObj(args);
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

  err = await validateObj(res, HTTPStatus.INTERNAL_SERVER_ERROR);
  if (err) {
    return err;
  }

  return generateResponse(JSON.stringify(classToPlain(res)));
}

const newPostID = (): string => new Date().toString() + nanoid();

class IAddPostResponse {
  @IsDefined()
  @IsString()
  @Expose()
  id!: string;
}

export const addPost = async (request: Request): Promise<Response> => {
  let body: Record<string, unknown>;
  try {
    body = await request.json!();
  } catch (err) {
    return handleError('no request body found', [], HTTPStatus.BAD_REQUEST);
  }
  const post = plainToClass(IPost, body);
  let err = await validateObj(post);
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
  err = await validateObj(res, HTTPStatus.INTERNAL_SERVER_ERROR);
  if (err) {
    return err;
  }

  return generateResponse(JSON.stringify(classToPlain(res)))
}
