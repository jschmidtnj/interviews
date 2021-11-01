export interface IResponse<T> {
  errors: Record<string, string>[];
  message: string | undefined;
  data: T | undefined;
}
