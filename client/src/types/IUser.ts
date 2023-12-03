import { v4 as uuidv4 } from "uuid";

export interface IUser {
  name: string;
  email: string;
  password: string;
  userId: string;
}

export interface IUserSession {
  name: string;
  email: string;
  userId: string;
  backendTokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
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
  userId: string,
  backendTokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }
): IUserSession {
  return {
    name: name,
    email: email,
    userId: userId,
    backendTokens: backendTokens,
  };
}
