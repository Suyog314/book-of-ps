import { BookOfParticles } from "~/components/BookOfParticles";
import LoginForm from "~/components/Login/LoginForm";

export default function Login() {
  // const session = await getServerSession(authOptions);

  // if (session) redirect("/dashboard");

  return (
    <>
      <BookOfParticles />
      <LoginForm />
    </>
  );
}
