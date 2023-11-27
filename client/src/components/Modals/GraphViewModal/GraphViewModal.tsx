import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { currentNodeState, refreshState } from "../../../global/Atoms";
import { FrontendLinkGateway } from "~/links";
import { FrontendAnchorGateway } from "~/anchors";
import { FrontendNodeGateway } from "~/nodes";
import ReactFlow, { Node, Edge } from "react-flow-renderer";
import "./GraphViewModal.scss";

export interface IGraphViewModal {
  isOpen: boolean;
  onClose: () => void;
}

export const GraphViewModal = (props: IGraphViewModal) => {
  const { isOpen, onClose } = props;
  const currentNode = useRecoilValue(currentNodeState);
  const refresh = useRecoilValue(refreshState);
  const [nodes, setNodes] = useState<Node[]>();
  const [edges, setEdges] = useState<Edge[]>();

  useEffect(() => {
    getOppNodes();
  }, [currentNode, refresh]);

  /** Gathers links and opposing nodes to current node and pareses them to pass
   * into ReactFlow
   */
  const getOppNodes = async () => {
    const anchorsRes = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    );
    if (!anchorsRes.success) {
      console.error(anchorsRes.message);
      return;
    }
    const anchors = anchorsRes.payload;
    const anchorIds: string[] = [];
    for (let i = 0; i < anchors.length; i++) {
      anchorIds.push(anchors[i].anchorId);
    }
    const linksRes = await FrontendLinkGateway.getLinksByAnchorIds(anchorIds);
    if (!linksRes.success) {
      console.error(linksRes.message);
      return;
    }
    const links = linksRes.payload;

    //get opposing nodes on other side of links
    const oppNodeIds: string[] = [];
    for (let i = 0; i < links.length; i++) {
      if (
        links[i].anchor1NodeId == currentNode.nodeId &&
        links[i].anchor2NodeId == currentNode.nodeId
      ) {
        continue;
      }
      if (links[i].anchor1NodeId == currentNode.nodeId) {
        oppNodeIds.push(links[i].anchor2NodeId);
      } else {
        oppNodeIds.push(links[i].anchor1NodeId);
      }
    }

    const oppNodesRes = await FrontendNodeGateway.getNodes(oppNodeIds);
    if (!oppNodesRes.success) {
      console.error(oppNodesRes.message);
      return;
    }
    const oppNodes = oppNodesRes.payload;

    //add current node to node list
    const flowNodes = [
      {
        id: currentNode.nodeId,
        data: { label: currentNode.title },
        position: { x: 100, y: 100 },
      },
    ];

    //add opposing nodes
    for (let i = 0; i < oppNodes.length; i++) {
      const nodeInfo = {
        id: oppNodes[i].nodeId,
        data: { label: oppNodes[i].title },
        position: { x: (i % 2) * 200, y: Math.floor(i / 2) * 200 },
      };
      flowNodes.push(nodeInfo);
    }

    const flowEdges = [];

    for (let i = 0; i < links.length; i++) {
      const oppNodeId =
        currentNode.nodeId == links[i].anchor1NodeId
          ? links[i].anchor2NodeId
          : links[i].anchor1NodeId;

      const edge = {
        id: links[i].anchor1NodeId + "-" + links[i].anchor2NodeId,
        source: currentNode.nodeId,
        target: oppNodeId,
      };
      flowEdges.push(edge);
    }

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Visualizing Node Collection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="modal-graph">
              <ReactFlow nodes={nodes} edges={edges} fitView />
            </div>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  );
};
