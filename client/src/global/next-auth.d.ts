import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name: string;
      email: string;
      userId: string;
      backendTokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };
      userAvatar?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      name: string;
      email: string;
      userId: string;
      backendTokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };
      userAvatar?: string;
    };
  }
}
