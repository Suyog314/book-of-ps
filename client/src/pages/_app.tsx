import "~/styles/globals.css";
import { RecoilRoot } from "recoil";
import { AppProps } from "next/app";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Login from "~/components/Login/Login";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense>
      <RecoilRoot>
        <Component {...pageProps} />
      </RecoilRoot>
    </Suspense>
  );
}
