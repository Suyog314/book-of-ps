import React from "react";
import * as ri from "react-icons/ri";
import { INode, IRecipeNode } from "../../../../../types";
import "./ListView.scss";
import { ListViewItem } from "./ListViewItem";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
} from "@chakra-ui/react";
import { LuUtensils } from "react-icons/lu";

export type IViewType = "list" | "grid";

export interface IListViewProps {
  childNodes: INode[];
  onCreateNodeButtonClick: () => unknown;
}

/** Full page view focused on a node's content, with annotations and links */
export const ListView = (props: IListViewProps) => {
  const { childNodes, onCreateNodeButtonClick } = props;

  const nodes = childNodes.map(
    (childNode) =>
      childNode &&
      (childNode.type == "recipe" ? (
        <Popover key={childNode.nodeId} trigger="hover" placement="auto">
          <PopoverTrigger>
            <div>
              <ListViewItem node={childNode} />
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody>
              <div className="cuisine-section">
                <LuUtensils className="cuisine-logo" />
                <div className="recipe-text">
                  {(childNode as IRecipeNode).cuisine}
                </div>
              </div>
              <div className="serving-section">
                <ri.RiUserLine className="serving-icon" />
                <div className="recipe-text">
                  {(childNode as IRecipeNode).serving}
                </div>
              </div>
              <div className="time-section">
                <ri.RiTimerLine className="time-icon" />
                <div className="recipe-text">
                  {Math.floor((childNode as IRecipeNode).time / 60) != 0 &&
                    Math.floor((childNode as IRecipeNode).time / 60) + "hr "}
                  {(childNode as IRecipeNode).time % 60 != 0 &&
                    ((childNode as IRecipeNode).time % 60) + " min"}
                </div>
              </div>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : (
        <ListViewItem node={childNode} />
      ))
  );

  return (
    <div className={"listView-wrapper"}>
      <div className={"listView-header"}>
        <div></div>
        <div className="text">Title</div>
        <div className="text">Type</div>
        <div className="text">Date created</div>
      </div>
      {nodes}
      <div className="listView-create" onClick={onCreateNodeButtonClick}>
        <ri.RiAddFill />
        <span className="create-text">Create new node</span>
      </div>
    </div>
  );
};
