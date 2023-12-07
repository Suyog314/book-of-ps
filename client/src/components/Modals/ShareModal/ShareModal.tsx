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
import React, { useEffect, useState } from "react";

import "./ShareModal.scss";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  currentNodeState,
  refreshState,
  userSessionState,
} from "~/global/Atoms";
import { INodeProperty, makeINodeProperty } from "~/types";
import { FrontendNodeGateway } from "~/nodes";
import { FrontendUserGateway } from "~/users";

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
  const [error, setError] = useState("");
  const [newCollabEmails, setNewCollabEmails] = useState<string[]>(
    currentNode.collaborators ? currentNode.collaborators : []
  );

  useEffect(() => {
    setNewCollabEmails(
      currentNode.collaborators ? currentNode.collaborators : []
    );
  }, [currentNode]);

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

  // Reset our state variables and close the modal
  const handleClose = async () => {
    onClose();
    await handleUpdateShare(newCollabEmails);
    setUserToAdd("");
    setError("");
  };

  // event handler for the user query
  const handleAddChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserToAdd(event.target.value);
    setError("");
  };

  // Function to handle Enter key press
  const handleKeyPress = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      const userDbCheckResp = await FrontendUserGateway.findUserByEmail(
        userToAdd
      );
      if (!userDbCheckResp.success) {
        setError("User does not exist.");
        return;
      }
      if (userDbCheckResp.payload.email == userSession?.email) {
        setError("개새끼 don't add yourself.");
        return;
      }
      const newCollabUpdate = [userToAdd, ...newCollabEmails];
      setNewCollabEmails(newCollabUpdate);
      setUserToAdd("");
      setError("");
    }
  };

  // Remove item from newCollabs
  const handleRemoveUser = (userId: string) => {
    const newCollabUpdate: string[] = [];
    newCollabEmails.forEach((user) => {
      if (user == userId) {
        return;
      }
      newCollabUpdate.push(user);
    });
    setNewCollabEmails(newCollabUpdate);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Collaborators</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="share-add-wrapper">
              <div className="share-add-input">
                <Input
                  placeholder="Add people by email"
                  onChange={handleAddChange}
                  value={userToAdd}
                  onKeyDown={handleKeyPress}
                />
                <Button>hello</Button>
              </div>
            </div>
            <div className="share-list-wrapper">
              <ul className="share-list-people">
                {newCollabEmails &&
                  newCollabEmails.map((userId) => (
                    <li
                      key={userId} // each user has unique userId
                      className="share-list-item"
                    >
                      <div className="share-title">{newCollabEmails}</div>
                      <Button onClick={() => handleRemoveUser(userId)}>
                        Remove
                      </Button>
                    </li>
                  ))}
              </ul>
            </div>
          </ModalBody>
          <ModalFooter>
            {error && <div className="share-error">{error}</div>}
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  );
};
