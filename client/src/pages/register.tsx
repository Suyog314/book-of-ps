import RegisterForm from "~/components/RegisterForm/RegisterForm";

export default function Register() {
  // useEffect(() => {
  //   const checkSession = async () => {
  //   }
  //   const session = await getServerSession(authOptions);
  // }, []);

  // if (session) redirect("/dashboard");

  return <RegisterForm />;
}
