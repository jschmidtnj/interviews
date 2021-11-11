import { IResponse } from "api/utils";
import { axiosClient } from "./axios";

export const usernameKey = 'username';
export const defaultLoggedInPage = '/';

export const getUsername = async (): Promise<string> => {
  try {
    const res = await axiosClient.get<IResponse<string>>('/verify', {
      withCredentials: true
    });
    if (!res.data) {
      throw new Error('no data found');
    }
    return res.data.data as string;
  } catch (_err) {
    // got error
  }
  return '';
};
