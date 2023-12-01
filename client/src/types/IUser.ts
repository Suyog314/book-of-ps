import { v4 as uuidv4 } from "uuid";

export interface IUser {
  name: string;
  email: string;
  password: string;
  userId: string;
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
