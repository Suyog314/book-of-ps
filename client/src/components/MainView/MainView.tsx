import { ChakraProvider } from "@chakra-ui/react";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  refreshState,
  selectedNodeState,
  selectedAnchorsState,
  selectedExtentState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  isAppLoadedState,
  rootNodesState,
  userSessionState,
} from "../../global/Atoms";
import { useRouter } from "next/router";
import { FrontendNodeGateway } from "../../nodes";
import {
  Cuisine,
  INode,
  NodeIdsToNodesMap,
  RecursiveNodeTree,
} from "../../types";
import { Alert } from "../Alert";
import { ContextMenu } from "../ContextMenu/ContextMenu";
import { Header } from "../Header";
import { LoadingScreen } from "../LoadingScreen";
import {
  CompleteLinkModal,
  CreateNodeModal,
  MoveNodeModal,
  SearchModal,
} from "../Modals";
import { NodeView } from "../NodeView";
import { TreeView } from "../TreeView";
import "./MainView.scss";
import { createNodeIdsToNodesMap, makeRootWrapper } from "./mainViewUtils";
import { GraphModal } from "../Modals/GraphModal/GraphModal";
import { ProfileModal } from "../Modals/ProfileModal";
import { ShareModal } from "../Modals/ShareModal";

export const MainView = React.memo(function MainView() {
  // app states
  const [isAppLoaded, setIsAppLoaded] = useRecoilState(isAppLoadedState);
  // modal states
  const [createNodeModalOpen, setCreateNodeModalOpen] = useState(false);
  const [completeLinkModalOpen, setCompleteLinkModalOpen] = useState(false);
  const [moveNodeModalOpen, setMoveNodeModalOpen] = useState(false);
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  // node states
  const [selectedNode, setSelectedNode] = useRecoilState(selectedNodeState);
  const [rootNodes, setRootNodes] = useRecoilState(rootNodesState);
  const refresh = useRecoilValue(refreshState);
  // anchor states
  const setSelectedAnchors = useSetRecoilState(selectedAnchorsState);
  const setSelectedExtent = useSetRecoilState(selectedExtentState);
  // alerts
  const setAlertIsOpen = useSetRecoilState(alertOpenState);
  const setAlertTitle = useSetRecoilState(alertTitleState);
  const setAlertMessage = useSetRecoilState(alertMessageState);
  const userSession = useRecoilValue(userSessionState);
  // search modal parameters
  const [availCuisines, setAvailCuisines] = useState<Cuisine[]>([]);
  const [maxTime, setMaxTime] = useState(60);
  const [maxServing, setMaxServing] = useState<number>(1);

  /** update our frontend root nodes from the database */
  const loadRootsFromDB = useCallback(async () => {
    const rootsFromDB = await FrontendNodeGateway.getRoots();
    if (rootsFromDB.success) {
      rootsFromDB.payload && setRootNodes(rootsFromDB.payload);
      setIsAppLoaded(true);
    }
  }, []);

  /**
   * Retrieves the available cuisines, longest time, and biggest serving size
   * for all current recipes to use in search modal
   */
  const getParameters = async () => {
    const cuisinesRes = await FrontendNodeGateway.getCuisines();
    if (!cuisinesRes.success) {
      console.error(cuisinesRes.message);
      return;
    }
    const sorted = cuisinesRes.payload.sort();
    setAvailCuisines(sorted);

    const timeRes = await FrontendNodeGateway.getMaxTime();
    if (!timeRes.success) {
      console.error(timeRes.message);
      return;
    }
    const minutes = timeRes.payload;
    setMaxTime(minutes);

    const servingRes = await FrontendNodeGateway.getMaxServing();
    if (!servingRes.success) {
      console.error(servingRes.message);
      return;
    }
    setMaxServing(servingRes.payload);
  };

  useEffect(() => {
    getParameters();
  }, [createNodeModalOpen]);

  useEffect(() => {
    loadRootsFromDB();
  }, [loadRootsFromDB, refresh]);

  const rootRecursiveNodeTree: RecursiveNodeTree = useMemo(
    () => makeRootWrapper(rootNodes),
    [rootNodes]
  );

  // map each nodeId to its full node object for easy access
  const nodeIdsToNodesMap: NodeIdsToNodesMap = useMemo(
    () => createNodeIdsToNodesMap(rootNodes),
    [rootNodes]
  );

  // node routing	logic
  const router = useRouter();
  const url = router.asPath;
  const lastUrlParam = url.substring(url.lastIndexOf("/") + 1);

  useEffect(() => {
    const currentNodeId = lastUrlParam;
    async function fetchNodeFromUrl() {
      const fetchResp = await FrontendNodeGateway.getNode(currentNodeId);
      if (fetchResp.success) {
        setSelectedNode(fetchResp.payload);
      }
    }
    fetchNodeFromUrl();
  }, [lastUrlParam]);

  const globalKeyHandlers = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        setSelectedAnchors([]);
        setSelectedExtent(null);
    }
  };

  // Trigger on app load
  useEffect(() => {
    document.addEventListener("keydown", globalKeyHandlers);
  }, []);

  // button handlers

  const handleGraphButtonClick = useCallback(() => {
    setGraphModalOpen(true);
  }, []);

  const handleShareModalClick = useCallback(() => {
    setShareModalOpen(true);
  }, []);

  const handleCreateNodeButtonClick = useCallback(() => {
    setCreateNodeModalOpen(true);
  }, [setCreateNodeModalOpen]);

  const handleDeleteNodeButtonClick = useCallback(
    async (node: INode) => {
      if (node) {
        const deleteResp = await FrontendNodeGateway.deleteNode(node.nodeId);
        if (!deleteResp.success) {
          setAlertIsOpen(true);
          setAlertTitle("Delete node failed");
          setAlertMessage("Delete node failed in MainView.tsx:97");
          return;
        }
        const path: string[] = node.filePath.path;
        if (path.length > 1) {
          const parentId: string = path[path.length - 2];
          const parentResp = await FrontendNodeGateway.getNode(parentId);
          if (parentResp.success) {
            setSelectedNode(parentResp.payload);
            return;
          }
        }
        setSelectedNode(null);
        loadRootsFromDB();
      }
    },
    [loadRootsFromDB]
  );

  const handleMoveNodeButtonClick = useCallback(() => {
    setMoveNodeModalOpen(true);
  }, []);

  const handleCompleteLinkClick = useCallback(() => {
    setCompleteLinkModalOpen(true);
  }, []);

  const handleProfileClick = useCallback(() => {
    setProfileModalOpen(true);
  }, []);

  const handleHomeClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const getSelectedNodeChildren = useCallback(() => {
    if (!selectedNode) return undefined;
    return selectedNode.filePath.children.map(
      (childNodeId) => nodeIdsToNodesMap[childNodeId]
    );
  }, [nodeIdsToNodesMap, selectedNode]);

  let xLast: number;
  let dragging = false;

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    xLast = e.screenX;
    document.removeEventListener("pointermove", onPointerMove);
    document.addEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (treeView.current && dragging) {
      const treeViewElement = treeView.current;
      let width = parseFloat(treeViewElement.style.width);
      const deltaX = e.screenX - xLast; // The change in the x location
      const newWidth = (width += deltaX);
      if (!(newWidth < 100 || newWidth > 480)) {
        treeViewElement.style.width = String(width) + "px";
        xLast = e.screenX;
      }
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging = false;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  };

  const treeView = useRef<HTMLHeadingElement>(null);

  return (
    <ChakraProvider>
      {!isAppLoaded ? (
        <LoadingScreen hasTimeout={true} />
      ) : (
        <div className="main-container">
          <Alert></Alert>
          <Header
            onHomeClick={handleHomeClick}
            onCreateNodeButtonClick={handleCreateNodeButtonClick}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
            onSearchClick={() => setSearchModalOpen(true)}
            onProfileClick={handleProfileClick}
            avatarSrc={`https://ui-avatars.com/api/?name=${userSession?.name}&background=random&rounded=true&bold=true&color=ffffff`}
          />
          <ProfileModal
            isOpen={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            avatarSrc={`https://ui-avatars.com/api/?name=${userSession?.name}&background=random&rounded=true&bold=true&color=ffffff`}
            userName={userSession?.name}
            userEmail={userSession?.email}
            isAppLoaded={setIsAppLoaded}
          />
          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            availCuisines={availCuisines}
            maxTime={maxTime}
            maxServing={maxServing}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
          />
          <CreateNodeModal
            isOpen={createNodeModalOpen}
            onClose={() => setCreateNodeModalOpen(false)}
            roots={rootNodes}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
            onSubmit={loadRootsFromDB}
          />
          <CompleteLinkModal
            isOpen={completeLinkModalOpen}
            onClose={() => setCompleteLinkModalOpen(false)}
            nodeIdsToNodes={nodeIdsToNodesMap}
          />
          {selectedNode && (
            <>
              <GraphModal
                isOpen={graphModalOpen}
                onClose={() => setGraphModalOpen(false)}
                node={selectedNode}
                nodeIdsToNodesMap={nodeIdsToNodesMap}
              />
              <MoveNodeModal
                isOpen={moveNodeModalOpen}
                onClose={() => setMoveNodeModalOpen(false)}
                onSubmit={loadRootsFromDB}
                node={selectedNode}
                roots={rootNodes}
              />
              <ShareModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
              />
            </>
          )}
          <div className="content">
            <div
              className="treeView-container"
              ref={treeView}
              style={{ width: 350 }}
            >
              <TreeView
                roots={rootNodes}
                parentNode={selectedNode}
                setParentNode={setSelectedNode}
              />
            </div>
            <div className="divider" onPointerDown={onPointerDown} />
            <div className="node-wrapper">
              <NodeView
                childNodes={
                  selectedNode
                    ? getSelectedNodeChildren()
                    : rootNodes.map((root) => root.node)
                }
                currentNode={selectedNode ?? rootRecursiveNodeTree.node}
                onDeleteButtonClick={handleDeleteNodeButtonClick}
                onMoveButtonClick={handleMoveNodeButtonClick}
                onGraphButtonClick={handleGraphButtonClick}
                onCompleteLinkClick={handleCompleteLinkClick}
                onCreateNodeButtonClick={handleCreateNodeButtonClick}
                onShareModalClick={handleShareModalClick}
                nodeIdsToNodesMap={nodeIdsToNodesMap}
              />
            </div>
          </div>
        </div>
      )}
      <ContextMenu />
    </ChakraProvider>
  );
});
