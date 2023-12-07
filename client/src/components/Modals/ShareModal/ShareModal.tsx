import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useState } from "react";

import "./ShareModal.scss";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  currentNodeState,
  refreshState,
  userSessionState,
} from "~/global/Atoms";
import { INodeProperty, makeINodeProperty } from "~/types";
import { FrontendNodeGateway } from "~/nodes";

export interface IShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for moving a node to a new location
 */
export const ShareModal = (props: IShareModalProps) => {
  const { isOpen, onClose } = props;
  // state variables
  const userSession = useRecoilValue(userSessionState);
  const currentNode = useRecoilValue(currentNodeState);
  const [refresh, setRefresh] = useRecoilState(refreshState);
  const [userToAdd, setUserToAdd] = useState("");
  const [newCollabs, setNewCollabs] = useState<string[]>(
    currentNode.collaborators ? currentNode.collaborators : []
  );

  // updates the collaborators
  const handleUpdateShare = async (newCollabs: string[]) => {
    const nodeProperty: INodeProperty = makeINodeProperty(
      "collaborators",
      newCollabs
    );
    const updateResp = await FrontendNodeGateway.updateNode(
      currentNode.nodeId,
      [nodeProperty]
    );
    if (!updateResp.success) {
      console.error(updateResp.message);
      return;
    }
    setRefresh(!refresh);
  };

  // event handler for the user query
  const handleAddChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserToAdd(event.target.value);
  };

  // Reset our state variables and close the modal
  const handleClose = async () => {
    onClose();
    // await handleUpdateShare(newCollabs);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Collaborate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="share-add-wrapper">
              <div className="share-add-input">
                <Input
                  placeholder="Add people by email"
                  onChange={handleAddChange}
                  value={userToAdd}
                />
              </div>
              <div className="share-add-button">
                <Button>Add</Button>
              </div>
            </div>
            <div className="share-list-wrapper">
              <ul className="share-list-people">
                {newCollabs &&
                  newCollabs.map((userId) => (
                    <li
                      key={userId} // each user has unique userId
                      className="share-list-item"
                    >
                      <div className="share-title">{newCollabs}</div>
                      <Button>Remove</Button>
                    </li>
                  ))}
              </ul>
            </div>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  );
};
