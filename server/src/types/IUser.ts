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
  };
  userAvatar?: string;
}

export function makeIUser(
  name: string,
  email: string,
  password: string,
  userId: string,
  userAvatar?: string
): IUser {
  return {
    name: name,
    email: email,
    password: password,
    userId: userId,
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

export function isIUser(object: any): object is IUser {
  const propsDefined: boolean =
    typeof (object as IUser).name !== "undefined" &&
    typeof (object as IUser).email !== "undefined" &&
    typeof (object as IUser).password !== "undefined" &&
    typeof (object as IUser).userId !== "undefined";
  if (!propsDefined) {
    return false;
  }
  // check if all fields have the right type
  return (
    typeof (object as IUser).name === "string" &&
    typeof (object as IUser).email === "string" &&
    typeof (object as IUser).password === "string" &&
    typeof (object as IUser).userId === "string"
  );
}
