"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import "./RegisterForm.scss";
import { ChangeEvent, FormEvent, useState } from "react";
import { Input } from "@chakra-ui/react";
import { Button } from "../Button";
import { makeIUser } from "~/types";
import bycrpt from "bcryptjs";
import { FrontendUserGateway } from "~/users";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  // handles creation of a new user
  const handleSubmit = async () => {
    // errors if all fields are not filled out
    if (!name || !email || !password || !verifyPassword) {
      setError("All fields are required.");
      return;
    }
    // errors if passwords don't match each other
    if (password != verifyPassword) {
      setError("Passwords do not match.");
      return;
    }
    // else, create new user
    const hashedPassword = await bycrpt.hash(password, 10);
    const newUser = makeIUser(name, email, hashedPassword);
    const createUserResp = await FrontendUserGateway.createUser(newUser);
    if (!createUserResp.success) {
      setError(createUserResp.message);
      return;
    }

    // clear the variables
    setName("");
    setEmail("");
    setPassword("");
    setVerifyPassword("");
    setError("");
    // redirect to login page
    router.push("/login");
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
