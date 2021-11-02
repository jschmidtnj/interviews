import { generateResponse, getReactionsKey, handleError, IResponse, validateObj } from "./utils";
import HTTPStatus from 'http-status-codes';
import { Expose, plainToClass, classToPlain } from "class-transformer";
import { IsDefined, IsString, IsEnum } from "class-validator";
import { validateLoggedIn, getUserID } from "./auth";
import { IPost, IReactions, IttyRequest } from "./types";

declare const REACTIONS: KVNamespace;
declare const POSTS: KVNamespace;


class IUserPostReactionsArgs {
  @IsDefined()
  @IsString()
  @Expose()
  post!: string;
}

export const getUserPostReactions = async (request: IttyRequest): Promise<Response> => {
  validateLoggedIn(request);
  const userID = getUserID(request);
  if (!request.query) {
    return handleError('no request query provided', request, [], HTTPStatus.BAD_REQUEST);
  }
  const args = plainToClass(IUserPostReactionsArgs, request.query);
  let err = await validateObj(args, request);
  if (err) {
    return err;
  }

  const reactionsID = getReactionsKey(userID, args.post);
  const reactionsStr = await REACTIONS.get(reactionsID)
  if (!reactionsStr) {
    return handleError(`cannot find reactions with id ${reactionsID}`, request, [], HTTPStatus.NOT_FOUND);
  }
  const reactions = plainToClass(IReactions, reactionsStr);

  const res: IResponse<IReactions> = {
    data: reactions,
    errors: [],
    message: ''
  }

  return generateResponse(JSON.stringify(classToPlain(res)), request);
}




export const validateReaction = (reaction: string, request: IttyRequest): (Response | undefined) => {
  if (reaction.length > 0) {
    return handleError('invalid reaction provided', request, [], HTTPStatus.BAD_REQUEST);
  }
}

class IReactArgs {
  @IsDefined()
  @IsString()
  @Expose()
  post!: string;

  @IsDefined()
  @IsString()
  @Expose()
  reaction!: string;
}

export enum ReactAction {
  added = 'added',
  removed = 'removed'
}

class IReactResponse {
  @IsDefined()
  @IsString()
  @Expose()
  user!: string;

  @IsDefined()
  @IsString()
  @Expose()
  reaction!: string;

  @IsDefined()
  @IsEnum(ReactAction)
  @Expose()
  action!: ReactAction
}

export const react = async (request: IttyRequest): Promise<Response> => {
  validateLoggedIn(request);
  const userID = getUserID(request);
  let body: Record<string, unknown>;
  try {
    body = await request.json!();
  } catch (err) {
    return handleError('no request body found', request, [], HTTPStatus.BAD_REQUEST);
  }
  const args = plainToClass(IReactArgs, body);
  let err = await validateObj(args, request);
  if (err) {
    return err;
  }
  err = validateReaction(args.reaction, request);
  if (err) {
    return err;
  }

  const postRes = await POSTS.get(args.post);
  if (!postRes) {
    return handleError(`no post found with id ${args.post}`, request, [], HTTPStatus.NOT_FOUND);
  }
  const postObj = plainToClass(IPost, postRes);

  const postReaction = postObj.reactions.find(reaction => reaction.type === args.reaction);

  const reactionID = getReactionsKey(userID, args.post);
  let action: ReactAction;
  if (!postReaction) {
    // add to reaction
    postObj.reactions.push({
      count: 1,
      type: args.reaction
    });
    const reaction: IReactions = {
      types: [args.reaction]
    };
    action = ReactAction.added;
    await REACTIONS.put(reactionID, JSON.stringify(classToPlain(reaction)));
  } else {
    // reaction exists in post already
    const reactionStr = await REACTIONS.get(reactionID);
    if (!reactionStr) {
      postReaction.count++;
      action = ReactAction.added;
    } else {
      postReaction.count--;
      action = ReactAction.removed;
      const reactions = plainToClass(IReactions, reactionStr);
      reactions.types = reactions.types.filter(curr => curr === args.reaction);
      if (reactions.types.length === 0) {
        await REACTIONS.delete(reactionID);
      } else {
        await REACTIONS.put(reactionID, JSON.stringify(classToPlain(reactions)));
      }
      await POSTS.put(args.post, JSON.stringify(classToPlain(postObj)));
    }
  }

  const res: IResponse<IReactResponse> = {
    data: {
      action,
      user: userID,
      reaction: args.reaction
    },
    errors: [],
    message: ''
  };

  err = await validateObj(res, request, HTTPStatus.INTERNAL_SERVER_ERROR);
  if (err) {
    return err;
  }

  return generateResponse(JSON.stringify(classToPlain(res)), request);
}
