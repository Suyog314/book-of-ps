"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import "./RegisterForm.scss";
import { useState } from "react";
import { Input } from "@chakra-ui/react";
import { Button } from "../Button";
import { makeIUser } from "~/types";
import bcrypt from "bcryptjs";
import { FrontendUserGateway } from "~/users";
import { uploadImage } from "../Modals/CreateNodeModal/createNodeUtils";
import { ImgUpload } from "../ImgUpload";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [avatar, setAvatar] = useState(
    "https://inroomplus.com/cdn/shop/products/18494__86327_grande.jpg?v=1663690876"
  );
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
      "https://inroomplus.com/cdn/shop/products/18494__86327_grande.jpg?v=1663690876"
    );
    setError("");
    // redirect to login page
    router.push("/login");
  };

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const link = files && files[0] && (await uploadImage(files[0]));
    link && setAvatar(link);
  };

  // Function to handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="register-wrapper">
      <h1 className="register-header">Register</h1>
      <div className="register-form">
        <ImgUpload onChange={handleImgUpload} src={avatar} />

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
          onKeyDown={handleKeyPress}
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
