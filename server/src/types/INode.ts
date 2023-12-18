import { isSameFilePath } from ".";
import INodePath, { makeINodePath } from "./INodePath";

// nodeTypes returns a string array of the types available
export const nodeTypes: string[] = ["text", "image", "folder", "recipe"];

// Supported nodeTypes for file browser
export type NodeType =
  | "text"
  | "image"
  | "folder"
  | "pdf"
  | "audio"
  | "video"
  | "recipe";

// type representing valid cuisines in our applicaiton
export type Cuisine =
  | "American"
  | "Italian"
  | "Spanish"
  | "Chinese"
  | "Korean"
  | "Japanese"
  | "French"
  | "Mexican"
  | "Japanese"
  | "Vietnamese"
  | "Thai"
  | "Greek"
  | "British";

/**
 * // TODO [Editable]: Since we want to store new metadata for images we should add
 * new metadata fields to our INode object. There are different ways you can do this.
 *
 * 1. One would be creating a new interface that extends INode.
 * You can have a look at IFolderNode to see how it is done.
 * 2. Another would be to add optional metadata to the INode object itself.
 */

// INode with node metadata
export interface INode {
  type: NodeType; // type of node that is created
  content: any; // the content of the node
  filePath: INodePath; // unique randomly generated ID which contains the type as a prefix
  nodeId: string; // unique randomly generated ID which contains the type as a prefix
  title: string; // user create node title
  dateCreated?: Date; // date that the node was created
  height?: number[];
  width?: number[];
  authorId?: string; // UUID for each author
  collaborators?: string[];
}
export interface IRecipeNode extends INode {
  descriptionID: string;
  ingredientsID: string; // a list of ingredients to make the recipe
  stepsID: string; // list of nodes detailing the steps for the recipe (text/image)
  serving: number; // number of people the recipe serves
  cuisine: Cuisine; // the cuisine that the recipe falls into
  time: number; // the amount of time the recipe takes to complete
}
export type FolderContentType = "list" | "grid";

export interface IFolderNode extends INode {
  viewType: FolderContentType;
}

export type NodeFields = keyof INode | keyof IFolderNode | keyof IRecipeNode;

export const allNodeFields: string[] = [
  "nodeId",
  "title",
  "type",
  "content",
  "filePath",
  "viewType",
  "height",
  "width",
  "descriptionID",
  "ingredientsID",
  "stepsID",
  "serving",
  "cuisine",
  "time",
  "authorId",
  "collaborators",
];

export const allCuisines: string[] = [
  "American",
  "Italian",
  "Spanish",
  "Chinese",
  "Korean",
  "Japanese",
  "French",
  "Mexican",
  "Japanese",
  "Vietnamese",
  "Thai",
  "Greek",
  "British",
];

// Type declaration for map from nodeId --> INode
export type NodeIdsToNodesMap = { [nodeId: string]: INode };

/**
 * Function that creates an INode given relevant inputs
 * @param nodeId
 * @param path
 * @param children
 * @param type
 * @param title
 * @param content
 * @param height
 * @param width
 * @returns INode object
 */

export function makeINode(
  nodeId: any,
  path: any,
  children?: any,
  type?: any,
  title?: any,
  content?: any,
  height?: any,
  width?: any,
  authorId?: any,
  collaborators?: any
): INode {
  return {
    content: content ?? "content" + nodeId,
    filePath: makeINodePath(path, children),
    nodeId: nodeId,
    title: title ?? "node" + nodeId,
    type: type ?? "text",
    height: height ?? [],
    width: width ?? [],
    authorId: authorId,
    collaborators: collaborators,
  };
}

export function makeIRecipeNode(
  nodeId: any,
  path: any,
  description: any,
  ingredients: any,
  steps: any,
  serving: any,
  cuisine: any,
  time: any,
  authorId?: any,
  children?: any,
  type?: any,
  title?: any,
  content?: any,
  height?: any,
  width?: any,
  collaborators?: any
): IRecipeNode {
  return {
    content: content ?? "content" + nodeId,
    filePath: makeINodePath(path, children),
    nodeId: nodeId,
    title: title ?? "node" + nodeId,
    type: type ?? "text",
    height: height ?? [],
    width: width ?? [],
    descriptionID: description,
    ingredientsID: ingredients,
    stepsID: steps,
    serving: serving,
    cuisine: cuisine,
    time: time,
    authorId: authorId,
    collaborators: collaborators,
  };
}

export function makeIFolderNode(
  nodeId: any,
  path: any,
  children?: any,
  type?: any,
  title?: any,
  content?: any,
  viewType?: any,
  height?: any,
  width?: any
): IFolderNode {
  return {
    content: content ?? "content" + nodeId,
    filePath: makeINodePath(path, children),
    nodeId: nodeId,
    title: title ?? "node" + nodeId,
    type: type ?? "text",
    viewType: viewType ?? "grid",
    height: height ?? [],
    width: width ?? [],
  };
}

export function isINode(object: any): object is INode {
  const propsDefined: boolean =
    typeof (object as INode).nodeId !== "undefined" &&
    typeof (object as INode).title !== "undefined" &&
    typeof (object as INode).type !== "undefined" &&
    typeof (object as INode).content !== "undefined" &&
    typeof (object as INode).filePath !== "undefined";
  const filePath: INodePath = object.filePath;
  // if both are defined
  if (filePath && propsDefined) {
    for (let i = 0; i < filePath.path.length; i++) {
      if (typeof filePath.path[i] !== "string") {
        return false;
      }
    }
    // check if all fields have the right type
    // and verify if filePath.path is properly defined
    return (
      typeof (object as INode).nodeId === "string" &&
      typeof (object as INode).title === "string" &&
      nodeTypes.includes((object as INode).type) &&
      typeof (object as INode).content === "string" &&
      filePath.path.length > 0 &&
      filePath.path[filePath.path.length - 1] === (object as INode).nodeId
    );
  }
}

export function isSameNode(n1: INode, n2: INode): boolean {
  return (
    n1.nodeId === n2.nodeId &&
    n1.title === n2.title &&
    n1.type === n2.type &&
    n1.content === n2.content &&
    isSameFilePath(n1.filePath, n2.filePath)
  );
}
