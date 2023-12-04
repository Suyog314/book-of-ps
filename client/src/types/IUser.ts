import { v4 as uuidv4 } from "uuid";

export interface IUser {
  name: string;
  email: string;
  password: string;
  userId: string;
  userAvatar?: string;
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
  userAvatar?: string;
}

export function makeIUser(
  name: string,
  email: string,
  password: string,
  userAvatar?: string
): IUser {
  return {
    name: name,
    email: email,
    password: password,
    userId: uuidv4(),
    userAvatar: userAvatar,
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
  },
  userAvatar?: string
): IUserSession {
  return {
    name: name,
    email: email,
    userId: userId,
    backendTokens: backendTokens,
    userAvatar: userAvatar,
  };
}
