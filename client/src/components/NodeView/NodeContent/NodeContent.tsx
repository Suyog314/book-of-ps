import { useRecoilValue } from "recoil";
import { currentNodeState } from "../../../global/Atoms";
import { IFolderNode, INode, NodeIdsToNodesMap } from "../../../types";
import { FolderContent } from "./FolderContent";
import { ImageContent } from "./ImageContent";
import "./NodeContent.scss";
import { TextContent } from "./TextContent";
import { RecipeContent } from "./RecipeContent/RecipeContent";

/** Props needed to render any node content */

export interface INodeContentProps {
  childNodes?: INode[];
  onCreateNodeButtonClick: () => void;
  nodeIdsToNodesMap: NodeIdsToNodesMap;
}

/**
 * This is the node content.
 *
 * @param props: INodeContentProps
 * @returns Content that any type of node renders
 */
export const NodeContent = (props: INodeContentProps) => {
  const { onCreateNodeButtonClick, childNodes, nodeIdsToNodesMap } = props;
  const currentNode = useRecoilValue(currentNodeState);
  switch (currentNode.type) {
    case "image":
      return <ImageContent />;
    case "text":
      return <TextContent nodeIdsToNodesMap={nodeIdsToNodesMap} />;
      break;
    case "recipe":
      return <RecipeContent />;
    case "folder":
      if (childNodes) {
        return (
          <FolderContent
            node={currentNode as IFolderNode}
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            childNodes={childNodes}
          />
        );
      }
  }
  return null;
};
