import { Expose } from "class-transformer";
import { IsDefined, IsEnum, IsString, IsInt, ValidateNested } from "class-validator";

// user -> username
// reaction -> [user, post, type]
// reaction: user-post: type
// post -> reactions: [count, type]

export enum MediaType {
  image = 'image',
  video = 'video',
  link = 'link'
}

export class IMedia {
  @IsDefined()
  @IsEnum(MediaType)
  @Expose()
  type!: MediaType;

  @IsDefined()
  @IsString()
  @Expose()
  src!: string;
}

export class IReactionCount {
  @IsDefined()
  @IsString()
  @Expose()
  type!: string;

  @IsDefined()
  @IsInt()
  @Expose()
  count!: number;
}

export class IPost {
  @IsDefined()
  @IsString()
  @Expose()
  title!: string;

  @IsDefined()
  @IsString()
  @Expose()
  username!: string;

  @IsDefined()
  @IsString()
  @Expose()
  content!: string;

  @IsDefined()
  @ValidateNested()
  @Expose()
  media!: IMedia[];

  @IsDefined()
  @ValidateNested()
  @Expose()
  reactions!: IReactionCount[];

  // list of user ids
  @IsDefined()
  @IsString({each: true})
  @Expose()
  upvotes!: string[];

  // list of user ids
  @IsDefined()
  @IsString({each: true})
  @Expose()
  downvotes!: string[];
};

export class IUser {
  username!: string;
}

export class IReactions {
  @IsDefined()
  @IsString({each: true})
  @Expose()
  types!: string[];
}
