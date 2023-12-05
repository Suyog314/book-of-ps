import {
  INode,
  makeIFolderNode,
  makeINode,
  NodeIdsToNodesMap,
} from "../../types";
import { traverseTree, RecursiveNodeTree } from "../../types/RecursiveNodeTree";

export const createNodeIdsToNodesMap = (rootNodes: any) => {
  const result: NodeIdsToNodesMap = {};
  for (const root of rootNodes) {
    traverseTree(root, (tree) => {
      result[tree.node.nodeId] = tree.node;
    });
  }
  return result;
};

export const makeRootWrapper = (rootNodes: any) => {
  const rootRecursiveNodeTree: RecursiveNodeTree = {
    addChild: () => null,
    children: rootNodes,
    node: makeIFolderNode(
      "root",
      [],
      [],
      "folder",
      "MyHypermedia Dashboard",
      "",
      "grid"
    ),
  };
  return rootRecursiveNodeTree;
};

export const emptyNode: INode = makeINode("", []);

export const generateBackground = (name: string) => {
  let hash = 0;
  let i;

  for (i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  // name.charCodeAt() return an int between 0 and 65535
  // left shift (<<)  operator moves to left by number of specified
  // bites after <<. The whole for loop will create a color hash
  // based on username length
  let color = "";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};
