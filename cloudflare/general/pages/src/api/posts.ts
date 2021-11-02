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
