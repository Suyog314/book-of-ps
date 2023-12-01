"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import "./RegisterForm.scss";
import { ChangeEvent, FormEvent, useState } from "react";
import { Input } from "@chakra-ui/react";
import { Button } from "../Button";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !email || !password || !verifyPassword) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await fetch("api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!res.ok) {
        console.log("User registration failed.");
      }

      // clear the variables
      setName("");
      setEmail("");
      setPassword("");
      setVerifyPassword("");
      setError("");
    } catch (error) {
      console.log("Error during registration: ", error);
    }
  };

  return (
    <div className="register-wrapper">
      <h1 className="register-header">Register</h1>
      <div className="register-form">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
        />
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
        <Input
          value={verifyPassword}
          onChange={(e) => setVerifyPassword(e.target.value)}
          placeholder="Retype Password"
          type="password"
        />

        <Button text="Register" onClick={handleSubmit} />

        {error && <div className="register-error-message">{error}</div>}

        <Link className="register-have-account-already" href={"/login"}>
          Already have an account?{" "}
          <span className="register-back-to-login">Login</span>
        </Link>
      </div>
    </div>
  );
}
