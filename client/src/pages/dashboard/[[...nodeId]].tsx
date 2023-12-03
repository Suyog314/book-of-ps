import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { MainView } from "~/components";
import { selectedNodeState, userSessionState } from "~/global/Atoms";

export default function Home() {
  const selectedNode = useRecoilValue(selectedNodeState);
  const setUserSession = useSetRecoilState(userSessionState);
  const title = `${selectedNode?.title ?? "Home"} | MyHypermedia`;

  const { data: session } = useSession();
  setUserSession(session);

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <MainView />
      </div>
    </>
  );
}
