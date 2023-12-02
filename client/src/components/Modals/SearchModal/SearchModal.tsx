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
import { Cuisine, IRecipeNode } from "~/types/INode";

export interface ISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  availCuisines: Cuisine[];
  //maxTime: Date;
  maxServing: number;
}
export const SearchModal = (props: ISearchModalProps) => {
  const { isOpen, onClose, availCuisines, maxServing } = props;
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any>([]);
  const [filterType, setFilterType] = useState("");
  const [sortType, setSortType] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [timeValue, setTimeValue] = useState(1);
  const [servingValue, setServingValue] = useState(4);
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
    if (cuisineType != "") {
      searchNodes = searchNodes.filter(async (node) => {
        //if node is a recipe, check if cuisine type matches
        if (node.type == "recipe") {
          return (node as IRecipeNode).cuisine == cuisineType;
        } else {
          const filepath = node.filePath.path;
          const filepathLen = node.filePath.path.length;
          //if non-recipe node is a root, don't include
          if (filepathLen == 1) {
            return false;
          }
          //check if non-recipe node as a recipe node as a parent
          for (let i = filepathLen - 1; i >= 0; i--) {
            const nodeRes = await FrontendNodeGateway.getNode(filepath[i]);
            if (!nodeRes.success) {
              console.error("[cuisine filtering] node retrieval failed");
              return false;
            }
            const currNode = nodeRes.payload;
            return currNode.type == "recipe";
          }
          return false;
        }
      });
    }
    setSearchResults(searchNodes);
  };

  useEffect(() => {
    onSearch();
  }, [searchInput, filterType, sortType, timeValue, servingValue]);

  const handleClose = () => {
    setSearchInput("");
    setSearchResults([]);
    setFilterType("");
    setSortType("");
    setCuisineType("");
    setTimeValue(1);
    setServingValue(4);
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

            {searchResults.length > 0 && (
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

                    <MenuList>
                      <MenuItem onClick={() => setFilterType("")}>All</MenuItem>
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
                    <MenuList>
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
                      Cuisine
                    </MenuButton>

                    <MenuList>
                      <MenuItem onClick={() => setCuisineType("")}>
                        All
                      </MenuItem>
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
                  <div className="time-section">
                    <div style={{ padding: "0px 10px 0px 0px" }}>Time:</div>
                    <Slider
                      className="time-slider"
                      defaultValue={2}
                      min={1}
                      max={6}
                      colorScheme="blue"
                      onChange={(v) => setTimeValue(v)}
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
                        label={`≤${timeValue}hr`}
                      >
                        <SliderThumb />
                      </Tooltip>
                    </Slider>
                  </div>
                  <div className="serving-section">
                    <div style={{ display: "inline-block" }}>Serving Size:</div>
                    <Slider
                      className="serving-slider"
                      defaultValue={maxServing < 4 ? 1 : 4}
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
                            : `${servingValue} people`
                        }
                      >
                        <SliderThumb />
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
                    />
                  )
                )}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  );
};
