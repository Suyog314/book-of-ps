import {
  isINodePath,
  allNodeFields,
  NodeFields,
  nodeTypes,
  allCuisines,
} from ".";

export interface INodeProperty {
  fieldName: NodeFields;
  value: any;
}

export function makeINodeProperty(
  fieldName: NodeFields,
  newValue: any
): INodeProperty {
  return {
    fieldName: fieldName,
    value: newValue,
  };
}
export function isINodeProperty(object: any): boolean {
  const propsDefined: boolean =
    typeof (object as INodeProperty).fieldName !== "undefined" &&
    typeof (object as INodeProperty).value !== "undefined";

  if (
    propsDefined &&
    allNodeFields.includes((object as INodeProperty).fieldName)
  ) {
    switch ((object as INodeProperty).fieldName) {
      case "nodeId":
        return typeof (object as INodeProperty).value === "string";
      case "title":
        return typeof (object as INodeProperty).value === "string";
      case "type":
        return nodeTypes.includes((object as INodeProperty).value);
      case "content":
        return typeof (object as INodeProperty).value === "string";
      case "filePath":
        return isINodePath((object as INodeProperty).value);
      case "viewType":
        return typeof (object as INodeProperty).value === "string";
      case "height":
        return typeof (object as INodeProperty).value === "object";
      case "width":
        return typeof (object as INodeProperty).value === "object";
      case "descriptionID":
        return typeof (object as INodeProperty).value === "string";
      case "ingredientsID":
        return typeof (object as INodeProperty).value === "string";
      case "stepsID":
        return typeof (object as INodeProperty).value === "string";
      case "serving":
        return typeof (object as INodeProperty).value === "number";
      case "cuisine":
        return allCuisines.includes((object as INodeProperty).value);
      case "time":
        return typeof (object as INodeProperty).value === "number";
      default:
        return true;
    }
  }
}
