// export { default } from "next-auth/middleware";

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// export const config = { matcher: ["/dashboard/:path*"] };

export async function middleware(req: NextRequest) {
  const auth = req.nextUrl.clone();
  auth.pathname = "/login";
  const afterAuth = req.nextUrl.clone();
  afterAuth.pathname = "/dashboard";

  const reqPath = req.nextUrl.pathname;
  const regex = /^\/dashboard/;

  if (regex.test(reqPath)) {
    const session = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    // You could also check for any property on the session object,
    // like role === "admin" or name === "John Doe", etc.
    if (!session) return NextResponse.redirect(auth);
    // If user is authenticated, continue.
  }

  if (reqPath === "/login" || reqPath === "/register") {
    const session = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    // You could also check for any property on the session object,
    // like role === "admin" or name === "John Doe", etc.
    if (session) return NextResponse.redirect(afterAuth);
    // If user is authenticated, continue.
  }

  // Any bad paths, redirect to dashboard if logged in, else to login page
}
