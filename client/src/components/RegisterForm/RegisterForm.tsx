"use client";

import "@fontsource/montserrat";

import Link from "next/link";
import { useRouter } from "next/router";
import "./RegisterForm.scss";
import { useEffect, useState } from "react";
import { ChakraProvider, Input } from "@chakra-ui/react";
import { makeIUser } from "~/types";
import bcrypt from "bcryptjs";
import { FrontendUserGateway } from "~/users";
import { LoadingScreen } from "../LoadingScreen";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [avatar, setAvatar] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setLoading(false); // Set loading to false when the component mounts
  }, []);

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
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = makeIUser(name, email, hashedPassword, avatar);
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
    setAvatar(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"
    );
    setError("");
    // redirect to login page
    router.push("/login");
  };

  // Function to handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit();
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
        <div className="register-wrapper">
          <div className="register-box">
            <h1 className="register-header">Register</h1>
            <div className="register-form">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                onKeyDown={handleKeyPress}
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                onKeyDown={handleKeyPress}
              />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                onKeyDown={handleKeyPress}
              />
              <Input
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                placeholder="Retype Password"
                type="password"
                onKeyDown={handleKeyPress}
              />

              <button className="register-button" onClick={handleSubmit}>
                Sign Up
              </button>

              {error && <div className="register-error-message">{error}</div>}

              <div className="register-have-account-already">
                Already have an account?{" "}
                <Link href={"/login"} onClick={() => setLoading(true)}>
                  <span className="register-back-to-login">Login</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
