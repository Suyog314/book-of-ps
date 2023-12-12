import { Select } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import * as bi from "react-icons/bi";
import * as ri from "react-icons/ri";
import { IoPersonAddOutline } from "react-icons/io5";
import { FrontendNodeGateway } from "../../../nodes";
import {
  IFolderNode,
  INode,
  INodeProperty,
  makeINodeProperty,
} from "../../../types";
import { Button } from "../../Button";
import { ContextMenuItems } from "../../ContextMenu";
import { EditableText } from "../../EditableText";
import "./NodeHeader.scss";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  selectedNodeState,
  isLinkingState,
  refreshState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
  currentNodeState,
  userSessionState,
  currentNodeCollabsState,
} from "../../../global/Atoms";
import { FrontendUserGateway } from "~/users";

interface INodeHeaderProps {
  onHandleCompleteLinkClick: () => void;
  onHandleStartLinkClick: () => void;
  onGraphButtonClick: () => void;
  onDeleteButtonClick: (node: INode) => void;
  onMoveButtonClick: (node: INode) => void;
  onShareModalClick: () => void;
  homeView: string;
  setHomeView: (type: string) => void;
}

export const NodeHeader = (props: INodeHeaderProps) => {
  const {
    onDeleteButtonClick,
    onMoveButtonClick,
    onGraphButtonClick,
    onHandleStartLinkClick,
    onHandleCompleteLinkClick,
    onShareModalClick,
    homeView,
    setHomeView,
  } = props;
  const currentNode = useRecoilValue(currentNodeState);
  const [refresh, setRefresh] = useRecoilState(refreshState);
  const isLinking = useRecoilValue(isLinkingState);
  const [selectedNode, setSelectedNode] = useRecoilState(selectedNodeState);
  const [title, setTitle] = useState(currentNode.title);
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const setAlertIsOpen = useSetRecoilState(alertOpenState);
  const setAlertTitle = useSetRecoilState(alertTitleState);
  const setAlertMessage = useSetRecoilState(alertMessageState);
  const userSession = useRecoilValue(userSessionState);
  const currentNodeCollabs = useRecoilValue(currentNodeCollabsState);
  const [collabIcons, setCollabIcons] = useState<string[]>([]);

  /* Method to update the current folder view */
  const handleUpdateFolderView = async (e: React.ChangeEvent) => {
    if (currentNode.nodeId == "root") {
      if (homeView == "grid") {
        setHomeView("list");
      } else {
        setHomeView("grid");
      }
      return;
    }
    const nodeProperty: INodeProperty = makeINodeProperty(
      "viewType",
      (e.currentTarget as any).value as any
    );
    const updateViewResp = await FrontendNodeGateway.updateNode(
      currentNode.nodeId,
      [nodeProperty]
    );
    if (updateViewResp.success) {
      setSelectedNode(updateViewResp.payload);
    } else {
      setAlertIsOpen(true);
      setAlertTitle("View not updated");
      setAlertMessage(updateViewResp.message);
    }
  };

  /* Method to update the node title */
  const handleUpdateTitle = async (title: string) => {
    setTitle(title);
    const nodeProperty: INodeProperty = makeINodeProperty("title", title);
    const titleUpdateResp = await FrontendNodeGateway.updateNode(
      currentNode.nodeId,
      [nodeProperty]
    );

    if (!titleUpdateResp.success) {
      setAlertIsOpen(true);
      setAlertTitle("Title update failed");
      setAlertMessage(titleUpdateResp.message);
    }
    setRefresh(!refresh);
  };

  /* Method called on title right click */
  const handleTitleRightClick = () => {
    ContextMenuItems.splice(0, ContextMenuItems.length);
    const menuItem: JSX.Element = (
      <div
        key={"titleRename"}
        className="contextMenuItem"
        onClick={() => {
          ContextMenuItems.splice(0, ContextMenuItems.length);
          setEditingTitle(true);
        }}
      >
        <div className="itemTitle">Rename</div>
        <div className="itemShortcut">ctrl + shift + R</div>
      </div>
    );
    ContextMenuItems.push(menuItem);
  };

  const getCollaborators = async () => {
    // store list of names of collaborators here, with the author's name being first
    // max size shown is 5
    const collaborators: string[] = [];
    if (!currentNode.authorId) {
      console.error("Current node has not author.");
      return;
    }
    // get author's name from db
    const authorResp = await FrontendUserGateway.findUserById(
      currentNode.authorId
    );
    if (!authorResp.success) {
      console.error(authorResp.message);
      return;
    }
    collaborators.push(
      `https://ui-avatars.com/api/?name=${authorResp.payload.name}&background=random&rounded=true&bold=true&color=ffffff`
    );
    // get a most 4 other other collaborators
    if (!currentNodeCollabs) {
      // no collaborators
      return;
    }
    const top4Collabs = currentNodeCollabs.slice(0, 4);
    const collabsResp = await FrontendUserGateway.findUsersByEmail(top4Collabs);
    if (!collabsResp.success) {
      console.error(collabsResp.message);
      return;
    }
    collabsResp.payload.forEach((user) => {
      collaborators.push(
        `https://ui-avatars.com/api/?name=${user.name}&background=random&rounded=true&bold=true&color=ffffff`
      );
    });
    setCollabIcons(collaborators);
  };

  /* useEffect which updates the title and editing state when the node is changed */
  useEffect(() => {
    setTitle(currentNode.title);
    setEditingTitle(false);
  }, [currentNode]);

  // useEffect to get all collaborators
  useEffect(() => {
    async function getCollabs() {
      await getCollaborators();
    }
    getCollabs();
  }, [currentNodeCollabs]);

  /* Node key handlers*/
  const nodeKeyHandlers = (e: KeyboardEvent) => {
    // key handlers with no modifiers
    switch (e.key) {
      case "Enter":
        if (editingTitle == true) {
          e.preventDefault();
          setEditingTitle(false);
        }
        break;
      case "Escape":
        if (editingTitle == true) {
          e.preventDefault();
          setEditingTitle(false);
        }
        break;
    }

    // ctrl + shift key events
    if (e.shiftKey && e.ctrlKey) {
      switch (e.key) {
        case "R":
          e.preventDefault();
          setEditingTitle(true);
          break;
      }
    }
  };

  /* Trigger on node load or when editingTitle changes */
  useEffect(() => {
    document.addEventListener("keydown", nodeKeyHandlers);
  }, [editingTitle]);

  const isFolder: boolean = currentNode.type === "folder";
  const isRoot: boolean = currentNode.nodeId === "root";

  return (
    <div className="nodeHeader">
      <div
        className="nodeHeader-title"
        onDoubleClick={() => setEditingTitle(true)}
        onContextMenu={handleTitleRightClick}
      >
        <EditableText
          text={title}
          editing={editingTitle}
          setEditing={setEditingTitle}
          onEdit={handleUpdateTitle}
        />
      </div>
      <div className="nodeHeader-buttonBar">
        {!isRoot && (
          <>
            <Button
              icon={<ri.RiDeleteBin6Line />}
              text="Delete"
              onClick={() => onDeleteButtonClick(currentNode)}
            />
            <Button
              icon={<ri.RiDragDropLine />}
              text="Move"
              onClick={() => onMoveButtonClick(currentNode)}
            />
            {!isLinking && (
              <Button
                icon={<ri.RiExternalLinkLine />}
                text="Start Link"
                onClick={onHandleStartLinkClick}
              />
            )}
            {isLinking && (
              <Button
                text="Complete Link"
                icon={<bi.BiLinkAlt />}
                onClick={onHandleCompleteLinkClick}
              />
            )}
            <Button
              icon={<bi.BiLogoGraphql />}
              text="Graph"
              onClick={onGraphButtonClick}
            />
            {currentNode.type == "recipe" && (
              <Button
                icon={<IoPersonAddOutline />}
                text="Share"
                onClick={onShareModalClick}
              />
            )}
          </>
        )}
        {isFolder && (
          <div className="select">
            <Select
              bg="rgb(241, 241, 241)"
              variant={"filled"}
              defaultValue={
                selectedNode ? (currentNode as IFolderNode).viewType : homeView
              }
              onChange={handleUpdateFolderView}
              height={35}
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </Select>
          </div>
        )}
      </div>
      {selectedNode && (
        <div className="profile-pic-container">
          {collabIcons &&
            collabIcons.map((icon, i) => (
              <div key={i} className="profile-pic-wrapper">
                <img alt="profile-pic" src={icon} />
                {/* <span className="tooltip">Author</span> */}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
