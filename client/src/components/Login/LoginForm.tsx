"use client";

import { ChakraProvider, Input } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { LoadingScreen } from "../LoadingScreen";
import "./LoginForm.scss";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Reset loading state when component mounts
  useEffect(() => {
    setLoading(false); // Set loading to false when the component mounts
  }, []);

  // handles login and authentication
  const handleLogin = async () => {
    // errors if all fields are not filled out
    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      const authRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (authRes?.error) {
        setError("Invalid credentials.");
        setLoading(false);
        return;
      }

      // if login successful, set all fields to empty
      setEmail("");
      setPassword("");
      setError("");
      router.replace("/dashboard");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Function to handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div>
      {loading ? (
        <ChakraProvider>
          <div className="loading-screen">
            <LoadingScreen hasTimeout={true} />
          </div>
        </ChakraProvider>
      ) : (
        <div className="login-wrapper">
          <div className="login-box">
            <h1 className="login-header">Login</h1>
            <div className="login-form">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                onKeyDown={handleKeyPress}
              />

              <button className="login-button" onClick={handleLogin}>
                Login
              </button>

              {error && <div className="login-error-message">{error}</div>}

              <div className="login-no-account">
                Do not have an account?{" "}
                <Link
                  href={"/register"}
                  onClick={() => {
                    setLoading(true);
                  }}
                >
                  <span className="login-to-register-link">Register</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
