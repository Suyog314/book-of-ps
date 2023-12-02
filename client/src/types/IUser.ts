import { v4 as uuidv4 } from "uuid";

export interface IUser {
  name: string;
  email: string;
  password: string;
  userId: string;
}

export interface IUserSession extends IUser {
  backendTokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export function makeIUser(
  name: string,
  email: string,
  password: string
): IUser {
  return {
    name: name,
    email: email,
    password: password,
    userId: uuidv4(),
  };
}

export function makeIUserSession(
  name: string,
  email: string,
  password: string,
  userId: string,
  backendTokens: {
    accessToken: string;
    refreshToken: string;
  }
): IUserSession {
  return {
    name: name,
    email: email,
    password: password,
    userId: userId,
    backendTokens: backendTokens,
  };
}
