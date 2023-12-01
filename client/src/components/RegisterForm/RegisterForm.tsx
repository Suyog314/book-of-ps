"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import "./RegisterForm.scss";
import { ChangeEvent, FormEvent, useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password) {
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

      if (res.ok) {
        const form = e.target as HTMLFormElement;
        form.reset();
      } else {
        console.log("User registration failed.");
      }
    } catch (error) {
      console.log("Error during registration: ", error);
    }
  };

  return (
    <div className="register-wrapper">
      <h1 className="register-header">Register</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
        />
        <input
          type="text"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <input type="password" placeholder="Retype Password" />

        <button className="register-submit-button">Register</button>

        {error && <div className="register-error-message">{error}</div>}

        <Link className="register-have-account-already" href={"/login"}>
          Already have an account?{" "}
          <span className="register-back-to-login">Login</span>
        </Link>
      </form>
    </div>
  );
}
