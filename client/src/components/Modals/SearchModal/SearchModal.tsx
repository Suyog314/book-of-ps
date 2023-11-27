import React, { useEffect, useState } from "react";
import * as ri from "react-icons/ri";

import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import { FrontendNodeGateway } from "~/nodes";
import "./SearchModal.scss";
import { SearchResultItem } from "./SearchResultItem";

export interface ISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const SearchModal = (props: ISearchModalProps) => {
  const { isOpen, onClose } = props;
  const [searchInput, setSearchInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>([]);
  const [filteredResults, setFilteredResults] = useState<any>([]);
  const [sortingOrder, setSortingOrder] = useState<string>("relevance");

  useEffect(() => {
    console.log(searchInput);
  }, [searchInput]);

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const onSearch = async () => {
    const searchResp = await FrontendNodeGateway.searchNodes(searchInput);
    if (searchResp.success) {
      setSearchResults(searchResp.payload);
      setFilteredResults(searchResp.payload);
    } else {
      console.log(searchResp.message);
      setSearchResults([]);
      setFilteredResults([]);
    }
  };

  useEffect(() => {
    console.log(searchResults);
  }, [searchResults]);

  useEffect(() => {
    onSearch();
  }, [searchInput]);

  useEffect(() => {
    console.log(searching);
  }, [searching]);

  const handleClose = () => {
    setSearchInput("");
    setSearchResults([]);
    onClose();
  };

  useEffect(() => {
    console.log(filteredResults);
  }, [filteredResults]);

  const handleFiltering = (type: string) => {
    if (type === "all") {
      setFilteredResults(searchResults);
      handleSorting(sortingOrder, searchResults);
    } else {
      const newSearchResults = searchResults.filter(
        (result: { type: string }) => {
          return result.type === type;
        }
      );
      setFilteredResults(newSearchResults);
      handleSorting(sortingOrder, newSearchResults);
    }
  };

  const handleSorting = (order: string, results = filteredResults) => {
    setSortingOrder(order);
    const newSearchResults = [...results];
    console.log(newSearchResults);

    if (order === "oldest") {
      newSearchResults.sort((a, b) => {
        const dateATime = new Date(a.dateCreated).getTime();
        const dateBTime = new Date(b.dateCreated).getTime();
        return dateATime - dateBTime;
      });
    } else if (order === "newest") {
      newSearchResults.sort((a, b) => {
        const dateATime = new Date(a.dateCreated).getTime();
        const dateBTime = new Date(b.dateCreated).getTime();
        return dateBTime - dateATime;
      });
    } else if (order === "relevance") {
      newSearchResults.sort((a, b) => {
        const scoreA = a.score;
        const scoreB = b.score;
        return scoreB - scoreA;
      });
    }
    setFilteredResults(newSearchResults);
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
                onFocus={() => setSearching(true)}
                onBlur={() => setSearching(false)}
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
                      Filter by
                    </MenuButton>

                    <MenuList>
                      <MenuItem onClick={() => handleFiltering("all")}>
                        All
                      </MenuItem>
                      <MenuItem onClick={() => handleFiltering("text")}>
                        Text
                      </MenuItem>
                      <MenuItem onClick={() => handleFiltering("image")}>
                        Image
                      </MenuItem>
                      <MenuItem onClick={() => handleFiltering("folder")}>
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
                      Sort
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => handleSorting("relevance")}>
                        Relevance
                      </MenuItem>
                      <MenuItem onClick={() => handleSorting("newest")}>
                        Created: Newest First
                      </MenuItem>
                      <MenuItem onClick={() => handleSorting("oldest")}>
                        Created: Oldest First
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </div>
                {filteredResults.map(
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
