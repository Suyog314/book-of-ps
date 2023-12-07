import React, { useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import ReactFlow, { useNodesState, useEdgesState } from "react-flow-renderer";
import { IAnchor, INode, NodeIdsToNodesMap } from "~/types";
import { FrontendAnchorGateway } from "~/anchors";
import { loadAnchorToLinksMap } from "~/components/NodeView/NodeLinkMenu";
import "./GraphModal.scss";
import {
  refreshAnchorState,
  refreshLinkListState,
  refreshState,
} from "~/global/Atoms";
import { useRecoilState } from "recoil";

export interface IGraphModalProps {
  isOpen: boolean;
  node: INode;
  onClose: () => void;
  nodeIdsToNodesMap: NodeIdsToNodesMap;
}

export const GraphModal = (props: IGraphModalProps) => {
  const { isOpen, node, onClose, nodeIdsToNodesMap } = props;

  const [edges, setEdges] = useEdgesState([]);
  const [nodes, setNodes] = useNodesState([]);
  const [refresh] = useRecoilState(refreshState);
  const [linkMenuRefresh] = useRecoilState(refreshLinkListState);
  const [anchorRefresh] = useRecoilState(refreshAnchorState);
  /**
   * Gets nodes and edges by finding anchors and using map from anchors to links,
   * storing all links associated with a node as the edges and finding the
   * oppNode in each link item and storing those in the nodes array
   */
  const getNodesAndEdges = async () => {
    setNodes([
      {
        id: node.nodeId,
        type: "default",
        data: { label: node.title },
        position: { x: 125, y: 125 },
        selected: true,
        style: { backgroundColor: "#D7ECFF" },
      },
    ]);
    const getAnchorsResp = await FrontendAnchorGateway.getAnchorsByNodeId(
      node.nodeId
    );
    if (getAnchorsResp.success) {
      const anchors: IAnchor[] = getAnchorsResp.payload;
      const anchorIds: string[] = anchors.map((anchor) => anchor.anchorId);
      const anchorsToLinksMap = await loadAnchorToLinksMap({
        currentNode: node,
        nodeIdsToNodesMap: nodeIdsToNodesMap,
      });
      const filteredAnchorIds = anchorIds.filter((anchorId) => {
        const links = anchorsToLinksMap[anchorId].links;
        return !links.every((link) => link.oppNode.nodeId === node.nodeId);
      });
      1;
      const increment = 200;

      filteredAnchorIds.forEach((anchorId, index) => {
        const x_mod = index % 3;
        const y_mod = index % 2;
        anchorsToLinksMap[anchorId].links.forEach((link) => {
          if (link.oppNode.nodeId !== node.nodeId) {
            setEdges((prevEdges) => [
              ...prevEdges,
              {
                id: link.link.linkId,
                source: node.nodeId,
                target: link.oppNode.nodeId,
              },
            ]);
            setNodes((prevNodes) => [
              ...prevNodes,
              {
                id: link.oppNode.nodeId,
                type: "default",
                data: { label: link.oppNode.title },
                position: { x: 0 + x_mod * increment, y: 250 * y_mod },
              },
            ]);
          }
        });
      });
    } else {
      console.log(getAnchorsResp.message);
    }
  };

  useEffect(() => {
    setNodes([]);
    setEdges([]);
    getNodesAndEdges();
  }, [node, refresh, anchorRefresh, linkMenuRefresh]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Visualizing Node Collection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="modal-graph">
              <ReactFlow nodes={nodes} edges={edges} fitView={true} />
            </div>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  );
};
