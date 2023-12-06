import "~/styles/globals.css";
import { RecoilRoot } from "recoil";
import { AppProps } from "next/app";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense>
      <RecoilRoot>
        <SessionProvider session={pageProps.session}>
          <Component {...pageProps} />
        </SessionProvider>
      </RecoilRoot>
    </Suspense>
  );
}
