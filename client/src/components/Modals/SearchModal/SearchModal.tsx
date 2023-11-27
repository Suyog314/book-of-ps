import {
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalContent,
  ModalOverlay,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";
import * as ai from "react-icons/ai";
import * as ri from "react-icons/ri";
import { useEffect, useState } from "react";
import { SearchIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { FrontendNodeGateway } from "~/nodes";
import { INode } from "~/types";
import "./SearchModal.scss";

export interface ISearchModal {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal = (props: ISearchModal) => {
  const { isOpen, onClose } = props;
  const [searchQ, setSearchQ] = useState("");
  const [searchNodes, setSearchNodes] = useState<INode[]>([]);
  const [filterType, setFilterType] = useState("");
  const [sortType, setSortType] = useState("");

  useEffect(() => {
    getSearchNodes();
  }, [searchQ, filterType, sortType]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchQ = event.target.value;
    setSearchQ(searchQ);
  };

  const getSearchNodes = async () => {
    const searchRes = await FrontendNodeGateway.searchForNodes(
      searchQ,
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
    console.log(searchNodes);
    setSearchNodes(searchNodes);
  };

  /**
   * Takes a date and parses it into a desired format (DD/MM/YY)
   * @param nodeDate
   * @returns string of parsed date
   */
  const parseDateString = (nodeDate: Date) => {
    const date = new Date(nodeDate);
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const formattedDate = `${month}/${day}/${year}`;

    return formattedDate;
  };

  const handleClose = () => {
    onClose();
    setSearchQ("");
    setSearchNodes([]);
    setFilterType("");
    setSortType("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      motionPreset="slideInBottom"
      size="3xl"
    >
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent top={100}>
          <InputGroup size="lg">
            <InputLeftElement
              height="100%"
              display="flex"
              alignItems="center"
              pl="3"
              color="gray.500"
            >
              <SearchIcon />
            </InputLeftElement>
            <Input
              placeholder="Search..."
              variant="unstyled"
              focusBorderColor="white"
              height="70px"
              onChange={handleSearchChange}
            />
          </InputGroup>
          <div className="filter-sort-container">
            <Menu autoSelect={false}>
              <MenuButton
                className="menu-button"
                as={Button}
                rightIcon={<ChevronDownIcon />}
              >
                {filterType == "" ? "Filter" : filterType}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setFilterType("")}>
                  <ai.AiOutlineStop style={{ margin: "0px 6px 0px 0px" }} />
                  <span>None</span>
                </MenuItem>
                <MenuItem onClick={() => setFilterType("Text")}>
                  <ri.RiStickyNoteLine style={{ margin: "0px 6px 0px 0px" }} />
                  <span>Text</span>
                </MenuItem>
                <MenuItem onClick={() => setFilterType("Image")}>
                  <ri.RiImageLine style={{ margin: "0px 6px 0px 0px" }} />
                  <span>Image</span>
                </MenuItem>
                <MenuItem onClick={() => setFilterType("Folder")}>
                  <ri.RiFolderLine style={{ margin: "0px 6px 0px 0px" }} />
                  <span>Folder</span>
                </MenuItem>
              </MenuList>
            </Menu>
            <Menu autoSelect={false}>
              <MenuButton
                className="menu-button"
                as={Button}
                rightIcon={<ChevronDownIcon />}
              >
                {sortType == "" ? "Sort" : sortType}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setSortType("")}>
                  <ai.AiOutlineStop style={{ margin: "0px 6px 0px 0px" }} />
                  <span>None</span>
                </MenuItem>
                <MenuItem onClick={() => setSortType("Date Created")}>
                  <ri.RiSortDesc style={{ margin: "0px 6px 0px 0px" }} />
                  <span>Sort by Date Created</span>
                </MenuItem>
              </MenuList>
            </Menu>
          </div>

          <div className="search-results-container">
            {searchNodes.map((node, index) => (
              <div key={index} onClick={handleClose}>
                <Link href={"/" + node.nodeId}>
                  <div className="search-result">
                    <div className="node-title">{node.title}</div>
                    <div className="node-type-date-container">
                      <div className="node-type">{"type: " + node.type}</div>
                      <div className="node-date">
                        {node.dateCreated
                          ? parseDateString(node.dateCreated)
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </ModalContent>
      </div>
    </Modal>
  );
};
