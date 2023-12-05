import React, { useCallback, useEffect, useState } from "react";
import * as ri from "react-icons/ri";
import * as ai from "react-icons/ai";
import { LuUtensils } from "react-icons/lu";

import { useRecoilState, useSetRecoilState } from "recoil";
import { currentNodeState, refreshState } from "~/global/Atoms";
import "./RecipeContent.scss";
import { INode, IRecipeNode, NodeIdsToNodesMap } from "~/types";
import convert from "convert";
import {
  Button,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
} from "@chakra-ui/react";
import Link from "next/link";

import { TextContent } from "../TextContent";
import { FrontendNodeGateway } from "~/nodes";
import { RecipeTimer } from "./RecipeTimer";
import { pathToString } from "~/global";

export interface RecipeContentProps {
  nodeIdsToNodesMap: NodeIdsToNodesMap;
}
export const RecipeContent = (props: RecipeContentProps) => {
  const { nodeIdsToNodesMap } = props;
  const [currentNode] = useRecoilState(currentNodeState);
  const [tempUnits] = useState(["celsius", "fahrenheit", "kelvin"]);
  const [volumeUnits] = useState(["ml", "l", "fl oz", "cup", "tsp"]);
  const [weightUnits] = useState(["oz", "lb", "g", "kg"]);
  const [selectedUnitType, setSelectedUnitType] = useState("Temperature");
  const [leftSelectedUnit, setLeftSelectedUnit] = useState("");
  const [rightSelectedUnit, setRightSelectedUnit] = useState("");
  const [leftUnitValue, setLeftUnitValue] = useState<number>(0);
  const [rightUnitValue, setRightUnitValue] = useState<number>(0);
  const [descriptionNode, setDescriptionNode] = useState<INode>(currentNode);
  const [ingredientsNode, setIngredientsNode] = useState<INode>(currentNode);
  const [stepsNode, setStepsNode] = useState<INode>(currentNode);
  const [refresh, setRefresh] = useRecoilState(refreshState);

  useEffect(() => {
    convertUnits();
  }, [
    selectedUnitType,
    leftSelectedUnit,
    rightSelectedUnit,
    leftUnitValue,
    rightUnitValue,
  ]);

  const loadNodes = useCallback(() => {
    const getDescriptionNode = () => {
      const desNode =
        nodeIdsToNodesMap[(currentNode as IRecipeNode).descriptionID];
      setDescriptionNode(desNode);
    };
    const getIngredientsNode = () => {
      const ingsNode =
        nodeIdsToNodesMap[(currentNode as IRecipeNode).ingredientsID];
      setIngredientsNode(ingsNode);
    };
    const getStepsNode = () => {
      const stNode = nodeIdsToNodesMap[(currentNode as IRecipeNode).stepsID];
      setStepsNode(stNode);
    };
    getDescriptionNode();
    getIngredientsNode();
    getStepsNode();
  }, [currentNode]);

  useEffect(() => {
    loadNodes();
  }, [loadNodes, currentNode, refresh]);

  const handleUnitTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    switch (event.target.value) {
      case "Temperature":
        setLeftSelectedUnit(tempUnits[0]);
        setRightSelectedUnit(tempUnits[1]);
        break;
      case "Volume":
        setLeftSelectedUnit(volumeUnits[0]);
        setRightSelectedUnit(volumeUnits[1]);
        break;
      case "Weight":
        setLeftSelectedUnit(weightUnits[0]);
        setRightSelectedUnit(weightUnits[1]);
        break;
      default:
        break;
    }
    setSelectedUnitType(event.target.value);
  };

  const handleUnitChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    input: string
  ) => {
    if (input == "left") {
      setLeftSelectedUnit(event.target.value);
    } else {
      setRightSelectedUnit(event.target.value);
    }
  };
  const convertUnits = () => {
    if (leftSelectedUnit === rightSelectedUnit) {
      setRightUnitValue(leftUnitValue);
    } else {
      const convertedValue = convert(leftUnitValue, leftSelectedUnit).to(
        rightSelectedUnit
      );
      setRightUnitValue(convertedValue);
    }
  };

  const displayUnits = () => {
    switch (selectedUnitType) {
      case "Temperature":
        return tempUnits.map((tempUnit) => (
          <option key={tempUnit}>{tempUnit}</option>
        ));
      case "Volume":
        return volumeUnits.map((volumeUnit) => (
          <option key={volumeUnit}>{volumeUnit}</option>
        ));
      case "Weight":
        return weightUnits.map((weightUnit) => (
          <option key={weightUnit}>{weightUnit}</option>
        ));
      default:
        return null;
    }
  };

  return (
    <div className="recipe-container">
      <div className="recipe-left">
        <div className="image-container">
          <img src={currentNode.content} alt="image" className="recipe-image" />
        </div>
        <div className="cooking-stats">
          <div className="serving">
            <ri.RiUserLine className="serving-icon" />
            <p className="serving-number">{`${
              (currentNode as IRecipeNode).serving
            } people`}</p>
          </div>
          <div className="time">
            <ri.RiTimerLine className="time-icon" />
            <p className="time-number">{`${
              (currentNode as IRecipeNode).time
            } min`}</p>
          </div>
          <div className="cuisine">
            <LuUtensils className="cuisine-logo" />
            <p className="cuisine-type">
              {(currentNode as IRecipeNode).cuisine}
            </p>
          </div>
        </div>
        <div className="unit-converter">
          <Select onChange={handleUnitTypeChange} variant={"filled"}>
            <option value="Volume">Volume</option>
            <option value="Weight">Weight</option>
            <option value="Temperature" selected>
              Temperature
            </option>
          </Select>
          <div className="input-section">
            <div className="left-input">
              <NumberInput
                style={{ width: "90%" }}
                defaultValue={1}
                onChange={(valueString) => {
                  setLeftUnitValue(Number(valueString));
                }}
                value={leftUnitValue}
              >
                <NumberInputField
                  onChange={(value) =>
                    setLeftUnitValue(Number(value.target.value))
                  }
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </div>
            <b>=</b>
            <div className="right-input">
              <NumberInput
                style={{ width: "90%" }}
                defaultValue={1}
                onChange={(valueString) => {
                  setRightUnitValue(Number(valueString));
                }}
                value={rightUnitValue}
              >
                <NumberInputField
                  onChange={(value) =>
                    setRightUnitValue(Number(value.target.value))
                  }
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </div>
          </div>
          <div className="unit-section">
            <div className="left-unit">
              <Select
                onChange={(event) => {
                  handleUnitChange(event, "left");
                }}
                variant={"filled"}
                value={leftSelectedUnit}
              >
                {displayUnits()}
              </Select>
            </div>
            <div className="right-unit">
              <Select
                onChange={(event) => {
                  handleUnitChange(event, "right");
                }}
                variant={"filled"}
                value={rightSelectedUnit}
              >
                {displayUnits()}
              </Select>
            </div>
          </div>
        </div>
        {/* <RecipeTimer /> */}
      </div>
      <div className="recipe-right">
        <div className="recipe-description-container">
          <b style={{ fontSize: 30 }}>Description</b>
          <Link href={`/dashboard/${descriptionNode?.nodeId}`}>
            <div className="description">
              {descriptionNode ? (
                <TextContent
                  nodeIdsToNodesMap={nodeIdsToNodesMap}
                  currentNode={descriptionNode}
                  editable={false}
                />
              ) : (
                <p>Loading description...</p>
              )}
            </div>
          </Link>
        </div>
        <div className="recipe-ingredients-container">
          <b style={{ fontSize: 30 }}>Ingredients</b>
          <Link href={`/dashboard/${ingredientsNode?.nodeId}`}>
            <div className="ingredients">
              {ingredientsNode ? (
                <TextContent
                  nodeIdsToNodesMap={nodeIdsToNodesMap}
                  currentNode={ingredientsNode}
                  editable={false}
                />
              ) : (
                <p>Loading ingredients...</p>
              )}
            </div>
          </Link>
        </div>
        <div className="recipe-steps-container">
          <b style={{ fontSize: 30 }}>Steps</b>
          <Link href={`/dashboard/${stepsNode?.nodeId}`}>
            <div className="steps">
              {stepsNode ? (
                <TextContent
                  nodeIdsToNodesMap={nodeIdsToNodesMap}
                  currentNode={stepsNode}
                  editable={false}
                />
              ) : (
                <p>Loading steps...</p>
              )}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
