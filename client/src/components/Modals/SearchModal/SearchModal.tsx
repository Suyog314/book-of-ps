import React, { useEffect, useState } from "react";
import * as ri from "react-icons/ri";

import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
} from "@chakra-ui/react";
import { FrontendNodeGateway } from "~/nodes";
import { LuUtensils } from "react-icons/lu";
import { SearchResultItem } from "./SearchResultItem";
import "./SearchModal.scss";
import { IoPersonAddOutline } from "react-icons/io5";
import { Cuisine, INode, IRecipeNode, NodeIdsToNodesMap } from "~/types/INode";
import { isRecoilValue, useRecoilValue } from "recoil";
import { AiOutlineConsoleSql } from "react-icons/ai";
import { userSessionState } from "~/global/Atoms";

export interface ISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  availCuisines: Cuisine[];
  maxTime: number;
  maxServing: number;
  nodeIdsToNodesMap: NodeIdsToNodesMap;
}
export const SearchModal = (props: ISearchModalProps) => {
  const {
    isOpen,
    onClose,
    availCuisines,
    maxTime,
    maxServing,
    nodeIdsToNodesMap,
  } = props;

  const user = useRecoilValue(userSessionState);

  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any>([]);
  const [filterType, setFilterType] = useState("");
  const [sortType, setSortType] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [timeValue, setTimeValue] = useState(maxTime);
  const [servingValue, setServingValue] = useState(maxServing);
  const [sharingType, setSharingType] = useState("");
  const [showTimeTooltip, setShowTimeTooltip] = React.useState(false);
  const [showServingTooltip, setShowServingTooltip] = React.useState(false);

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const onSearch = async () => {
    const searchRes = await FrontendNodeGateway.searchNodes(
      searchInput,
      sortType
    );
    if (!searchRes.success) {
      console.error(searchRes.message);
      return;
    }

    let searchNodes = searchRes.payload;
    if (filterType != "") {
      searchNodes = searchNodes.filter((node) => {
        return filterType.toLowerCase() == node.type;
      });
    }

    const newSearchNodes: INode[] = [];

    searchNodes.forEach((node) => {
      //if node is a recipe, check if valid search match
      if (node.type == "recipe") {
        if (isValidSearchNode(node)) {
          newSearchNodes.push(node);
        }
      } else {
        const filepath = node.filePath.path;
        const filepathLen = node.filePath.path.length;
        //if non-recipe node is a root, don't include
        if (filepathLen == 1) {
          return;
        }
        //check if non-recipe node as a recipe node as a parent
        for (let i = filepathLen - 1; i >= 0; i--) {
          const currNode = nodeIdsToNodesMap[filepath[i]];
          if (currNode.type == "recipe" && isValidSearchNode(currNode)) {
            newSearchNodes.push(node);
          }
        }
      }
    });
    setSearchResults(newSearchNodes);
  };

  const isValidSearchNode = (node: INode): boolean => {
    let cType: boolean;

    if (cuisineType == "") {
      cType = true;
    } else {
      cType = (node as IRecipeNode).cuisine == cuisineType;
    }

    const sType =
      sharingType == "" ||
      (sharingType == "Me" && user?.userId == (node as IRecipeNode).authorId) ||
      (sharingType == "Others" &&
        user?.userId != (node as IRecipeNode).authorId);

    return (
      cType &&
      sType &&
      (node as IRecipeNode).serving <= servingValue &&
      (node as IRecipeNode).time <= timeValue
    );
  };

  useEffect(() => {
    onSearch();
  }, [
    searchInput,
    filterType,
    sortType,
    timeValue,
    servingValue,
    cuisineType,
    sharingType,
  ]);

  const handleClose = () => {
    setSearchInput("");
    setSearchResults([]);
    setFilterType("");
    setSortType("");
    setCuisineType("");
    setTimeValue(maxTime);
    setServingValue(maxServing);
    setSharingType("");
    onClose();
  };

  return (
    <Modal size={"4xl"} isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalBody style={{ padding: "0px" }}>
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                alignItems={"center"}
                display={"flex"}
                height={"100%"}
              >
                <ri.RiSearchLine />
              </InputLeftElement>
              <Input
                placeholder="Search"
                value={searchInput}
                border="0px"
                onChange={handleInputChange}
                focusBorderColor="white"
                variant={"unstyled"}
                height={"60px"}
              />
            </InputGroup>

            <div className="results">
              <div className="filters">
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ri.RiArrowDropDownLine />}
                    className="filter-button"
                  >
                    {filterType == "" ? "Filter By:" : filterType}
                  </MenuButton>

                  <MenuList className="menu-list">
                    <MenuItem onClick={() => setFilterType("")}>All</MenuItem>
                    <MenuItem onClick={() => setFilterType("Recipe")}>
                      Recipe
                    </MenuItem>
                    <MenuItem onClick={() => setFilterType("Text")}>
                      Text
                    </MenuItem>
                    <MenuItem onClick={() => setFilterType("Image")}>
                      Image
                    </MenuItem>
                    <MenuItem onClick={() => setFilterType("Folder")}>
                      Folder
                    </MenuItem>
                  </MenuList>
                </Menu>
                <Menu>
                  <MenuButton
                    as={Button}
                    leftIcon={<ri.RiArrowUpDownLine />}
                    rightIcon={<ri.RiArrowDropDownLine />}
                    className="sort-button"
                  >
                    {sortType == "" ? "Sort" : sortType}
                  </MenuButton>
                  <MenuList className="menu-list">
                    <MenuItem onClick={() => setSortType("")}>
                      Relevance
                    </MenuItem>
                    <MenuItem onClick={() => setSortType("Newest")}>
                      Created: Newest First
                    </MenuItem>
                    <MenuItem onClick={() => setSortType("Oldest")}>
                      Created: Oldest First
                    </MenuItem>
                  </MenuList>
                </Menu>
                <Menu>
                  <MenuButton
                    as={Button}
                    leftIcon={<LuUtensils />}
                    rightIcon={<ri.RiArrowDropDownLine />}
                    className="filter-button"
                  >
                    {cuisineType == "" ? "Cuisine" : cuisineType}
                  </MenuButton>

                  <MenuList className="menu-list">
                    <MenuItem onClick={() => setCuisineType("")}>All</MenuItem>
                    {availCuisines.map((cuisine, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => setCuisineType(cuisine)}
                      >
                        {cuisine}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
                <Menu>
                  <MenuButton
                    as={Button}
                    leftIcon={<IoPersonAddOutline />}
                    rightIcon={<ri.RiArrowDropDownLine />}
                    className="filter-button"
                  >
                    {sharingType == "" ? "All" : sharingType}
                  </MenuButton>

                  <MenuList className="menu-list">
                    <MenuItem onClick={() => setSharingType("")}>All</MenuItem>
                    <MenuItem onClick={() => setSharingType("Me")}>
                      Created by Me
                    </MenuItem>
                    <MenuItem onClick={() => setSharingType("Others")}>
                      Created by Others
                    </MenuItem>
                  </MenuList>
                </Menu>
                <div className="time-section">
                  <div style={{ padding: "0px 10px 0px 0px" }}>Time:</div>
                  <Slider
                    className="time-slider"
                    defaultValue={Math.ceil(maxTime / 60)}
                    min={1}
                    max={Math.ceil(maxTime / 60)}
                    colorScheme="blue"
                    onChange={(v) => setTimeValue(v * 60)}
                    onMouseEnter={() => setShowTimeTooltip(true)}
                    onMouseLeave={() => setShowTimeTooltip(false)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg="blue.500"
                      color="white"
                      placement="top"
                      isOpen={showTimeTooltip}
                      label={`≤${Math.ceil(timeValue / 60)}hr`}
                    >
                      <SliderThumb className="slider-thumb" />
                    </Tooltip>
                  </Slider>
                </div>
                <div className="serving-section">
                  <div style={{ display: "inline-block" }}>Serving Size:</div>
                  <Slider
                    className="serving-slider"
                    defaultValue={maxServing}
                    min={1}
                    max={maxServing}
                    colorScheme="blue"
                    onChange={(v) => setServingValue(v)}
                    onMouseEnter={() => setShowServingTooltip(true)}
                    onMouseLeave={() => setShowServingTooltip(false)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg="blue.500"
                      color="white"
                      placement="top"
                      isOpen={showServingTooltip}
                      label={
                        servingValue == 1
                          ? "1 person"
                          : `≤ ${servingValue} people`
                      }
                    >
                      <SliderThumb className="slider-thumb" />
                    </Tooltip>
                  </Slider>
                </div>
              </div>
              {searchResults.map(
                (
                  result: {
                    type: string;
                    title: string;
                    nodeId: string;
                    dateCreated: string;
                  },
                  index: number
                ) => (
                  <SearchResultItem
                    key={index}
                    type={result.type}
                    title={result.title}
                    nodeId={result.nodeId}
                    date={result.dateCreated}
                    onClose={handleClose}
                    cuisine={
                      (nodeIdsToNodesMap[result.nodeId] as IRecipeNode).cuisine
                    }
                    serving={
                      (nodeIdsToNodesMap[result.nodeId] as IRecipeNode).serving
                    }
                    time={
                      (nodeIdsToNodesMap[result.nodeId] as IRecipeNode).time
                    }
                  />
                )
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  );
};
