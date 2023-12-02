import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { FrontendUserGateway } from "~/users";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        // make sure valid credentials passed in
        if (!email || !password) {
          console.error("[authorize] no email or password provided");
          return null;
        }

        try {
          const authResp = await FrontendUserGateway.authenticateUser(
            email,
            password
          );
          if (!authResp.success) {
            return null;
          }
          return authResp.payload as any;
        } catch (error) {
          console.error("[authenticate] ", error);
        }
      },
    }),
  ],
  // session: {
  //   strategy: "jwt",
  // },
  // secret: process.env.NEXTAUTH_SECRET,
  // pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
