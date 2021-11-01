import { classToPlain, Expose } from "class-transformer";
import { ValidationError, validate, IsDefined, IsObject, IsString, ValidateNested } from "class-validator";
import HTTPStatus from 'http-status-codes';

export class IResponse<T> {
  @IsDefined()
  @IsObject({each: true})
  @Expose()
  errors!: Record<string, string>[];

  @IsString()
  @Expose()
  message: string | undefined;

  @ValidateNested()
  @Expose()
  data: T | undefined;
}

const validationErrorsToStr = (errors: ValidationError[]): Record<string, string>[] => {
  return errors.map(err => err.constraints).filter(elem => elem !== undefined) as Record<string, string>[];
}

export const handleError = <T>(message: string, errors: Record<string, string>[] = [],
                            code: number = HTTPStatus.INTERNAL_SERVER_ERROR): Response => {
  const res: IResponse<T> = {
    data: undefined,
    errors: errors,
    message: message
  };
  return generateResponse(JSON.stringify(classToPlain(res)), code);
}

export const validateObj = async <T>(obj: object, code: number = HTTPStatus.BAD_REQUEST): Promise<Response | undefined> => {
  const validationErrors = await validate(obj, {
    skipMissingProperties: true
  });
  if (validationErrors.length > 0) {
    return handleError<T>('error parsing args', validationErrorsToStr(validationErrors), code);
  }
}

export const getReactionsKey = (user: string, post: string): string => `${user}:${post}`

export const generateResponse = (data: string, code: number = HTTPStatus.OK): Response => {
  // TODO - specify origin
  return new Response(data, {
    status: code,
    headers: {
      'Access-Control-Allow-Origin': `${process.env.REACT_APP_PUBLIC_URL},${process.env.REACT_APP_API_URL}`,
      'Content-Type': 'application/json'
    }
  })
}
