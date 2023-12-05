import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { MainView } from "~/components";
import { selectedNodeState, userSessionState } from "~/global/Atoms";
import { FrontendUserGateway } from "~/users";

export default function Home() {
  const selectedNode = useRecoilValue(selectedNodeState);
  const setUserSession = useSetRecoilState(userSessionState);
  const title = `${selectedNode?.title ?? "Home"} | MyHypermedia`;

  const { data: session } = useSession();

  useEffect(() => {
    async function loadUserState() {
      if (!session?.user.email) {
        console.error("User email is empty");
        return;
      }
      const userSessionResp = await FrontendUserGateway.findUserByEmail(
        session.user.email
      );
      if (!userSessionResp.success) {
        console.error(userSessionResp.message);
        return;
      }
      setUserSession(userSessionResp.payload);
    }

    loadUserState();
  }, []);

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
