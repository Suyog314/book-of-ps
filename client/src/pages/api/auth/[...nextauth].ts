import { NextApiRequest, NextApiResponse } from "next";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { FrontendUserGateway } from "~/users";

async function refreshToken(token: JWT): Promise<JWT> {
  return token;
}

export const authOptions: NextAuthOptions = {
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
          console.log(authResp.message);
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

  callbacks: {
    async jwt({ token, user }) {
      // console.log({ token, user });
      if (user) return { ...token, ...user };

      return token;
    },

    async session({ token, session }) {
      session.user = token.user;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  if (method === "GET" || method === "POST") {
    try {
      await NextAuth(req, res, authOptions);
    } catch (error) {
      console.error("[NextAuth error]", error);
      res.status(500).end("An error occurred during authentication.");
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };
