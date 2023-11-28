import React from "react";
import * as ri from "react-icons/ri";
import * as ai from "react-icons/ai";
import { LuUtensils } from "react-icons/lu";

import { useRecoilState } from "recoil";
import { currentNodeState } from "~/global/Atoms";
import "./RecipeContent.scss";
import { IRecipeNode } from "~/types";

export const RecipeContent = () => {
  const [currentNode] = useRecoilState(currentNodeState);
  return (
    <div className="recipe-container">
      <div className="recipe-left">
        <div className="image-container">
          <img
            src={currentNode.content}
            alt="image"
            className="recipe-image"
          ></img>
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
      </div>
      <div className="recipe-right"></div>
    </div>
  );
};
