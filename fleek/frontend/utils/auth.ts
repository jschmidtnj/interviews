import { axiosClient, getAuthAPIURL } from "./axios";

export const usernameKey = 'username';
export const defaultLoggedInPage = '/';

export const getUsername = async (): Promise<string> => {
  try {
    const res = await axiosClient.get<string>('/verify', {
      withCredentials: true,
      baseURL: getAuthAPIURL(),
      responseType: 'text'
    });
    if (!res.data) {
      throw new Error('no data found');
    }
    return res.data;
  } catch (_err) {
    // got error
  }
  return '';
};
