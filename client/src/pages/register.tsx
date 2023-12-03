import RegisterForm from "~/components/RegisterForm/RegisterForm";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Register() {
  // useEffect(() => {
  //   const checkSession = async () => {
  //   }
  //   const session = await getServerSession(authOptions);
  // }, []);

  // if (session) redirect("/dashboard");

  return <RegisterForm />;
}
