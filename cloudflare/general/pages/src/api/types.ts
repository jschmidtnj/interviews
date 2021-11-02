export enum MediaType {
  image = 'image',
  video = 'video',
  link = 'link'
}

export interface IMedia {
  type: MediaType;
  src: string;
}

export interface IReactionCount {
  type: string;
  count: number;
}

export interface IPostBase {
  title: string;
  content: string;
  media: IMedia[];
}

export interface IPost extends IPostBase {
  username: string;
  reactions: IReactionCount[];
  upvotes: string[];
  downvotes: string[];
};

export interface IUser {
  username: string;
}

export interface IReactions {
  types: string[];
}
