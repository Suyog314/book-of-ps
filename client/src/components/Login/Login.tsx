"use client";

import { Input } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "../Button";
import { signIn } from "next-auth/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  // handles login and authentication
  const handleLogin = async () => {
    // errors if all fields are not filled out
    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const authRes = await signIn("credential", {
        email,
        password,
        redirect: false,
      });
      if (authRes?.error) {
        setError("Invalid credentials.");
        return;
      }

      // if login successful, set all fields to empty
      setEmail("");
      setPassword("");
      setError("");
      router.replace("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="login-wrapper">
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
        />

        <Button text="Login" onClick={handleLogin} />

        {error && <div className="login-error-message">{error}</div>}

        <Link className="login-no-account" href={"/register"}>
          Do not have an account?{" "}
          <span className="login-to-register-link">Register</span>
        </Link>
      </div>
    </div>
  );
}
