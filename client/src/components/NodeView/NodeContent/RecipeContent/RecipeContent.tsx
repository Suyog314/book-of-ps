import React, { useEffect, useState } from "react";
import * as ri from "react-icons/ri";
import { LuUtensils } from "react-icons/lu";

import { useRecoilState } from "recoil";
import { currentNodeState } from "~/global/Atoms";
import "./RecipeContent.scss";
import { IRecipeNode, NodeIdsToNodesMap } from "~/types";
import convert from "convert";
import {
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

export interface RecipeContentProps {
  nodeIdsToNodesMap: NodeIdsToNodesMap;
}
export const RecipeContent = (props: RecipeContentProps) => {
  const { nodeIdsToNodesMap } = props;
  const [currentNode] = useRecoilState(currentNodeState);
  const [tempUnits] = useState(["celsius", "fahrenheit", "kelvin"]);
  const [volumeUnits] = useState(["ml", "l", "fl oz", "cup", "tsp"]);
  const [weightUnits] = useState(["oz", "lb", "g", "kg"]);
  const [selectedUnitType, setSelectedUnitType] = useState("Volume");
  const [leftSelectedUnit, setLeftSelectedUnit] = useState(volumeUnits[0]);
  const [rightSelectedUnit, setRightSelectedUnit] = useState(volumeUnits[1]);
  const [leftUnitValue, setLeftUnitValue] = useState<number>(0);
  const [rightUnitValue, setRightUnitValue] = useState<number>(0);

  const descriptionNode =
    nodeIdsToNodesMap[(currentNode as IRecipeNode).descriptionID];

  const ingredientsNode =
    nodeIdsToNodesMap[(currentNode as IRecipeNode).ingredientsID];

  const stepsNode = nodeIdsToNodesMap[(currentNode as IRecipeNode).stepsID];

  useEffect(() => {
    convertUnits();
  }, [
    leftSelectedUnit,
    rightSelectedUnit,
    leftUnitValue,
    rightUnitValue,
    selectedUnitType,
  ]);

  const convertUnits = () => {
    const convertedValue = convert(leftUnitValue, leftSelectedUnit as any).to(
      rightSelectedUnit as any
    );

    // Limit the number of decimal places to 3
    const roundedValue = parseFloat((convertedValue as any).toFixed(3));

    setRightUnitValue(roundedValue);
  };

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
            <option value="Temperature">Temperature</option>
          </Select>
          <div className="input-section">
            <div className="left-input">
              <NumberInput
                style={{ width: "90%" }}
                onChange={(valueString) => {
                  setLeftUnitValue(Number(valueString));
                }}
                value={leftUnitValue}
                precision={2}
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
              <b>{rightUnitValue}</b>
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
      </div>
      <div className="recipe-right">
        <div className="recipe-description-container">
          <b style={{ fontSize: 30 }}>Description</b>
          <Link href={`/dashboard/${descriptionNode?.nodeId}`}>
            <div className="description">
              {descriptionNode && (
                <TextContent
                  nodeIdsToNodesMap={nodeIdsToNodesMap}
                  currentNode={descriptionNode}
                  editable={false}
                />
              )}
            </div>
          </Link>
        </div>
        <div className="recipe-ingredients-container">
          <b style={{ fontSize: 30 }}>Ingredients</b>
          <Link href={`/dashboard/${ingredientsNode?.nodeId}`}>
            <div className="ingredients">
              {ingredientsNode && (
                <TextContent
                  nodeIdsToNodesMap={nodeIdsToNodesMap}
                  currentNode={ingredientsNode}
                  editable={false}
                />
              )}
            </div>
          </Link>
        </div>
        <div className="recipe-steps-container">
          <b style={{ fontSize: 30 }}>Steps</b>
          <Link href={`/dashboard/${stepsNode?.nodeId}`}>
            <div className="steps">
              {stepsNode && (
                <TextContent
                  nodeIdsToNodesMap={nodeIdsToNodesMap}
                  currentNode={stepsNode}
                  editable={false}
                />
              )}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
