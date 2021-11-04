import { IPost, IPostBase } from "./types";

export interface IPostRes extends IPost {
  id: string;
}

export interface IPostsArgs {
  cursor: string | undefined;
}

export interface IGetPostsResponse {
  posts: IPostRes[];
  cursor: string | undefined;
}

export interface IAddPostArgs extends IPostBase {
  // add post args
}

export interface IAddPostResponse {
  id: string;
}

export interface IUpdatePostArgs extends IPostBase {
  // update post args
}

export interface IUpdatePostResponse {
  id: string;
}

export interface IDeletePostResponse {
  id: string;
}
