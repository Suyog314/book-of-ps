import React, { useEffect, useState } from "react";
import { IAnchor, ILink, INode, NodeIdsToNodesMap } from "../../../types";
import { AnchorItem, LinkItem } from "./AnchorItem";
import "./NodeLinkMenu.scss";
import { includesAnchorId, loadAnchorToLinksMap } from "./nodeLinkMenuUtils";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  refreshState,
  selectedAnchorsState,
  currentNodeState,
  refreshAnchorState,
  refreshLinkListState,
} from "../../../global/Atoms";

export interface INodeLinkMenuProps {
  nodeIdsToNodesMap: NodeIdsToNodesMap;
}

export const NodeLinkMenu = (props: INodeLinkMenuProps) => {
  const { nodeIdsToNodesMap } = props;
  const currentNode = useRecoilValue(currentNodeState);
  const refresh = useRecoilValue(refreshState);
  const selectedAnchors = useRecoilValue(selectedAnchorsState);
  const [anchorsMap, setAnchorsMap] = useState<{
    [anchorId: string]: {
      anchor: IAnchor;
      links: { link: ILink; oppNode: INode; oppAnchor: IAnchor }[];
    };
  }>({});
  const [anchorRefresh] = useRecoilState(refreshAnchorState);
  const [linkMenuRefresh] = useRecoilState(refreshLinkListState);

  useEffect(() => {
    const fetchLinks = async (currentNode: INode) => {
      console.log(currentNode);
      setAnchorsMap(await loadAnchorToLinksMap({ ...props, currentNode }));
    };
    fetchLinks(currentNode);
  }, [currentNode, refresh, selectedAnchors, anchorRefresh, linkMenuRefresh]);

  const loadMenu = () => {
    const anchorItems: JSX.Element[] = [];

    if (anchorsMap) {
      for (const anchorId in anchorsMap) {
        if (Object.prototype.hasOwnProperty.call(anchorsMap, anchorId)) {
          const isAnchorSelected: boolean = includesAnchorId(
            anchorId,
            selectedAnchors
          );
          const extent = anchorsMap[anchorId].anchor.extent;
          const anchorLinks = anchorsMap[anchorId].links;
          const linkItems: JSX.Element[] = [];
          for (let i = 0; i < anchorLinks.length; i++) {
            const anchorLink: {
              link: ILink;
              oppNode: INode;
              oppAnchor: IAnchor;
            } = anchorLinks[i];

            linkItems.push(
              <LinkItem
                key={anchorLink.link.linkId}
                link={anchorLink.link}
                anchorLink={anchorLink}
                nodeIdsToNodesMap={nodeIdsToNodesMap}
              />
            );
          }
          anchorItems.push(
            <AnchorItem
              linkItems={linkItems}
              anchorsMap={anchorsMap}
              key={anchorId}
              anchorId={anchorId}
              extent={extent}
              isAnchorSelected={isAnchorSelected}
            />
          );
        }
      }
    }

    return anchorItems;
  };

  return <div className="linkMenu">{loadMenu()}</div>;
};
