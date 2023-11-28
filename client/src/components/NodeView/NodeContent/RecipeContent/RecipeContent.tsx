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
  const [selectedUnitType, setSelectedUnitType] = useState("");
  useEffect(() => {
    console.log((currentNode as IRecipeNode).description.content);
    console.log(convert(1, "kelvin").to("fahrenheit"));
    console.log(selectedUnitType);
  }, [selectedUnitType]);

  const handleUnitTypeChange = () => {};
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
