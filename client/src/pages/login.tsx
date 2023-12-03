import { getServerSession } from "next-auth";
import LoginForm from "~/components/Login/LoginForm";
import { authOptions } from "./api/auth/[...nextauth]";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
  // const session = await getServerSession(authOptions);

  // if (session) redirect("/dashboard");

  return <LoginForm />;
}
