export interface IReactArgs {
  post: string;
  reaction: string;
}

export enum ReactAction {
  added = 'added',
  removed = 'removed'
}

export interface IReactResponse {
  user: string;
  reaction: string;
  action: ReactAction
}
