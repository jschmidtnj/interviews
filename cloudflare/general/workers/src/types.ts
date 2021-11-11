import { Expose } from 'class-transformer'
import {
  IsDefined,
  IsEnum,
  IsString,
  IsInt,
  ValidateNested,
} from 'class-validator'

import { Request as IRequest } from 'itty-router'
export type IttyRequest = IRequest & Request
export type IttyRequestCookies = IttyRequest & {
  cookies: { [key: string]: string }
}

// user -> username
// reaction -> [user, post, type]
// reaction: user-post: type
// post -> reactions: [count, type]

export enum MediaType {
  image = 'image',
  video = 'video',
  link = 'link',
}

export class IMedia {
  @IsDefined()
  @IsEnum(MediaType)
  @Expose()
  type!: MediaType

  @IsDefined()
  @IsString()
  @Expose()
  src!: string
}

export class IReactionCount {
  @IsDefined()
  @IsString()
  @Expose()
  type!: string

  @IsDefined()
  @IsInt()
  @Expose()
  count!: number
}

export class IPostBase {
  @IsDefined()
  @IsString()
  @Expose()
  title!: string

  @IsDefined()
  @IsString()
  @Expose()
  content!: string

  @IsDefined()
  @ValidateNested()
  @Expose()
  media!: IMedia[]
}

export class IPost extends IPostBase {
  @IsDefined()
  @IsString()
  @Expose()
  username!: string

  @IsDefined()
  @ValidateNested()
  @Expose()
  reactions!: IReactionCount[]

  // list of user ids
  @IsDefined()
  @IsString({ each: true })
  @Expose()
  upvotes!: string[]

  // list of user ids
  @IsDefined()
  @IsString({ each: true })
  @Expose()
  downvotes!: string[]
}

export class IReactions {
  @IsDefined()
  @IsString({ each: true })
  @Expose()
  types!: string[]
}
