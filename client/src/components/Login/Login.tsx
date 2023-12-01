import Link from "next/link";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();

  return (
    <div className="login-wrapper">
      <h1 className="login-header">Login</h1>
      <form className="login-form">
        <input type="text" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button className="login-button">Login</button>

        <div className="login-error-message">Error Message</div>

        <Link className="login-register-link" href={"/register"}>
          Don&apos;t have an account?{" "}
          <span className="login-register-link-register">Register</span>
        </Link>
      </form>
    </div>
  );
}
