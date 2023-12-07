import {
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  NumberInput,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,
  NumberInputField,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  INode,
  NodeIdsToNodesMap,
  nodeTypes,
  RecursiveNodeTree,
  allCuisines,
  Cuisine,
  NodeType,
  makeINodeProperty,
  INodeProperty,
  makeINodePath,
} from "../../../types";

import { Button } from "../../Button";
import { TreeView } from "../../TreeView";
import "./CreateNodeModal.scss";
import { createNodeFromModal, getMeta, uploadImage } from "./createNodeUtils";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import {
  refreshState,
  selectedNodeState,
  userSessionState,
} from "../../../global/Atoms";
import { CookTimeInput } from "./CookTimeInput";
import { IngredientsInput } from "./IngredientsInput";
import { StepsInput } from "./StepsInput";
import { FrontendNodeGateway } from "~/nodes";

export interface ICreateNodeModalProps {
  isOpen: boolean;
  nodeIdsToNodesMap: NodeIdsToNodesMap;
  onClose: () => void;
  onSubmit: () => unknown;
  roots: RecursiveNodeTree[];
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CreateNodeModal = (props: ICreateNodeModalProps) => {
  // deconstruct props variables
  const { isOpen, onClose, roots, nodeIdsToNodesMap, onSubmit } = props;

  // state variables
  const setSelectedNode = useSetRecoilState(selectedNodeState);
  const [selectedParentNode, setSelectedParentNode] = useState<INode | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [serving, setServing] = useState<number>(0);
  const [ingredients, setIngredients] = useState<string[]>(["", ""]);
  const [steps, setSteps] = useState<string[]>(["", ""]);
  const [time, setTime] = useState<number>(0);
  const [cuisine, setCuisine] = useState<Cuisine>("American");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<NodeType>("" as NodeType);
  const [error, setError] = useState<string>("");
  const userSession = useRecoilValue(userSessionState);
  const [refresh, setRefresh] = useRecoilState(refreshState);

  // event handlers for the modal inputs and dropdown selects
  const handleSelectedTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedType(event.target.value.toLowerCase() as NodeType);
    setContent("");
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleImageContentChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setContent(event.target.value);
  };

  const handleTextContentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setContent(event.target.value);
  };

  const handleRecipeServingChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setServing(Number(event.target.value));
  };

  const handleRecipeTimeChange = (time: number) => {
    setTime(time);
  };

  const handleCuisineChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCuisine(event.target.value as Cuisine);
  };

  const handleDescriptionchange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.target.value);
  };

  const displayCuisines = () => {
    return allCuisines.map((cuisine) => (
      <option key={cuisine}>{cuisine}</option>
    ));
  };

  const transformContent = (array: string[], type: string) => {
    let newContent: string = "";
    array.forEach((element) => {
      newContent += `<li><p>${element}</p></li>`;
    });
    switch (type) {
      case "Ingredients":
        newContent = `<ul>${newContent}</ul>`;
        break;
      case "Steps":
        newContent = `<ol>${newContent}</ol>`;
    }
    return newContent;
  };

  // called when the "Create" button is clicked
  const handleSubmit = async () => {
    if (!nodeTypes.includes(selectedType)) {
      setError("Error: No type selected");
      return;
    }
    if (title.length === 0) {
      setError("Error: No title");
      return;
    }
    let width: number[] = [];
    let height: number[] = [];
    if (selectedType == "image") {
      const getMetaRes = await getMeta(content);
      width = [getMetaRes.normalizedWidth, getMetaRes.normalizedWidth];
      height = [getMetaRes.normalizedHeight, getMetaRes.normalizedHeight];
    }
    const authorId = userSession?.userId;
    const collaborators: string[] = [];
    const attributes = {
      content,
      nodeIdsToNodesMap,
      parentNodeId: selectedParentNode ? selectedParentNode.nodeId : null,
      title,
      type: selectedType as NodeType,
      height,
      width,
      authorId,
      collaborators,
    };

    if (selectedType == "text" || selectedType == "image") {
      if (selectedParentNode == null) {
        setError("Error: Not created within recipe node");
        return;
      }
    }

    if (selectedType == "recipe") {
      if (serving == 0) {
        setError("Error: No serving amount");
        return;
      }
      if (time == 0) {
        setError("Error: No cook time");
        return;
      }
      if (description == "") {
        setError("Error: No description");
        return;
      }
      if (steps.length == 2 && steps[0] == "" && steps[1] == "") {
        setError("Error: No cooking steps");
        return;
      }
      if (
        ingredients.length == 2 &&
        ingredients[0] == "" &&
        ingredients[1] == ""
      ) {
        setError("Error: No ingredients");
        return;
      }
      const descriptionAttributes = {
        content: description,
        nodeIdsToNodesMap,
        parentNodeId: null,
        title: `${title} Description`,
        type: "text" as NodeType,
        height,
        width,
        authorId,
        collaborators,
      };
      const descriptionNode = await createNodeFromModal(descriptionAttributes);
      console.log(descriptionNode);

      const ingredientsAttributes = {
        content: transformContent(ingredients, "Ingredients"),
        nodeIdsToNodesMap,
        parentNodeId: null,
        title: `${title} Ingredients`,
        type: "text" as NodeType,
        height,
        width,
        authorId,
        collaborators,
      };
      const ingredientsNode = await createNodeFromModal(ingredientsAttributes);
      console.log(ingredientsNode);

      const stepsAttributes = {
        content: transformContent(steps, "Steps"),
        nodeIdsToNodesMap,
        parentNodeId: null,
        title: `${title} Steps`,
        type: "text" as NodeType,
        height,
        width,
        authorId,
        collaborators,
      };
      const stepsNode = await createNodeFromModal(stepsAttributes);
      console.log(stepsNode);

      const descriptionID = descriptionNode?.nodeId;
      const ingredientsID = ingredientsNode?.nodeId;
      const stepsID = stepsNode?.nodeId;
      const recipeAttributes = {
        ...attributes,
        descriptionID,
        ingredientsID,
        stepsID,
        serving,
        cuisine,
        time,
        authorId,
        collaborators,
      };

      const recipeNode = await createNodeFromModal(recipeAttributes);
      console.log(recipeNode);
      if (recipeNode?.nodeId && descriptionID && ingredientsID && stepsID) {
        console.log("hello");

        const pathProperty: INodeProperty = makeINodeProperty(
          "filePath",
          makeINodePath(
            [recipeNode.nodeId],
            [descriptionID, ingredientsID, stepsID]
          )
        );

        await FrontendNodeGateway.updateNode(recipeNode.nodeId, [pathProperty]);

        const descriptionProperty: INodeProperty = makeINodeProperty(
          "filePath",
          makeINodePath(recipeNode.filePath.path.concat([descriptionID]))
        );

        await FrontendNodeGateway.updateNode(descriptionNode?.nodeId, [
          descriptionProperty,
        ]);

        const ingredientsProperty: INodeProperty = makeINodeProperty(
          "filePath",
          makeINodePath(recipeNode.filePath.path.concat([ingredientsID]))
        );

        await FrontendNodeGateway.updateNode(ingredientsNode?.nodeId, [
          ingredientsProperty,
        ]);

        const stepsProperty: INodeProperty = makeINodeProperty(
          "filePath",
          makeINodePath(recipeNode.filePath.path.concat([stepsID]))
        );

        await FrontendNodeGateway.updateNode(stepsNode?.nodeId, [
          stepsProperty,
        ]);
      }
      recipeNode && setSelectedNode(recipeNode);

      //add checking if statment so that they fill out all of the necessary fields
    } else {
      const node = await createNodeFromModal(attributes);
      node && setSelectedNode(node);
    }

    onSubmit();
    handleClose();
    setRefresh(!refresh);
  };

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose();
    // setTitle("");
    setSelectedParentNode(null);
    setSelectedType("" as NodeType);
    // setContent("");
    setError("");
    // setDescription("");
    // setIngredients(["", ""]);
    // setSteps(["", ""]);
    // setCuisine("American");
    // setTime(0);
    // setServing(0);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    const link = files && files[0] && (await uploadImage(files[0]));
    link && setContent(link);
  };

  // content prompts for the different node types
  let contentInputPlaceholder: string;
  switch (selectedType) {
    case "text":
      contentInputPlaceholder = "Text content...";
      break;
    case "image":
    case "recipe":
      contentInputPlaceholder = "Image URL...";
      break;
    default:
      contentInputPlaceholder = "Content...";
  }

  const isImage: boolean = selectedType === "image";
  const isText: boolean = selectedType === "text";
  const isRecipe: boolean = selectedType === "recipe";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={"4xl"}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new node</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={title}
              onChange={handleTitleChange}
              placeholder="Title..."
            />
            <div className="modal-input">
              <Select
                value={selectedType}
                onChange={handleSelectedTypeChange}
                placeholder="Select a type"
              >
                {nodeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
            {selectedType && isText && (
              <div className="modal-input">
                <Textarea
                  value={content}
                  onChange={handleTextContentChange}
                  placeholder={contentInputPlaceholder}
                />
              </div>
            )}
            {selectedType && (isImage || isRecipe) && (
              <div className="modal-input">
                <Input
                  value={content}
                  onChange={handleImageContentChange}
                  placeholder={contentInputPlaceholder}
                />
              </div>
            )}
            {selectedType && isImage && (
              <div className="modal-input">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  placeholder={contentInputPlaceholder}
                />
              </div>
            )}
            {selectedType && isRecipe && (
              <div className="modal-input">
                <div className="recipe-nontext">
                  <div className="inputs">
                    <NumberInput
                      size="md"
                      maxW={32}
                      defaultValue={4}
                      onChange={(valueString: string) => {
                        setServing(Number(valueString));
                      }}
                      value={serving}
                    >
                      <NumberInputField
                        onChange={(event) => {
                          handleRecipeServingChange(event);
                        }}
                        value={serving}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <CookTimeInput onChange={handleRecipeTimeChange} />
                    <Select
                      value={cuisine}
                      placeholder="Cuisine"
                      onChange={handleCuisineChange}
                      className="cuisine-select"
                    >
                      {displayCuisines()}
                    </Select>
                  </div>
                  <div className="recipe-type-inputs">
                    <Textarea
                      style={{ width: "90%" }}
                      value={description}
                      onChange={handleDescriptionchange}
                      placeholder={"Description..."}
                    />
                    <IngredientsInput
                      ingredients={ingredients}
                      setIngredients={setIngredients}
                    />
                    <StepsInput steps={steps} setSteps={setSteps} />
                  </div>

                  <div></div>
                </div>
                <div className="recipe-text"></div>
              </div>
            )}
            <div className="modal-section">
              <span className="modal-title">
                <div className="modal-title-header">
                  Choose a parent node (optional):
                </div>
              </span>
              <div className="modal-treeView">
                <TreeView
                  roots={roots}
                  parentNode={selectedParentNode}
                  setParentNode={setSelectedParentNode}
                  changeUrlOnClick={false}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            {error.length > 0 && <div className="modal-error">{error}</div>}
            <div className="modal-footer-buttons">
              <Button text="Create" onClick={handleSubmit} />
            </div>
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  );
};
