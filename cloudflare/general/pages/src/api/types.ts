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

export interface IPost {
  title: string;
  username: string;
  content: string;
  media: IMedia[];
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
