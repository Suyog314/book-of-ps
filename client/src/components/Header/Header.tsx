"use client";

import React, { useEffect, useState } from "react";

import * as ri from "react-icons/ri";
import * as ai from "react-icons/ai";

import { NodeIdsToNodesMap } from "../../types";
import Link from "next/link";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  isLinkingState,
  startAnchorState,
  selectedExtentState,
} from "../../global/Atoms";
import "./Header.scss";
import { Input, InputGroup, InputRightElement, Button } from "@chakra-ui/react";
import { Button as IButton } from "../Button";
import { signOut } from "next-auth/react";

interface IHeaderProps {
  nodeIdsToNodesMap: NodeIdsToNodesMap;
  onCreateNodeButtonClick: () => void;
  onHomeClick: () => void;
  onSearchClick: () => void;
}

export const Header = (props: IHeaderProps) => {
  const {
    onCreateNodeButtonClick,
    onHomeClick,
    nodeIdsToNodesMap,
    onSearchClick,
  } = props;
  const customButtonStyle = { height: 30, marginLeft: 10, width: 30 };
  const [isLinking, setIsLinking] = useRecoilState(isLinkingState);
  const [startAnchor, setStartAnchor] = useRecoilState(startAnchorState);
  const setSelectedExtent = useSetRecoilState(selectedExtentState);

  const handleCancelLink = () => {
    setStartAnchor(null);
    setSelectedExtent(null);
    setIsLinking(false);
  };

  const handleSearchClick = () => {
    onSearchClick();
  };

  return (
    <div className={isLinking ? "header-linking" : "header"}>
      <div className="left-bar">
        <Link href={"/dashboard"}>
          <div className="name" onClick={onHomeClick}>
            BookOf<b>P&apos;s</b>
          </div>
        </Link>
        <Link href={"/dashboard"}>
          <IButton
            isWhite={isLinking}
            style={customButtonStyle}
            icon={<ri.RiHome2Line />}
            onClick={onHomeClick}
          />
        </Link>
        <IButton
          isWhite={isLinking}
          style={customButtonStyle}
          icon={<ai.AiOutlinePlus />}
          onClick={onCreateNodeButtonClick}
        />
      </div>
      {!isLinking && (
        <div className="middle-bar">
          <Button
            leftIcon={<ri.RiSearchLine />}
            className="search-button"
            onClick={handleSearchClick}
          >
            <p className="placeholder">Search</p>
          </Button>
        </div>
      )}

      {!isLinking && (
        <div className="sign-out">
          <IButton
            text="Sign Out"
            style={{ fontWeight: "bold" }}
            onClick={() => signOut()}
          ></IButton>
        </div>
      )}

      {isLinking && startAnchor && (
        <div className="right-bar">
          <div>
            Linking from <b>{nodeIdsToNodesMap[startAnchor.nodeId].title}</b>
          </div>
          <IButton
            onClick={handleCancelLink}
            isWhite
            text="Cancel"
            style={{ fontWeight: 600, height: 30, marginLeft: 20 }}
            icon={<ri.RiCloseLine />}
          />
        </div>
      )}
    </div>
  );
};
