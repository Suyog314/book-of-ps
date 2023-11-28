import React, { useEffect, useState } from "react";
import * as ri from "react-icons/ri";
import * as ai from "react-icons/ai";
import { LuUtensils } from "react-icons/lu";

import { useRecoilState } from "recoil";
import { currentNodeState } from "~/global/Atoms";
import "./RecipeContent.scss";
import { IRecipeNode } from "~/types";
import convert from "convert";
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
} from "@chakra-ui/react";

export const RecipeContent = () => {
  const [currentNode] = useRecoilState(currentNodeState);
  const [tempUnits] = useState(["celsius", "fahrenheit", "kelvin"]);
  const [volumeUnits] = useState(["ml", "l", "fl oz", "cup"]);
  const [weightUnits] = useState(["oz", "lb", "g", "kg"]);
  const [selectedUnitType, setSelectedUnitType] = useState("Temperature");
  useEffect(() => {
    console.log((currentNode as IRecipeNode).description.content);
    console.log(convert(2, "ml").to("l"));
    console.log(selectedUnitType);
  }, [selectedUnitType]);

  const handleUnitTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedUnitType(event.target.value);
  };

  const displayUnits = () => {
    console.log("displayUnits");
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
              <NumberInput style={{ width: "90%" }} defaultValue={1}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </div>
            <b>=</b>
            <div className="right-input">
              <NumberInput style={{ width: "90%" }} defaultValue={15}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </div>
          </div>
          <div className="unit-section">
            <div className="left-unit">
              <Select variant={"filled"}>{displayUnits()}</Select>
            </div>
            <div className="right-unit">
              <Select variant={"filled"}>{displayUnits()}</Select>
            </div>
          </div>
        </div>
      </div>
      <div className="recipe-right">
        <div className="recipe-description-container">
          <b style={{ fontSize: 30 }}>Description</b>
          <div>{(currentNode as IRecipeNode).description.content}</div>
        </div>
        <div className="recipe-ingredients-container"></div>
      </div>
    </div>
  );
};
